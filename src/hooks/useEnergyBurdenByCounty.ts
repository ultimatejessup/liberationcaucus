import { useQuery } from "@tanstack/react-query";

// Pulls what the cartogram needs from the real, deployed utility-rate-tracker
// function (Supabase, v3, ACTIVE — verified directly). Energy burden,
// rate actions, and rate history all live here, not in
// michigan-essential-services. stateComparison/commissionMeetings are
// intentionally left out — those stay on their own standalone tabs with
// their own existing data path (useUtilityRateTracker.ts); duplicating them
// here would just be a second hook hitting the same endpoint for no reason.
//
// CORRECTED 2026-07-18: verified directly against the live database that
// EVERY row in energy_burden_by_race has geography_id = null. This table is
// genuinely statewide/national research-comparison data by race (citations
// like "ACEEE 2016 48-city study", "AHS 2017 data"), not per-county sampling
// at all. An earlier version of this hook filtered on `geographyType ===
// "county"`, which — given geography_id is always null — silently returned
// an empty/broken result for every county rather than failing loudly. Fixed
// by returning the data as what it actually is: a flat, statewide reference
// list, not scoped to any single county. See UtilityCountyCartogram.tsx for
// how this is now presented (as general context, clearly labeled as
// statewide, rather than implied to be county-specific).
//
// All three hooks below share ONE queryKey ("utility-rate-tracker") so
// TanStack Query dedupes them to a single network call, even though the
// cartogram uses all three simultaneously.

export interface EnergyBurdenEntry {
  id: string;
  geography: string; // always empty in current data — geography_id is null for every row
  geographyType: string; // always empty in current data, for the same reason
  racialGroup: string; // e.g. "Black / African American", "White (Non-Hispanic)", "Hispanic / Latino" — a statewide/national figure, not county-specific
  medianBurdenPct: number | null;
  dataYear: string; // often a citation label (e.g. "ACEEE 2016 (48-city study)"), not a literal year
  source: string;
  sourceUrl: string;
  notes: string;
}

export interface RateActionEntry {
  id: string;
  title: string;
  utility: string;
  actionType: string;
  serviceType: string;
  marketType: string;
  geography: string;
  geographyLevel: string;
  residentialMonthlyImpact: number | null;
  residentialPctIncrease: number | null;
  rateIncreasePercent: number | null;
  effectiveDate: string;
  decisionDate: string;
  caseNumber: string;
  sourceUrl: string;
  notes: string;
}

export interface RateHistoryEntry {
  id: string;
  utilityAndYear: string;
  utility: string;
  year: number | null;
  serviceType: string;
  rateUnit: string;
  rateCentsPerKwh: number | null;
  yoyChangePct: number | null;
  caseNumber: string;
  source: string;
  notes: string;
}

interface UtilityRateTrackerRaw {
  energyBurden: EnergyBurdenEntry[];
  rateActions: RateActionEntry[];
  rateHistory: RateHistoryEntry[];
}

async function fetchUtilityRateTrackerRaw(): Promise<UtilityRateTrackerRaw> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/utility-rate-tracker`, {
    headers: { apikey: anonKey, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load utility rate data. Please try again.");
  }

  const data = await response.json();
  return {
    energyBurden: data.energyBurden ?? [],
    rateActions: data.rateActions ?? [],
    rateHistory: data.rateHistory ?? [],
  };
}

const QUERY_KEY = ["utility-rate-tracker"];

// Renamed conceptually from "useEnergyBurdenByCounty" — this is NOT
// per-county data (see correction note above). Kept the export name for
// now to avoid touching every call site in the same pass; the JSDoc and the
// component-side usage make the real scope clear. Filters out rows with a
// null medianBurdenPct (a handful of source rows only tracked non-burden
// metadata) rather than showing empty entries.
export function useEnergyBurdenByCounty() {
  return useQuery<UtilityRateTrackerRaw, Error, EnergyBurdenEntry[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchUtilityRateTrackerRaw,
    staleTime: 60 * 60 * 1000,
    select: (data) => data.energyBurden.filter((r) => r.medianBurdenPct !== null),
  });
}

// Recent rate actions filed/decided for a given county, so a person can see
// what happened to their own area's rates, not just statewide totals.
// Filtering is a plain client-side name match against `geography` -- most
// rate actions are utility-wide (DTE, Consumers Energy) rather than
// county-specific, so this will often be empty for a given county; the
// component shows an honest "none on file for this county" state rather
// than hiding the section.
export function useRateActionsByCounty() {
  return useQuery<UtilityRateTrackerRaw, Error, RateActionEntry[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchUtilityRateTrackerRaw,
    staleTime: 60 * 60 * 1000,
    select: (data) => data.rateActions,
  });
}

export function useRateHistoryByCounty() {
  return useQuery<UtilityRateTrackerRaw, Error, RateHistoryEntry[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchUtilityRateTrackerRaw,
    staleTime: 60 * 60 * 1000,
    select: (data) => data.rateHistory,
  });
}
