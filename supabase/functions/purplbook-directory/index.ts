import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE_ID = 'app0HExiar6hu2Ttl';
const ORGANIZATIONS_TABLE_ID = 'tblqZV2SQylom99uE';
const MEMBERS_TABLE_ID = 'tblfhtRXMI4ulW5rb';

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

    const [orgRecords, memberRecords] = await Promise.all([
      fetchAllRecords(ORGANIZATIONS_TABLE_ID, apiKey),
      fetchAllRecords(MEMBERS_TABLE_ID, apiKey),
    ]);

    // Group members by their linked organization record id for fast lookup on the frontend.
    const membersByOrgId: Record<string, AirtableRecord[]> = {};
    for (const member of memberRecords) {
      const orgLinks = (member.fields['Organization'] as string[] | undefined) ?? [];
      for (const orgRecordId of orgLinks) {
        if (!membersByOrgId[orgRecordId]) membersByOrgId[orgRecordId] = [];
        membersByOrgId[orgRecordId].push(member);
      }
    }

    const organizations = orgRecords.map((org) => ({
      id: org.id,
      name: org.fields['Org Name'] ?? '',
      level: org.fields['Level'] ?? '',
      stateScope: org.fields['State Scope'] ?? '',
      founded: org.fields['Founded'] ?? '',
      website: org.fields['Website'] ?? '',
      contact: org.fields['Contact'] ?? '',
      phone: org.fields['Phone'] ?? '',
      chair: org.fields['Current Chair/Leader'] ?? '',
      membershipSize: org.fields['Membership Size'] ?? '',
      description: org.fields['Mission Summary'] ?? '',
      members: (membersByOrgId[org.id] ?? []).map((m) => ({
        name: m.fields['Full Name'] ?? '',
        title: m.fields['Title/Role'] ?? '',
        district: m.fields['District/Jurisdiction'] ?? m.fields['State/Territory'] ?? '',
        since: m.fields['Serving Since'] ?? null,
      })),
    }));

    // Members with no linked organization (e.g. generic "State Executive Officials"
    // catch-all rows) are intentionally omitted from per-org lists but counted here
    // so the total reflects the full dataset, not just caucus-affiliated members.
    const totalMembers = memberRecords.length;

    return new Response(
      JSON.stringify({ organizations, totalMembers, lastFetched: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Purple Book directory fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to load directory data. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
