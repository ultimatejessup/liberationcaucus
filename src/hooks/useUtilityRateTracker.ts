import { useQuery } from "@tanstack/react-query";

export interface RateAction {
  id: string;
  title: string;
  utility: string;
  actionType: string;
  amountApprovedM: number | null;
  amountRequestedM: number | null;
  pctOfRequestApproved: number | null;
  residentialMonthlyImpact: number | null;
  residentialPctIncrease: number | null;
  effectiveDate: string;
  decisionDate: string;
  caseNumber: string;
  customersAffected: number | null;
  justification: string;
  agPosition: string;
  sourceUrl: string;
  notes: string;
}

export interface StateComparison {
  id: string;
  state: string;
  abbreviation: string;
  group: string;
  avgRateCentsPerKwh: number | null;
  avgMonthlyBill: number | null;
  avgMonthlyUsageKwh: number | null;
  pctAboveBelowNational: number | null;
  marketStructure: string;
  gridMembership: string;
  dataPeriod: string;
  dataSource: string;
  rationale: string;
  yoyChangePct: number | null;
  notes: string;
}

export interface EnergyBurden {
  id: string;
  geography: string;
  geographyType: string;
  racialGroup: string;
  medianBurdenPct: number | null;
  highBurdenThresholdPct: number | null;
  pctHouseholdsHighBurden: number | null;
  pctAboveWhiteHouseholds: number | null;
  severeBurdenPct: number | null;
  lowIncomeMedianBurdenPct: number | null;
  dataYear: string;
  source: string;
  sourceUrl: string;
  notes: string;
}

export interface RateHistory {
  id: string;
  utilityAndYear: string;
  utility: string;
  year: number | null;
  rateCentsPerKwh: number | null;
  rateChangeM: number | null;
  yoyChangePct: number | null;
  caseNumber: string;
  source: string;
  notes: string;
}

export interface CommissionMeeting {
  id: string;
  title: string;
  date: string;
  meetingType: string;
  year: number | null;
  chair: string;
  commissionersPresent: string;
  keyActions: string;
  rateCasesOnAgenda: string;
  consentAgendaItems: number | null;
  minutesUrl: string;
  agendaUrl: string;
  dataCompleteness: string;
  notes: string;
}

interface UtilityRateTrackerResponse {
  rateActions: RateAction[];
  stateComparison: StateComparison[];
  energyBurden: EnergyBurden[];
  rateHistory: RateHistory[];
  commissionMeetings: CommissionMeeting[];
  fetchedAt: string;
}

async function fetchUtilityRateTracker(): Promise<UtilityRateTrackerResponse> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/utility-rate-tracker`, {
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load the utility rate tracker. Please try again.");
  }

  return response.json();
}

export function useUtilityRateTracker() {
  return useQuery({
    queryKey: ["utility-rate-tracker"],
    queryFn: fetchUtilityRateTracker,
    staleTime: 60 * 60 * 1000, // periodic-refresh reference data, same as Purple Book
  });
}
