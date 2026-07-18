import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Inlined from _shared/cors.ts and _shared/supabase-client.ts ----
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
// ---- End inlined shared code ----

// v3 (2026-07-17): Adds `places[]`, previously missing entirely. County
// list nesting was blocked because geo_crosswalk had no place->county rows
// -- only zcta->county and zcta->place. Resolved by a direct point-in-polygon
// join (TIGER/Line 2025 place internal points vs. county boundary polygons,
// verified 745/745 matched, 5 spot-checked cities correct) and loaded as
// 745 real geo_crosswalk rows (parent_level='county', is_primary=true,
// source='TIGER/Line 2025 point-in-polygon join...'). This function now
// reads that crosswalk directly instead of returning county-only data.
//
// Response shape:
//   {
//     counties: [{ geoid, name, population, medianHouseholdIncome, povertyRatePct,
//                   prosperityRegion, raceBreakdown: [...] }],
//     places: [{ geoid, name, countyName, population, medianHouseholdIncome,
//                 povertyRatePct, raceBreakdown: [...] }],
//     waterSewageRates: [...],
//     broadbandRates: [...],
//     serviceProviders: [...],
//     zctaImportStatus: { imported, expectedTotal, pctComplete },
//     fetchedAt
//   }

const EXPECTED_ZCTA_TOTAL = 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getServiceClient();
    const url = new URL(req.url);
    const dataYear = Number(url.searchParams.get("year") ?? "2024");

    const [
      { data: countyRows, error: countyError },
      { data: placeRows, error: placeError },
      { data: waterRows, error: waterError },
      { data: broadbandRows, error: broadbandError },
      { data: providerRows, error: providerError },
      { count: zctaImported, error: zctaCountError },
    ] = await Promise.all([
      supabase
        .from("geographies")
        .select(
          `
          id, geoid, name, prosperity_region,
          geo_demographics!inner ( total_population, median_household_income, poverty_rate_pct, data_year ),
          geo_demographics_race ( race_category, population, pct_of_population )
        `
        )
        .eq("level", "county")
        .eq("geo_demographics.data_year", dataYear)
        .order("name"),
      // NEW: places, joined to their parent county via geo_crosswalk.
      // geo_crosswalk is queried separately (rather than a nested embed)
      // because Supabase's PostgREST nested-embed syntax doesn't cleanly
      // express "join through a junction table to get a sibling's name" --
      // simpler and more reliable to fetch both and join in JS below.
      supabase
        .from("geographies")
        .select(
          `
          id, geoid, name,
          geo_demographics!inner ( total_population, median_household_income, poverty_rate_pct, data_year ),
          geo_demographics_race ( race_category, population, pct_of_population )
        `
        )
        .eq("level", "place")
        .eq("geo_demographics.data_year", dataYear)
        .order("name"),
      supabase
        .from("water_sewage_rates")
        .select(
          `id, provider, service_type, municipality_service_area, effective_date, customer_charge_monthly,
           water_commodity_rate, sewage_commodity_rate, estimated_typical_monthly_bill, water_affordability_ratio_pct,
           county_median_income, residential_customer_count, data_completeness, notes,
           geographies ( name )`
        )
        .order("effective_date", { ascending: false }),
      supabase
        .from("broadband_availability_rates")
        .select(
          `id, provider, zip_code, technology, download_speed_max_mbps, upload_speed_max_mbps,
           availability_pct_of_zip, typical_mid_tier_price, service_footprint_type, data_freshness,
           county_geo:county_geography_id ( name ),
           zcta_geo:zcta_geography_id ( geoid )`
        )
        .order("last_updated", { ascending: false }),
      supabase
        .from("service_provider_registry")
        .select(
          `id, provider_id, provider_name, service_type, provider_category, regulatory_status,
           primary_geography_type, geographic_coverage_description, customer_count_residential,
           data_completeness, last_data_update`
        )
        .order("provider_name"),
      supabase
        .from("geographies")
        .select("id", { count: "exact", head: true })
        .eq("level", "zcta"),
    ]);

    for (const [name, err] of [
      ["geographies (county)", countyError],
      ["geographies (place)", placeError],
      ["water_sewage_rates", waterError],
      ["broadband_availability_rates", broadbandError],
      ["service_provider_registry", providerError],
      ["geographies (zcta count)", zctaCountError],
    ] as const) {
      if (err) throw new Error(`Supabase fetch failed for ${name}: ${err.message}`);
    }

    // Fetch the place->county crosswalk separately, keyed by place geography id.
    const placeIds = (placeRows ?? []).map((p: any) => p.id);
    let crosswalkByPlaceId = new Map<string, string>();
    if (placeIds.length > 0) {
      const { data: crosswalkRows, error: crosswalkError } = await supabase
        .from("geo_crosswalk")
        .select("child_geography_id, geographies!geo_crosswalk_parent_geography_id_fkey ( name )")
        .in("child_geography_id", placeIds)
        .eq("parent_level", "county")
        .eq("is_primary", true);

      if (crosswalkError) throw new Error(`Supabase fetch failed for geo_crosswalk: ${crosswalkError.message}`);

      crosswalkByPlaceId = new Map(
        (crosswalkRows ?? []).map((r: any) => [r.child_geography_id, r.geographies?.name ?? ""])
      );
    }

    const counties = (countyRows ?? []).map((g: any) => {
      const demo = g.geo_demographics?.[0];
      return {
        geoid: g.geoid,
        name: g.name,
        prosperityRegion: g.prosperity_region ?? "",
        population: demo?.total_population ?? null,
        medianHouseholdIncome: demo?.median_household_income ?? null,
        povertyRatePct: demo?.poverty_rate_pct ?? null,
        raceBreakdown: (g.geo_demographics_race ?? []).map((r: any) => ({
          category: r.race_category,
          population: r.population,
          pctOfPopulation: r.pct_of_population,
        })),
      };
    });

    const places = (placeRows ?? []).map((g: any) => {
      const demo = g.geo_demographics?.[0];
      return {
        geoid: g.geoid,
        name: g.name,
        countyName: crosswalkByPlaceId.get(g.id) ?? "",
        population: demo?.total_population ?? null,
        medianHouseholdIncome: demo?.median_household_income ?? null,
        povertyRatePct: demo?.poverty_rate_pct ?? null,
        raceBreakdown: (g.geo_demographics_race ?? []).map((r: any) => ({
          category: r.race_category,
          population: r.population,
          pctOfPopulation: r.pct_of_population,
        })),
      };
    });

    const waterSewageRates = (waterRows ?? []).map((w: any) => ({
      id: w.id,
      provider: w.provider ?? "",
      serviceType: w.service_type ?? "",
      county: w.geographies?.name ?? "",
      municipalityServiceArea: w.municipality_service_area ?? "",
      effectiveDate: w.effective_date ?? "",
      customerChargeMonthly: w.customer_charge_monthly,
      waterCommodityRate: w.water_commodity_rate,
      sewageCommodityRate: w.sewage_commodity_rate,
      estimatedTypicalMonthlyBill: w.estimated_typical_monthly_bill,
      affordabilityRatioPct: w.water_affordability_ratio_pct,
      countyMedianIncome: w.county_median_income,
      residentialCustomerCount: w.residential_customer_count,
      dataCompleteness: w.data_completeness ?? "",
      notes: w.notes ?? "",
    }));

    const broadbandRates = (broadbandRows ?? []).map((b: any) => ({
      id: b.id,
      provider: b.provider ?? "",
      zipCode: b.zip_code ?? "",
      county: b.county_geo?.name ?? "",
      zctaResolved: Boolean(b.zcta_geo?.geoid),
      technology: b.technology ?? "",
      downloadSpeedMaxMbps: b.download_speed_max_mbps,
      uploadSpeedMaxMbps: b.upload_speed_max_mbps,
      availabilityPctOfZip: b.availability_pct_of_zip,
      typicalMidTierPrice: b.typical_mid_tier_price,
      serviceFootprintType: b.service_footprint_type ?? "",
      dataFreshness: b.data_freshness ?? "",
    }));

    const serviceProviders = (providerRows ?? []).map((p) => ({
      id: p.id,
      providerId: p.provider_id ?? "",
      providerName: p.provider_name ?? "",
      serviceType: p.service_type ?? "",
      providerCategory: p.provider_category ?? "",
      regulatoryStatus: p.regulatory_status ?? "",
      primaryGeographyType: p.primary_geography_type ?? "",
      geographicCoverageDescription: p.geographic_coverage_description ?? "",
      customerCountResidential: p.customer_count_residential,
      dataCompleteness: p.data_completeness ?? "",
      lastDataUpdate: p.last_data_update ?? "",
    }));

    const imported = zctaImported ?? 0;

    return jsonResponse({
      counties,
      places,
      waterSewageRates,
      broadbandRates,
      serviceProviders,
      zctaImportStatus: {
        imported,
        expectedTotal: EXPECTED_ZCTA_TOTAL,
        pctComplete: Math.round((imported / EXPECTED_ZCTA_TOTAL) * 1000) / 10,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Michigan Essential Services fetch error:", error);
    return jsonResponse({ error: "Unable to load Michigan Essential Services data. Please try again later." }, 500);
  }
});
