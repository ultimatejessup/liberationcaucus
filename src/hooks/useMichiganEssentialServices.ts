import { useQuery } from "@tanstack/react-query";

// Matches the ACTUAL deployed michigan-essential-services edge function
// (Supabase, v2, ACTIVE) — verified by fetching the live function source
// directly (Supabase:get_edge_function), not inferred from an earlier
// chat's description of a draft. The draft queried a table called
// `essential_services_burden` that never existed in the live schema; the
// deployed version was corrected to query water_sewage_rates and
// broadband_availability_rates directly instead. If you're extending this,
// verify against the live function again rather than trusting prior notes —
// this same mistake (building against a described-but-unshipped shape)
// happened once already in this project.

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
  county: string; // plain name string — NOT a foreign key on this response; join client-side
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

export function aggregateByCounty(
  waterRates: WaterSewageRateEntry[],
  broadbandRates: BroadbandRateEntry[]
): Map<string, CountyAggregate> {
  const map = new Map<string, CountyAggregate>();

  const waterByCounty = new Map<string, number[]>();
  for (const w of waterRates) {
    if (!w.county || w.affordabilityRatioPct === null) continue;
    if (!waterByCounty.has(w.county)) waterByCounty.set(w.county, []);
    waterByCounty.get(w.county)!.push(w.affordabilityRatioPct);
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
