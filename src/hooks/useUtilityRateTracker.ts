import { useQuery } from "@tanstack/react-query";

export interface RateAction {
  id: string;
  title: string;
  utility: string;
  actionType: string;
  serviceType: string; // added: Electric/Natural Gas/Pipeline-Siting
  marketType: string; // added: MPSC/FCC/EGLE/Unregulated
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
  serviceType: string; // added: Electric/Natural Gas
  rateUnit: string; // added: ¢/kWh, $/MCF, $/Therm
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

// ── New types: Essential Services expansion (July 2026) ─────────────────────

export interface GeographicLookup {
  id: string;
  county: string;
  fips: string;
  population: number | null;
  medianIncome: number | null;
  blackPopulationPct: number | null;
  prosperityRegion: string;
  notes: string;
}

export interface ServiceProvider {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: string; // Electric/Natural Gas/Broadband/Water/Sewage/Pipeline-Siting
  providerCategory: string; // Investor-Owned/Municipal/Cooperative/Regional Authority
  regulatoryStatus: string; // MPSC/FCC/EGLE-Regulated/Unregulated
  primaryGeographyType: string;
  countiesServed: string[];
  geographicCoverageDescription: string;
  customerCount: number | null;
  dataCollectionMethod: string;
  dataSourceUrl: string;
  dataCollectionFrequency: string;
  lastDataUpdate: string;
  nextExpectedUpdate: string;
  dataCompleteness: string;
  notes: string;
}

export interface BroadbandAvailability {
  id: string;
  recordId: string;
  provider: string;
  zipCode: string;
  county: string;
  dataYear: number | null;
  technology: string;
  downloadSpeedMax: number | null;
  uploadSpeedMax: number | null;
  availabilityPct: number | null;
  availabilityAddressCount: number | null;
  monthlyPriceLow: number | null;
  monthlyPriceHigh: number | null;
  typicalMidTierPrice: number | null;
  dataCapPolicy: string;
  serviceFootprintType: string;
  coverageNotes: string;
  sourceDocument: string;
  dataFreshness: string;
  lastUpdated: string;
  notes: string;
}

export interface WaterSewageRate {
  id: string;
  recordId: string;
  provider: string;
  serviceType: string; // Water Supply/Sewage-Wastewater/Combined
  county: string;
  municipalityServiceArea: string;
  effectiveDate: string;
  customerChargeMonthly: number | null;
  waterCommodityRate: number | null;
  waterCommodityUnit: string;
  sewageCommodityRate: number | null;
  sewageCommodityUnit: string;
  stormwaterCharge: number | null;
  iwcCharge: number | null;
  typicalResidentialUsage: number | null;
  typicalUsageUnit: string;
  estimatedTypicalMonthlyBill: number | null;
  yoyChangePct: number | null;
  lastRateIncreaseDate: string;
  reasonForRateIncrease: string;
  residentialCustomerCount: number | null;
  countyMedianIncome: number | null;
  waterAffordabilityRatioPct: number | null;
  sourceDocument: string;
  dataCompleteness: string;
  notes: string;
}

interface UtilityRateTrackerResponse {
  rateActions: RateAction[];
  stateComparison: StateComparison[];
  energyBurden: EnergyBurden[];
  rateHistory: RateHistory[];
  commissionMeetings: CommissionMeeting[];
  // New tables
  geographicLookup: GeographicLookup[];
  serviceProviders: ServiceProvider[];
  broadbandAvailability: BroadbandAvailability[];
  waterSewageRates: WaterSewageRate[];
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

// ── New: County-level aggregation for the choropleth map ────────────────────

export interface CountyMetric {
  county: string;
  fips: string;
  population: number | null;
  medianIncome: number | null;
  blackPopulationPct: number | null;
  prosperityRegion: string;
  broadbandAvailabilityPct: number | null;
  broadbandRecordCount: number;
  waterAffordabilityPct: number | null;
  waterRecordCount: number;
}

interface CountyMetricsResponse {
  counties: CountyMetric[];
  fetchedAt: string;
  coverageNote: string;
}

async function fetchCountyMetrics(): Promise<CountyMetricsResponse> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/utility-rate-tracker/county-metrics`, {
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load county metrics. Please try again.");
  }

  return response.json();
}

export function useCountyMetrics() {
  return useQuery({
    queryKey: ["utility-rate-tracker", "county-metrics"],
    queryFn: fetchCountyMetrics,
    staleTime: 60 * 60 * 1000, // same freshness policy as the main tracker
  });
}
