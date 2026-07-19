import { useQuery } from "@tanstack/react-query";

// Pulls what the cartogram needs from the real, deployed utility-rate-tracker
// function (Supabase, v3, ACTIVE — verified directly). Energy burden,
// rate actions, and rate history all live here, not in
// michigan-essential-services. stateComparison/commissionMeetings are
// intentionally left out — those stay on their own standalone tabs with
// their own existing data path (useUtilityRateTracker.ts); duplicating them
// here would just be a second hook hitting the same endpoint for no reason.
//
// All three hooks below share ONE queryKey ("utility-rate-tracker") so
// TanStack Query dedupes them to a single network call, even though the
// cartogram uses all three simultaneously.

export interface EnergyBurdenEntry {
  id: string;
  geography: string; // county/state name — plain string, join client-side by name
  geographyType: string; // 'county' | 'state' | etc — filter to 'county' for the map layer
  racialGroup: string; // e.g. "Black", "White", "Hispanic" — this is a race-specific burden, not an overall county figure
  medianBurdenPct: number | null;
  dataYear: string;
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

export function useEnergyBurdenByCounty() {
  return useQuery<UtilityRateTrackerRaw, Error, EnergyBurdenEntry[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchUtilityRateTrackerRaw,
    staleTime: 60 * 60 * 1000,
    select: (data) => data.energyBurden.filter((r) => r.geographyType === "county"),
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
