import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Inlined from _shared/cors.ts and _shared/supabase-client.ts ----
// Every edge function is fully self-contained (no relative imports across
// function folders) after a deploy failed with "Module not found
// .../_shared/cors.ts" -- whatever deploy path was used only sent up the
// single index.ts, not the sibling _shared/ folder. Inlining removes that
// entire class of deploy-structure problem regardless of how each function
// gets deployed going forward.

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

// Rewritten against the ACTUAL live schema (post reconciliation_migration.sql).
// Key differences from the original draft:
//   - mpsc_rate_actions/energy_burden_by_race now use geography_id -> geographies
//     (uuid), not the retired county_id/free-text pair.
//   - state_rate_comparison now uses state_id -> geo_states, not free-text
//     state/abbreviation columns.
//   - utility_rate_history_mi has no `utility` lookup table -- `utility` is
//     still plain text on that table (not part of this migration's scope),
//     and `utility_year` is now computed here instead of stored, since the
//     redundant stored column was dropped.
//   - There is no `utilities` lookup table at all in the live schema; MPSC
//     rate actions store `utility_name` as plain text directly.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getServiceClient();

    const [
      { data: rateActionRows, error: rateActionsError },
      { data: stateComparisonRows, error: stateComparisonError },
      { data: energyBurdenRows, error: energyBurdenError },
      { data: rateHistoryRows, error: rateHistoryError },
      { data: meetingRows, error: meetingsError },
    ] = await Promise.all([
      supabase
        .from("mpsc_rate_actions")
        .select(
          `id, action_title, utility_name, action_type, amount_approved_millions, amount_requested_millions,
           residential_monthly_impact, residential_pct_increase, effective_date, decision_date, filing_date,
           case_number, customers_affected, justification, ag_position, source_url, notes, service_type, market_type,
           rate_increase_percent, energy_burden_before, energy_burden_after,
           geographies ( name, level )`
        )
        .order("decision_date", { ascending: false }),
      supabase
        .from("state_rate_comparison")
        .select(
          `id, comparison_group, avg_residential_rate_cents_kwh, avg_monthly_bill, avg_monthly_usage_kwh,
           pct_above_below_natl_avg, market_structure, grid_membership, data_period, data_source,
           comparison_rationale, yoy_change_pct, notes,
           geo_states ( name, abbreviation )`
        ),
      supabase
        .from("energy_burden_by_race")
        .select(
          `id, race_ethnicity, energy_burden_percent, median_household_income, population,
           high_burden_threshold_pct, pct_households_high_burden, pct_above_white_households,
           severe_burden_pct, low_income_median_burden_pct, data_year, source, source_url, notes,
           geographies ( name, level )`
        ),
      supabase
        .from("utility_rate_history_mi")
        .select(
          `id, utility, year, residential_rate_cents_kwh, rate_change_millions, yoy_change_pct,
           case_number, source, notes, service_type, rate_unit`
        )
        .order("year", { ascending: true }),
      supabase
        .from("mpsc_commission_meetings")
        .select(
          `id, meeting_title, meeting_date, meeting_type, year, chair, commissioners_present, key_actions_taken,
           rate_cases_on_agenda, consent_agenda_items, minutes_url, agenda_url, data_completeness, notes`
        )
        .order("meeting_date", { ascending: false }),
    ]);

    for (const [name, err] of [
      ["mpsc_rate_actions", rateActionsError],
      ["state_rate_comparison", stateComparisonError],
      ["energy_burden_by_race", energyBurdenError],
      ["utility_rate_history_mi", rateHistoryError],
      ["mpsc_commission_meetings", meetingsError],
    ] as const) {
      if (err) throw new Error(`Supabase fetch failed for ${name}: ${err.message}`);
    }

    const rateActions = (rateActionRows ?? []).map((r) => ({
      id: r.id,
      title: r.action_title ?? "",
      utility: r.utility_name ?? "",
      actionType: r.action_type ?? "",
      serviceType: r.service_type ?? "",
      marketType: r.market_type ?? "",
      geography: r.geographies?.name ?? "",
      geographyLevel: r.geographies?.level ?? "",
      amountApprovedM: r.amount_approved_millions,
      amountRequestedM: r.amount_requested_millions,
      residentialMonthlyImpact: r.residential_monthly_impact,
      residentialPctIncrease: r.residential_pct_increase,
      rateIncreasePercent: r.rate_increase_percent,
      energyBurdenBefore: r.energy_burden_before,
      energyBurdenAfter: r.energy_burden_after,
      filingDate: r.filing_date ?? "",
      effectiveDate: r.effective_date ?? "",
      decisionDate: r.decision_date ?? "",
      caseNumber: r.case_number ?? "",
      customersAffected: r.customers_affected,
      justification: r.justification ?? "",
      agPosition: r.ag_position ?? "",
      sourceUrl: r.source_url ?? "",
      notes: r.notes ?? "",
    }));

    const stateComparison = (stateComparisonRows ?? []).map((r) => ({
      id: r.id,
      state: r.geo_states?.name ?? "",
      abbreviation: r.geo_states?.abbreviation ?? "",
      group: r.comparison_group ?? "",
      avgRateCentsPerKwh: r.avg_residential_rate_cents_kwh,
      avgMonthlyBill: r.avg_monthly_bill,
      avgMonthlyUsageKwh: r.avg_monthly_usage_kwh,
      pctAboveBelowNational: r.pct_above_below_natl_avg,
      marketStructure: r.market_structure ?? "",
      gridMembership: r.grid_membership ?? "",
      dataPeriod: r.data_period ?? "",
      dataSource: r.data_source ?? "",
      rationale: r.comparison_rationale ?? "",
      yoyChangePct: r.yoy_change_pct,
      notes: r.notes ?? "",
    }));

    const energyBurden = (energyBurdenRows ?? []).map((r) => ({
      id: r.id,
      geography: r.geographies?.name ?? "",
      geographyType: r.geographies?.level ?? "",
      racialGroup: r.race_ethnicity ?? "",
      medianBurdenPct: r.energy_burden_percent,
      // race-specific figures -- NOT the same as geo_demographics' overall
      // geography median (see RECONCILIATION_NOTES.md 3)
      medianHouseholdIncomeForGroup: r.median_household_income,
      populationForGroup: r.population,
      highBurdenThresholdPct: r.high_burden_threshold_pct,
      pctHouseholdsHighBurden: r.pct_households_high_burden,
      pctAboveWhiteHouseholds: r.pct_above_white_households,
      severeBurdenPct: r.severe_burden_pct,
      lowIncomeMedianBurdenPct: r.low_income_median_burden_pct,
      dataYear: r.data_year ?? "",
      source: r.source ?? "",
      sourceUrl: r.source_url ?? "",
      notes: r.notes ?? "",
    }));

    const rateHistory = (rateHistoryRows ?? []).map((r) => ({
      id: r.id,
      // utility_year was a stored concatenation; now computed here since the
      // redundant column was dropped in the reconciliation migration.
      utilityAndYear: r.year ? `${r.utility ?? ""} ${r.year}`.trim() : r.utility ?? "",
      utility: r.utility ?? "",
      year: r.year,
      serviceType: r.service_type ?? "",
      rateUnit: r.rate_unit ?? "",
      rateCentsPerKwh: r.residential_rate_cents_kwh,
      rateChangeM: r.rate_change_millions,
      yoyChangePct: r.yoy_change_pct,
      caseNumber: r.case_number ?? "",
      source: r.source ?? "",
      notes: r.notes ?? "",
    }));

    const commissionMeetings = (meetingRows ?? []).map((r) => ({
      id: r.id,
      title: r.meeting_title ?? "",
      date: r.meeting_date ?? "",
      meetingType: r.meeting_type ?? "",
      year: r.year,
      chair: r.chair ?? "",
      commissionersPresent: r.commissioners_present ?? "",
      keyActions: r.key_actions_taken ?? "",
      rateCasesOnAgenda: r.rate_cases_on_agenda ?? "",
      consentAgendaItems: r.consent_agenda_items,
      minutesUrl: r.minutes_url ?? "",
      agendaUrl: r.agenda_url ?? "",
      dataCompleteness: r.data_completeness ?? "",
      notes: r.notes ?? "",
    }));

    return jsonResponse({
      rateActions,
      stateComparison,
      energyBurden,
      rateHistory,
      commissionMeetings,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Utility Rate Tracker fetch error:", error);
    return jsonResponse({ error: "Unable to load the rate tracker. Please try again later." }, 500);
  }
});
