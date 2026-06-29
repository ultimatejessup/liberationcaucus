import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE_ID = 'appnSF2n9hA3fEq3C';
const CAMPAIGNS_TABLE_ID = 'tblYPd1UJ8EplZTm6';
const FACT_SHEETS_TABLE_ID = 'tblFyK7y06Q3i2MLk';

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

    const [campaignRecords, factSheetRecords] = await Promise.all([
      fetchAllRecords(CAMPAIGNS_TABLE_ID, apiKey),
      fetchAllRecords(FACT_SHEETS_TABLE_ID, apiKey),
    ]);

    const campaignsById: Record<string, { id: string; name: string }> = {};
    for (const c of campaignRecords) {
      campaignsById[c.id] = {
        id: c.id,
        name: (c.fields['Campaign Name'] as string) ?? '',
      };
    }

    const factSheets = factSheetRecords.map((record) => {
      const campaignLinks = (record.fields['Campaign'] as string[] | undefined) ?? [];
      const campaigns = campaignLinks
        .map((id) => campaignsById[id])
        .filter((c): c is { id: string; name: string } => Boolean(c));

      const attachments = (record.fields['File'] as AirtableAttachment[] | undefined) ?? [];

      return {
        id: record.id,
        title: record.fields['Title'] ?? '',
        summary: record.fields['Summary'] ?? '',
        date: record.fields['Date'] ?? '',
        relatedLink: record.fields['Related Link'] ?? '',
        campaigns,
        files: attachments.map((a) => ({
          url: a.url,
          filename: a.filename,
          type: a.type,
          size: a.size,
        })),
      };
    });

    return new Response(
      JSON.stringify({
        factSheets,
        campaigns: campaignRecords.map((c) => ({
          id: c.id,
          name: c.fields['Campaign Name'] ?? '',
        })),
        // Attachment URLs returned above are time-limited (Airtable expires API-obtained
        // attachment URLs after ~2 hours). This is safe as long as the frontend always
        // fetches fresh from this function rather than caching the response for a long
        // time — see the short staleTime on the corresponding frontend query hook.
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Policy Library fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to load the policy library. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
