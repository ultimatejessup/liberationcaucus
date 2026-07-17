import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hybrid data source, deliberately:
//   - campaigns + legislation come from Postgres (accurate, structured --
//     bill_number/status/chamber, populated by the migration session).
//   - fact sheets still come from Airtable. The Postgres `fact_sheets` table
//     has no file-attachment storage (fact_sheet_files table + a Storage
//     bucket were never built -- flagged since the first schema review), so
//     switching fact sheets to Postgres would silently drop every working
//     download link. Airtable's attachment URLs are the only place that
//     data still lives.
// The two sides are joined by campaign NAME, since Postgres `campaigns`
// has no airtable_record_id column to join on directly (unlike legislation,
// fact_sheets, and sponsors, which do).

const AIRTABLE_BASE_ID = "appnSF2n9hA3fEq3C";
const AIRTABLE_CAMPAIGNS_TABLE_ID = "tblYPd1UJ8EplZTm6";
const AIRTABLE_FACT_SHEETS_TABLE_ID = "tblFyK7y06Q3i2MLk";

interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

async function fetchAllAirtableRecords(tableId: string, apiKey: string): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

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

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const airtableKey = Deno.env.get("AIRTABLE_API_KEY");
    if (!airtableKey) {
      console.error("Missing AIRTABLE_API_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const [
      { data: campaignRows, error: campaignError },
      airtableCampaignRecords,
      airtableFactSheetRecords,
    ] = await Promise.all([
      supabase
        .from("campaigns")
        .select(
          `
          id, name, description, active, start_date, end_date,
          legislation_campaigns ( legislation ( id, bill_number, title, status, chamber, session, introduced_date, source_url ) )
        `
        )
        .order("name"),
      fetchAllAirtableRecords(AIRTABLE_CAMPAIGNS_TABLE_ID, airtableKey),
      fetchAllAirtableRecords(AIRTABLE_FACT_SHEETS_TABLE_ID, airtableKey),
    ]);

    if (campaignError) throw campaignError;

    const airtableCampaignNameById: Record<string, string> = {};
    for (const c of airtableCampaignRecords) {
      airtableCampaignNameById[c.id] = (c.fields["Campaign Name"] as string) ?? "";
    }

    const factSheetsByCampaignName: Record<string, any[]> = {};
    for (const record of airtableFactSheetRecords) {
      const campaignLinks = (record.fields["Campaign"] as string[] | undefined) ?? [];
      const attachments = (record.fields["File"] as AirtableAttachment[] | undefined) ?? [];
      const factSheet = {
        id: record.id,
        title: record.fields["Title"] ?? "",
        summary: record.fields["Summary"] ?? "",
        date: record.fields["Date"] ?? "",
        relatedLink: record.fields["Related Link"] ?? "",
        files: attachments.map((a) => ({
          url: a.url,
          filename: a.filename,
          type: a.type,
          size: a.size,
        })),
      };

      for (const campaignId of campaignLinks) {
        const name = airtableCampaignNameById[campaignId];
        if (!name) continue;
        const key = normalizeName(name);
        if (!factSheetsByCampaignName[key]) factSheetsByCampaignName[key] = [];
        factSheetsByCampaignName[key].push(factSheet);
      }
    }

    const campaigns = (campaignRows ?? [])
      .map((c: any) => {
        const legislation = (c.legislation_campaigns ?? [])
          .map((lc: any) => lc.legislation)
          .filter(Boolean)
          .map((l: any) => ({
            id: l.id,
            billNumber: l.bill_number ?? "",
            title: l.title ?? "",
            status: l.status ?? "",
            chamber: l.chamber ?? "",
            session: l.session ?? "",
            introducedDate: l.introduced_date ?? "",
            sourceUrl: l.source_url ?? "",
          }))
          .sort((a: any, b: any) => a.billNumber.localeCompare(b.billNumber));

        const factSheets = factSheetsByCampaignName[normalizeName(c.name)] ?? [];

        return {
          id: c.id,
          name: c.name ?? "",
          description: c.description ?? "",
          active: c.active ?? true,
          legislation,
          factSheets,
        };
      })
      .filter((c) => c.legislation.length > 0 || c.factSheets.length > 0);

    return new Response(
      JSON.stringify({
        campaigns,
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Policy Library fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to load the policy library. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
