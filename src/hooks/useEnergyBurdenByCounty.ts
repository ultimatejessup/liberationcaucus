import { useQuery } from "@tanstack/react-query";

// Pulls only what the cartogram needs from the real, deployed
// utility-rate-tracker function (Supabase, v3, ACTIVE — verified directly).
// Energy burden is NOT in michigan-essential-services; it lives here,
// keyed by race_ethnicity within a geography, not as a single per-county
// number. rateActions/stateComparison/commissionMeetings/rateHistory also
// come from this same function but are intentionally left out of this hook
// — those stay on their own standalone tabs and already have their own
// data path; duplicating them here would just be two hooks hitting the
// same endpoint for no reason.

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

async function fetchEnergyBurden(): Promise<EnergyBurdenEntry[]> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/utility-rate-tracker`, {
    headers: { apikey: anonKey, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load energy burden data. Please try again.");
  }

  const data = await response.json();
  return data.energyBurden ?? [];
}

export function useEnergyBurdenByCounty() {
  return useQuery({
    queryKey: ["utility-rate-tracker", "energy-burden"],
    queryFn: fetchEnergyBurden,
    staleTime: 60 * 60 * 1000,
    select: (rows) => rows.filter((r) => r.geographyType === "county"),
  });
}
