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

  try {
    const apiKey = Deno.env.get('AIRTABLE_API_KEY');

    if (!apiKey) {
      console.error('Missing AIRTABLE_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [rateActionRecords, stateComparisonRecords, energyBurdenRecords, rateHistoryRecords, meetingRecords] =
      await Promise.all([
        fetchAllRecords(TABLES.rateActions, apiKey),
        fetchAllRecords(TABLES.stateComparison, apiKey),
        fetchAllRecords(TABLES.energyBurden, apiKey),
        fetchAllRecords(TABLES.rateHistory, apiKey),
        fetchAllRecords(TABLES.commissionMeetings, apiKey),
      ]);

    const rateActions = rateActionRecords.map((r) => ({
      id: r.id,
      title: r.fields['Action Title'] ?? '',
      utility: selectName(r.fields['Utility']),
      actionType: selectName(r.fields['Action Type']),
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

    return new Response(
      JSON.stringify({
        rateActions,
        stateComparison,
        energyBurden,
        rateHistory, // intentionally returned even though currently empty —
                     // frontend shows a "data collection in progress" note
                     // when this array is empty, rather than hiding the section.
        commissionMeetings,
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
