import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE_ID = 'app52cXTJkade4Mpn';
const TABLES = {
  rateActions: 'tblJjH36f1GQPEQHg',
  stateComparison: 'tbl7HjrlFR3913UtG',
  energyBurden: 'tblJuWV7mpEywmAra',
  rateHistory: 'tblDsCKpSDafVaJTu',
  commissionMeetings: 'tblKqNMR497EQCzXV',
  // Data Collection Tasks (tblou8yowfCciFIbZ) is an internal workflow table,
  // not public-facing data, and is intentionally not fetched here.

  // ── Added July 2026: Essential Services expansion (broadband + water) ──
  geographicLookup: 'tblQMbKpqIczjD2dt',
  serviceProviderRegistry: 'tblVPSCQ3JZlJ65CG',
  broadbandRates: 'tbluYgAkTFz7ZXjlo',
  waterSewageRates: 'tblMHXV5gXX0OUatG',
};

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

// Airtable singleSelect fields return {id, name, color}; this flattens them to
// the plain display name so the frontend doesn't need to know about Airtable's
// internal option-record shape.
function selectName(value: unknown): string {
  if (value && typeof value === 'object' && 'name' in value) {
    return (value as { name: string }).name;
  }
  return (value as string) ?? '';
}

// multipleSelects fields return an array of {id, name, color}; same idea, but
// for arrays. Used by Service Provider Registry's "Counties Served" field.
function selectNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => selectName(v)).filter(Boolean);
}

async function fetchAllRecords(tableId: string, apiKey: string): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable fetch failed for ${tableId}: ${res.status} ${text}`);
    }

    const data = await res.json();
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);

  return records;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    const apiKey = Deno.env.get('AIRTABLE_API_KEY');

    if (!apiKey) {
      console.error('Missing AIRTABLE_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Route: /county-metrics ──────────────────────────────────────────
    // Aggregates broadband + water + demographic data to the county level
    // for the choropleth map. Kept as a distinct code path (rather than a
    // separate function) so it shares the same Airtable fetch helpers and
    // deploys/authenticates identically to the main tracker endpoint.
    if (url.pathname.endsWith('/county-metrics')) {
      const [geoRecords, broadbandRecords, waterRecords] = await Promise.all([
        fetchAllRecords(TABLES.geographicLookup, apiKey),
        fetchAllRecords(TABLES.broadbandRates, apiKey),
        fetchAllRecords(TABLES.waterSewageRates, apiKey),
      ]);

      // Geographic Lookup is keyed by county name (v1 schema; see field
      // "Geography Key (County Name - v1)" — ZIP-level expansion is a v2
      // item pending bulk Census/FCC data access beyond this session's scope).
      const countyData: Record<string, {
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
      }> = {};

      for (const r of geoRecords) {
        const county = (r.fields['Geography Key (County Name - v1)'] as string) ?? '';
        if (!county) continue;
        countyData[county] = {
          county,
          fips: (r.fields['FIPS County Code'] as string) ?? '',
          population: (r.fields['Population (2024 ACS 5-Yr Est.)'] as number) ?? null,
          medianIncome: (r.fields['Median Household Income (2023 ACS 5-Yr Est.)'] as number) ?? null,
          blackPopulationPct: (r.fields['Black Population % (2023 ACS 5-Yr Est.)'] as number) ?? null,
          prosperityRegion: selectName(r.fields['Prosperity Region']),
          broadbandAvailabilityPct: null,
          broadbandRecordCount: 0,
          waterAffordabilityPct: null,
          waterRecordCount: 0,
        };
      }

      // Aggregate broadband availability by county (simple average across
      // all provider x ZIP records currently tagged to that county).
      const broadbandByCounty: Record<string, number[]> = {};
      for (const r of broadbandRecords) {
        const county = (r.fields['County'] as string) ?? '';
        const avail = r.fields['Availability (% of ZIP)'] as number | null;
        if (!county || avail === null || avail === undefined) continue;
        (broadbandByCounty[county] ??= []).push(avail);
      }
      for (const [county, values] of Object.entries(broadbandByCounty)) {
        if (countyData[county]) {
          countyData[county].broadbandAvailabilityPct =
            Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
          countyData[county].broadbandRecordCount = values.length;
        }
      }

      // Aggregate water affordability ratio by county (simple average across
      // all municipality records currently sampled in that county).
      const waterByCounty: Record<string, number[]> = {};
      for (const r of waterRecords) {
        const county = (r.fields['County'] as string) ?? '';
        const ratio = r.fields['Water Affordability Ratio (%)'] as number | null;
        if (!county || ratio === null || ratio === undefined) continue;
        (waterByCounty[county] ??= []).push(ratio);
      }
      for (const [county, values] of Object.entries(waterByCounty)) {
        if (countyData[county]) {
          countyData[county].waterAffordabilityPct =
            Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
          countyData[county].waterRecordCount = values.length;
        }
      }

      return new Response(
        JSON.stringify({
          counties: Object.values(countyData),
          fetchedAt: new Date().toISOString(),
          // Honest coverage note for the frontend to display — most counties
          // will have zero broadband/water records until sampling expands.
          coverageNote:
            'Broadband and water metrics are populated only for counties with at least one sampled record. Absence of a value means "not yet sampled," not "zero" or "unavailable."',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Default route: full tracker payload (existing + new tables) ──────
    const [
      rateActionRecords,
      stateComparisonRecords,
      energyBurdenRecords,
      rateHistoryRecords,
      meetingRecords,
      geoRecords,
      providerRecords,
      broadbandRecords,
      waterRecords,
    ] = await Promise.all([
      fetchAllRecords(TABLES.rateActions, apiKey),
      fetchAllRecords(TABLES.stateComparison, apiKey),
      fetchAllRecords(TABLES.energyBurden, apiKey),
      fetchAllRecords(TABLES.rateHistory, apiKey),
      fetchAllRecords(TABLES.commissionMeetings, apiKey),
      fetchAllRecords(TABLES.geographicLookup, apiKey),
      fetchAllRecords(TABLES.serviceProviderRegistry, apiKey),
      fetchAllRecords(TABLES.broadbandRates, apiKey),
      fetchAllRecords(TABLES.waterSewageRates, apiKey),
    ]);

    const rateActions = rateActionRecords.map((r) => ({
      id: r.id,
      title: r.fields['Action Title'] ?? '',
      utility: selectName(r.fields['Utility']),
      actionType: selectName(r.fields['Action Type']),
      serviceType: selectName(r.fields['Service Type']), // added: Electric/Natural Gas/Pipeline-Siting
      marketType: selectName(r.fields['Market Type']), // added: MPSC/FCC/EGLE/Unregulated
      amountApprovedM: r.fields['Amount Approved ($M)'] ?? null,
      amountRequestedM: r.fields['Amount Requested ($M)'] ?? null,
      pctOfRequestApproved: r.fields['Pct of Request Approved'] ?? null,
      residentialMonthlyImpact: r.fields['Residential Monthly Impact ($)'] ?? null,
      residentialPctIncrease: r.fields['Residential Pct Increase'] ?? null,
      effectiveDate: r.fields['Effective Date'] ?? '',
      decisionDate: r.fields['Decision Date'] ?? '',
      caseNumber: r.fields['Case Number'] ?? '',
      customersAffected: r.fields['Customers Affected'] ?? null,
      justification: r.fields['Justification'] ?? '',
      agPosition: r.fields['AG Position'] ?? '',
      sourceUrl: r.fields['Source URL'] ?? '',
      notes: r.fields['Notes'] ?? '',
    }));

    const stateComparison = stateComparisonRecords.map((r) => ({
      id: r.id,
      state: r.fields['State'] ?? '',
      abbreviation: r.fields['Abbreviation'] ?? '',
      group: selectName(r.fields['Group']),
      avgRateCentsPerKwh: r.fields['Avg Residential Rate (¢/kWh)'] ?? null,
      avgMonthlyBill: r.fields['Avg Monthly Bill ($)'] ?? null,
      avgMonthlyUsageKwh: r.fields['Avg Monthly Usage (kWh)'] ?? null,
      pctAboveBelowNational: r.fields['Pct Above/Below Natl Avg'] ?? null,
      marketStructure: selectName(r.fields['Market Structure']),
      gridMembership: selectName(r.fields['Grid Membership']),
      dataPeriod: r.fields['Data Period'] ?? '',
      dataSource: r.fields['Data Source'] ?? '',
      rationale: r.fields['Comparison Rationale'] ?? '',
      yoyChangePct: r.fields['YOY Change (%)'] ?? null,
      notes: r.fields['Notes'] ?? '',
    }));

    const energyBurden = energyBurdenRecords.map((r) => ({
      id: r.id,
      geography: r.fields['Geography'] ?? '',
      geographyType: selectName(r.fields['Geography Type']),
      racialGroup: selectName(r.fields['Racial Group']),
      medianBurdenPct: r.fields['Median Energy Burden (%)'] ?? null,
      highBurdenThresholdPct: r.fields['High Burden Threshold (%)'] ?? null,
      pctHouseholdsHighBurden: r.fields['Pct Households High Burden'] ?? null,
      pctAboveWhiteHouseholds: r.fields['Pct Above White Households'] ?? null,
      severeBurdenPct: r.fields['Severe Burden Pct (>10%)'] ?? null,
      lowIncomeMedianBurdenPct: r.fields['Low-Income Median Burden (%)'] ?? null,
      dataYear: r.fields['Data Year'] ?? '',
      source: r.fields['Source'] ?? '',
      sourceUrl: r.fields['Source URL'] ?? '',
      notes: r.fields['Notes'] ?? '',
    }));

    const rateHistory = rateHistoryRecords.map((r) => ({
      id: r.id,
      utilityAndYear: r.fields['Utility + Year'] ?? '',
      utility: selectName(r.fields['Utility']),
      serviceType: selectName(r.fields['Service Type']), // added: Electric/Natural Gas
      rateUnit: selectName(r.fields['Rate Unit']), // added: ¢/kWh, $/MCF, $/Therm
      year: r.fields['Year'] ?? null,
      rateCentsPerKwh: r.fields['Residential Rate (¢/kWh)'] ?? null,
      rateChangeM: r.fields['Rate Change ($M)'] ?? null,
      yoyChangePct: r.fields['YOY Change (%)'] ?? null,
      caseNumber: r.fields['Case Number'] ?? '',
      source: r.fields['Source'] ?? '',
      notes: r.fields['Notes'] ?? '',
    }));

    const commissionMeetings = meetingRecords.map((r) => ({
      id: r.id,
      title: r.fields['Meeting Title'] ?? '',
      date: r.fields['Meeting Date'] ?? '',
      meetingType: selectName(r.fields['Meeting Type']),
      year: r.fields['Year'] ?? null,
      chair: r.fields['Chair'] ?? '',
      commissionersPresent: r.fields['Commissioners Present'] ?? '',
      keyActions: r.fields['Key Actions Taken'] ?? '',
      rateCasesOnAgenda: r.fields['Rate Cases on Agenda'] ?? '',
      consentAgendaItems: r.fields['Consent Agenda Items'] ?? null,
      minutesUrl: r.fields['Minutes URL'] ?? '',
      agendaUrl: r.fields['Agenda URL'] ?? '',
      dataCompleteness: selectName(r.fields['Data Completeness']),
      notes: r.fields['Notes'] ?? '',
    }));

    // ── New: Geographic Lookup (county-level reference data) ──────────────
    const geographicLookup = geoRecords.map((r) => ({
      id: r.id,
      county: r.fields['Geography Key (County Name - v1)'] ?? '',
      fips: r.fields['FIPS County Code'] ?? '',
      population: r.fields['Population (2024 ACS 5-Yr Est.)'] ?? null,
      medianIncome: r.fields['Median Household Income (2023 ACS 5-Yr Est.)'] ?? null,
      blackPopulationPct: r.fields['Black Population % (2023 ACS 5-Yr Est.)'] ?? null,
      prosperityRegion: selectName(r.fields['Prosperity Region']),
      notes: r.fields['Notes'] ?? '',
    }));

    // ── New: Service Provider Registry ─────────────────────────────────────
    const serviceProviders = providerRecords.map((r) => ({
      id: r.id,
      providerId: r.fields['Provider ID'] ?? '',
      providerName: r.fields['Provider Name'] ?? '',
      serviceType: selectName(r.fields['Service Type']),
      providerCategory: selectName(r.fields['Provider Category']),
      regulatoryStatus: selectName(r.fields['Regulatory Status']),
      primaryGeographyType: selectName(r.fields['Primary Geography Type']),
      countiesServed: selectNames(r.fields['Counties Served']),
      geographicCoverageDescription: r.fields['Geographic Coverage Description'] ?? '',
      customerCount: r.fields['Customer Count (Residential)'] ?? null,
      dataCollectionMethod: selectName(r.fields['Data Collection Method']),
      dataSourceUrl: r.fields['Data Source URL'] ?? '',
      dataCollectionFrequency: selectName(r.fields['Data Collection Frequency']),
      lastDataUpdate: r.fields['Last Data Update'] ?? '',
      nextExpectedUpdate: r.fields['Next Expected Update'] ?? '',
      dataCompleteness: selectName(r.fields['Data Completeness']),
      notes: r.fields['Notes'] ?? '',
    }));

    // ── New: Broadband Availability & Rates ────────────────────────────────
    const broadbandAvailability = broadbandRecords.map((r) => ({
      id: r.id,
      recordId: r.fields['Record ID'] ?? '',
      provider: r.fields['Provider'] ?? '',
      zipCode: r.fields['ZIP Code'] ?? '',
      county: r.fields['County'] ?? '',
      dataYear: r.fields['Data Year'] ?? null,
      technology: selectName(r.fields['Technology']),
      downloadSpeedMax: r.fields['Download Speed Max (Mbps)'] ?? null,
      uploadSpeedMax: r.fields['Upload Speed Max (Mbps)'] ?? null,
      availabilityPct: r.fields['Availability (% of ZIP)'] ?? null,
      availabilityAddressCount: r.fields['Availability (Address Count)'] ?? null,
      monthlyPriceLow: r.fields['Monthly Price Low ($)'] ?? null,
      monthlyPriceHigh: r.fields['Monthly Price High ($)'] ?? null,
      typicalMidTierPrice: r.fields['Typical Mid-Tier Price ($)'] ?? null,
      dataCapPolicy: r.fields['Data Cap Policy'] ?? '',
      serviceFootprintType: selectName(r.fields['Service Footprint Type']),
      coverageNotes: r.fields['Coverage Notes'] ?? '',
      sourceDocument: r.fields['Source Document'] ?? '',
      dataFreshness: selectName(r.fields['Data Freshness']),
      lastUpdated: r.fields['Last Updated'] ?? '',
      notes: r.fields['Notes'] ?? '',
    }));

    // ── New: Water/Sewage Rates & Usage ────────────────────────────────────
    const waterSewageRates = waterRecords.map((r) => ({
      id: r.id,
      recordId: r.fields['Record ID'] ?? '',
      provider: r.fields['Provider'] ?? '',
      serviceType: selectName(r.fields['Service Type']),
      county: r.fields['County'] ?? '',
      municipalityServiceArea: r.fields['Municipality/Service Area'] ?? '',
      effectiveDate: r.fields['Effective Date'] ?? '',
      customerChargeMonthly: r.fields['Customer Charge (Monthly)'] ?? null,
      waterCommodityRate: r.fields['Water Commodity Rate'] ?? null,
      waterCommodityUnit: selectName(r.fields['Water Commodity Unit']),
      sewageCommodityRate: r.fields['Sewage Commodity Rate'] ?? null,
      sewageCommodityUnit: selectName(r.fields['Sewage Commodity Unit']),
      stormwaterCharge: r.fields['Stormwater Charge (Monthly)'] ?? null,
      iwcCharge: r.fields['IWC (Industrial Waste Control) Charge'] ?? null,
      typicalResidentialUsage: r.fields['Typical Residential Usage (Monthly)'] ?? null,
      typicalUsageUnit: selectName(r.fields['Typical Usage Unit']),
      estimatedTypicalMonthlyBill: r.fields['Estimated Typical Monthly Bill'] ?? null,
      yoyChangePct: r.fields['Year-over-Year Change (%)'] ?? null,
      lastRateIncreaseDate: r.fields['Last Rate Increase Date'] ?? '',
      reasonForRateIncrease: r.fields['Reason for Rate Increase'] ?? '',
      residentialCustomerCount: r.fields['Residential Customer Count'] ?? null,
      countyMedianIncome: r.fields['County Median Income'] ?? null,
      waterAffordabilityRatioPct: r.fields['Water Affordability Ratio (%)'] ?? null,
      sourceDocument: r.fields['Source Document'] ?? '',
      dataCompleteness: selectName(r.fields['Data Completeness']),
      notes: r.fields['Notes'] ?? '',
    }));

    return new Response(
      JSON.stringify({
        rateActions,
        stateComparison,
        energyBurden,
        rateHistory, // intentionally returned even though currently empty —
                     // frontend shows a "data collection in progress" note
                     // when this array is empty, rather than hiding the section.
        commissionMeetings,
        // ── New tables (Essential Services expansion, July 2026) ──────────
        geographicLookup,
        serviceProviders,
        broadbandAvailability,
        waterSewageRates,
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Utility Rate Tracker fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to load the rate tracker. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
