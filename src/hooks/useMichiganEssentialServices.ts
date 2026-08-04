import { useQuery } from "@tanstack/react-query";

// Matches the ACTUAL deployed michigan-essential-services edge function
// (Supabase, v6, ACTIVE — verified by fetching the live function source
// directly via Supabase:get_edge_function, not inferred from a description).
// v6 adds `serviceCounties` to each water/sewage rate entry (see
// WaterSewageRateEntry below) — verify against the live function again
// before extending this further; a described-but-unshipped shape has caused
// real bugs in this project before.

export interface CountyEntry {
  geoid: string;
  name: string;
  prosperityRegion: string;
  population: number | null;
  medianHouseholdIncome: number | null;
  povertyRatePct: number | null;
  raceBreakdown: Array<{
    category: string;
    population: number | null;
    pctOfPopulation: number | null;
  }>;
}

// NEW (v3 edge function, 2026-07-17): places, each carrying its real parent
// county name via geo_crosswalk -- built from a TIGER/Line 2025 point-in-
// polygon join (place internal point vs. county boundary), 745/745 places
// matched, spot-checked correct. See RECONCILIATION.md for the full trail.
export interface PlaceEntry {
  geoid: string;
  name: string;
  countyName: string;
  population: number | null;
  medianHouseholdIncome: number | null;
  povertyRatePct: number | null;
  raceBreakdown: Array<{
    category: string;
    population: number | null;
    pctOfPopulation: number | null;
  }>;
}

export interface WaterSewageRateEntry {
  id: string;
  provider: string;
  serviceType: string;
  county: string; // PRIMARY county only (the city this rate was researched for) — kept for backward compat
  serviceCounties: string[]; // NEW (v6 edge function, 2026-07-20): every county this utility actually serves,
  // researched directly per utility (not assumed) — see water_sewage_service_counties migration notes.
  // Use this, not `county`, for anything that should reflect the utility's real footprint (e.g. the map layer).
  municipalityServiceArea: string;
  effectiveDate: string;
  customerChargeMonthly: number | null;
  waterCommodityRate: number | null;
  sewageCommodityRate: number | null;
  estimatedTypicalMonthlyBill: number | null;
  affordabilityRatioPct: number | null;
  countyMedianIncome: number | null;
  residentialCustomerCount: number | null;
  dataCompleteness: string;
  notes: string;
}

export interface BroadbandRateEntry {
  id: string;
  provider: string;
  zipCode: string;
  county: string; // plain name string, same caveat as above
  zctaResolved: boolean;
  technology: string;
  downloadSpeedMaxMbps: number | null;
  uploadSpeedMaxMbps: number | null;
  availabilityPctOfZip: number | null; // a real availability %, NOT an affordability ratio — different unit than water
  typicalMidTierPrice: number | null;
  serviceFootprintType: string;
  dataFreshness: string;
}

// NEW (v7 edge function, 2026-08-04): real Michigan county-level energy
// burden from the DOE/NREL LEAD Tool. Genuinely per-county -- unlike the
// energy_burden_by_race data surfaced by useEnergyBurdenByCounty.ts, which
// is ACEEE/national-metro-only. Deliberately has NO race field -- county
// race composition comes from CountyEntry.raceBreakdown above and should be
// shown alongside this, never merged into a derived "burden by race" number
// the underlying source doesn't actually support.
export interface EnergyBurdenLeadEntry {
  id: string;
  county: string;
  fplBracket: string; // '0-100%' | '100-150%' | '150-200%' | '200-400%' | '400%+' | 'ALL' (weighted county-wide figure)
  estimatedHouseholds: number | null;
  avgAnnualHouseholdIncome: number | null;
  avgAnnualEnergyCost: number | null;
  energyBurdenPct: number | null;
  dataYear: number | null;
}

export interface ServiceProviderEntry {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  providerCategory: string;
  regulatoryStatus: string;
  primaryGeographyType: string;
  geographicCoverageDescription: string;
  customerCountResidential: number | null;
  dataCompleteness: string;
  lastDataUpdate: string;
}

interface ZctaImportStatus {
  imported: number;
  expectedTotal: number;
  pctComplete: number;
}

interface MichiganEssentialServicesResponse {
  counties: CountyEntry[];
  places: PlaceEntry[];
  waterSewageRates: WaterSewageRateEntry[];
  broadbandRates: BroadbandRateEntry[];
  energyBurdenLead: EnergyBurdenLeadEntry[];
  serviceProviders: ServiceProviderEntry[];
  zctaImportStatus: ZctaImportStatus;
  fetchedAt: string;
}

async function fetchMichiganEssentialServices(): Promise<MichiganEssentialServicesResponse> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/michigan-essential-services`, {
    headers: { apikey: anonKey, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load Michigan Essential Services data. Please try again.");
  }

  return response.json();
}

export function useMichiganEssentialServices() {
  return useQuery({
    queryKey: ["michigan-essential-services"],
    queryFn: fetchMichiganEssentialServices,
    staleTime: 60 * 60 * 1000,
  });
}

// ── Client-side county aggregation ──────────────────────────────────────────
// The edge function returns waterSewageRates/broadbandRates as flat arrays
// keyed by a plain county-name string, not pre-aggregated. This mirrors what
// the /county-metrics endpoint did in the old Airtable-backed version — that
// aggregation logic just needs to live in the frontend now instead of a
// dedicated backend route, since one doesn't exist for this shape.

export interface CountyAggregate {
  waterAffordabilityRatioPct: number | null; // simple average across all sampled providers in the county
  waterRecordCount: number;
  broadbandAvailabilityPct: number | null; // simple average across all sampled ZIPs/providers in the county
  broadbandRecordCount: number;
}

export function groupPlacesByCounty(places: PlaceEntry[]): Map<string, PlaceEntry[]> {
  const map = new Map<string, PlaceEntry[]>();
  for (const p of places) {
    if (!p.countyName) continue;
    if (!map.has(p.countyName)) map.set(p.countyName, []);
    map.get(p.countyName)!.push(p);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

// Groups LEAD burden rows by county, with 'ALL' (the weighted county-wide
// figure) sorted first so callers can grab [0] for the headline number,
// followed by the five FPL brackets in ascending income order for a
// low-to-high income-tier breakdown.
const FPL_BRACKET_ORDER = ["ALL", "0-100%", "100-150%", "150-200%", "200-400%", "400%+"];

export function groupEnergyBurdenLeadByCounty(
  rows: EnergyBurdenLeadEntry[]
): Map<string, EnergyBurdenLeadEntry[]> {
  const map = new Map<string, EnergyBurdenLeadEntry[]>();
  for (const r of rows) {
    if (!r.county) continue;
    if (!map.has(r.county)) map.set(r.county, []);
    map.get(r.county)!.push(r);
  }
  for (const list of map.values()) {
    list.sort((a, b) => FPL_BRACKET_ORDER.indexOf(a.fplBracket) - FPL_BRACKET_ORDER.indexOf(b.fplBracket));
  }
  return map;
}

export function aggregateByCounty(
  waterRates: WaterSewageRateEntry[],
  broadbandRates: BroadbandRateEntry[]
): Map<string, CountyAggregate> {
  const map = new Map<string, CountyAggregate>();

  // Expand each water record across every county it actually serves (not
  // just the primary/originally-sampled one) — a rate record with a real
  // multi-county footprint (e.g. Grand Rapids Water System serves Kent AND
  // Ottawa) now contributes its affordability figure to both counties, not
  // just the one where the sampled city sits. Falls back to `county` alone
  // if `serviceCounties` is ever missing/empty, so this degrades safely
  // rather than dropping the record entirely.
  const waterByCounty = new Map<string, number[]>();
  for (const w of waterRates) {
    if (w.affordabilityRatioPct === null) continue;
    const counties = w.serviceCounties?.length ? w.serviceCounties : w.county ? [w.county] : [];
    for (const county of counties) {
      if (!waterByCounty.has(county)) waterByCounty.set(county, []);
      waterByCounty.get(county)!.push(w.affordabilityRatioPct);
    }
  }

  const broadbandByCounty = new Map<string, number[]>();
  for (const b of broadbandRates) {
    if (!b.county || b.availabilityPctOfZip === null) continue;
    if (!broadbandByCounty.has(b.county)) broadbandByCounty.set(b.county, []);
    broadbandByCounty.get(b.county)!.push(b.availabilityPctOfZip);
  }

  const allCounties = new Set([...waterByCounty.keys(), ...broadbandByCounty.keys()]);
  for (const county of allCounties) {
    const waterVals = waterByCounty.get(county) ?? [];
    const broadbandVals = broadbandByCounty.get(county) ?? [];
    map.set(county, {
      waterAffordabilityRatioPct:
        waterVals.length > 0
          ? Math.round((waterVals.reduce((a, b) => a + b, 0) / waterVals.length) * 100) / 100
          : null,
      waterRecordCount: waterVals.length,
      broadbandAvailabilityPct:
        broadbandVals.length > 0
          ? Math.round((broadbandVals.reduce((a, b) => a + b, 0) / broadbandVals.length) * 10) / 10
          : null,
      broadbandRecordCount: broadbandVals.length,
    });
  }

  return map;
}
