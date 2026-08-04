import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Policy Ledger v3 -- adds `content` to the fact sheet payload so the app
// can render an in-app "web brief" reading view (full text, published
// immediately, no PDF/design step) alongside or instead of a file download.
// `content` is currently empty on all rows -- this just wires the plumbing;
// populating it is an editorial task, not something to fabricate here.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const [
      { data: legislationRows, error: legislationError },
      { data: factSheetRows, error: factSheetError },
    ] = await Promise.all([
      supabase
        .from("legislation")
        .select(
          `
          id, bill_number, title, status, chamber, session, introduced_date, source_url, summary, notes,
          level_of_government, government_body,
          campaigns ( id, name, description ),
          legislation_sponsor ( role, sponsors ( legislator_name, party, state_district ) )
        `
        )
        .order("introduced_date", { ascending: false, nullsFirst: false }),
      supabase
        .from("fact_sheets")
        .select(
          `
          id, title, summary, content, published_date, related_link,
          fact_sheets_campaigns ( campaign_id ),
          fact_sheet_files ( storage_path, filename, content_type, size_bytes )
        `
        )
        .order("published_date", { ascending: false, nullsFirst: false }),
    ]);

    if (legislationError) throw legislationError;
    if (factSheetError) throw factSheetError;

    const publicFileUrl = (storagePath: string) =>
      `${supabaseUrl}/storage/v1/object/public/fact-sheet-files/${encodeURIComponent(storagePath)}`;

    // Public content = has a file OR has web-brief text. A sheet with neither
    // is research-stage only and stays out of the public response.
    const publishedFactSheets = (factSheetRows ?? [])
      .filter((f: any) => (f.fact_sheet_files ?? []).length > 0 || (f.content && f.content.trim() !== ""))
      .map((f: any) => ({
        id: f.id,
        title: f.title ?? "",
        summary: f.summary ?? "",
        content: f.content ?? "",
        date: f.published_date ?? "",
        relatedLink: f.related_link ?? "",
        campaignIds: (f.fact_sheets_campaigns ?? []).map((c: any) => c.campaign_id),
        files: (f.fact_sheet_files ?? []).map((file: any) => ({
          url: publicFileUrl(file.storage_path),
          filename: file.filename,
          type: file.content_type,
          size: file.size_bytes,
        })),
      }));

    const legislation = (legislationRows ?? []).map((l: any) => {
      const campaign = l.campaigns ? { id: l.campaigns.id, name: l.campaigns.name, description: l.campaigns.description ?? "" } : null;
      const sponsors = (l.legislation_sponsor ?? [])
        .map((ls: any) => ls.sponsors ? { name: ls.sponsors.legislator_name, role: ls.role, party: ls.sponsors.party ?? "", district: ls.sponsors.state_district ?? "" } : null)
        .filter(Boolean);
      const relatedFactSheets = campaign
        ? publishedFactSheets.filter((f) => f.campaignIds.includes(campaign.id))
        : [];

      return {
        id: l.id,
        billNumber: l.bill_number ?? "",
        title: l.title ?? "",
        status: l.status ?? "",
        levelOfGovernment: l.level_of_government ?? "",
        governmentBody: l.government_body ?? "",
        chamber: l.chamber ?? "",
        session: l.session ?? "",
        introducedDate: l.introduced_date ?? "",
        sourceUrl: l.source_url ?? "",
        summary: l.summary ?? "",
        notes: l.notes ?? "",
        campaign,
        sponsors,
        relatedFactSheets: relatedFactSheets.map(({ campaignIds, ...rest }) => rest),
      };
    });

    return new Response(
      JSON.stringify({
        legislation,
        factSheets: publishedFactSheets.map(({ campaignIds, ...rest }) => rest),
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Policy Ledger fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to load the policy ledger. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
