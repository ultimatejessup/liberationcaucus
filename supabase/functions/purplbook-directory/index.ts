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
 
function buildMember(m: AirtableRecord, fallbackState: string, fallbackLevel: string) {
  return {
    name: String(m.fields['Full Name'] ?? ''),
    title: String(m.fields['Title/Role'] ?? ''),
    district: String(m.fields['District/Jurisdiction'] ?? ''),
    state: String(m.fields['State/Territory'] ?? fallbackState),
    level: String(m.fields['Level'] ?? fallbackLevel),
    party: String(m.fields['Party'] ?? ''),
    since: (m.fields['Serving Since'] as number | null) ?? null,
    website: String(m.fields['Website'] ?? ''),
  };
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
 
    // Build org id -> state_territory for fallback when member's own field is empty
    const orgStateMap: Record<string, string> = {};
    const orgLevelMap: Record<string, string> = {};
    for (const org of orgRecords) {
      orgStateMap[org.id] = String(org.fields['state_territory'] ?? org.fields['State Scope'] ?? '');
      orgLevelMap[org.id] = String(org.fields['Level'] ?? '');
    }
 
    // Group members by their linked org id.
    // Members whose Organization field is empty are collected separately
    // and surfaced as a flat "all members" list for the Atlas/Ledger views.
    const membersByOrgId: Record<string, AirtableRecord[]> = {};
    const unlinkedMembers: AirtableRecord[] = [];
 
    for (const member of memberRecords) {
      const orgLinks = (member.fields['Organization'] as string[] | undefined) ?? [];
      if (orgLinks.length > 0) {
        for (const orgId of orgLinks) {
          if (!membersByOrgId[orgId]) membersByOrgId[orgId] = [];
          membersByOrgId[orgId].push(member);
        }
      } else {
        unlinkedMembers.push(member);
      }
    }
 
    console.log(`Linked: ${memberRecords.length - unlinkedMembers.length}, Unlinked: ${unlinkedMembers.length}`);
 
    const organizations = orgRecords.map((org) => ({
      id: org.id,
      name: String(org.fields['Org Name'] ?? ''),
      level: String(org.fields['Level'] ?? ''),
      stateScope: String(org.fields['State Scope'] ?? ''),
      stateTerr: String(org.fields['state_territory'] ?? org.fields['State Scope'] ?? ''),
      founded: String(org.fields['Founded'] ?? ''),
      website: String(org.fields['Website'] ?? ''),
      contact: String(org.fields['Contact'] ?? ''),
      phone: String(org.fields['Phone'] ?? ''),
      chair: String(org.fields['Current Chair/Leader'] ?? ''),
      membershipSize: String(org.fields['Membership Size'] ?? ''),
      description: String(org.fields['Mission Summary'] ?? ''),
      members: (membersByOrgId[org.id] ?? []).map((m) =>
        buildMember(m, orgStateMap[org.id] ?? '', orgLevelMap[org.id] ?? '')
      ),
    }));
 
    // Surface unlinked members via a synthetic "catch-all" org so the
    // Atlas and Ledger views can still map them by state.
    // This is the workaround for the linked-record gap until the
    // Organization field is fully populated across all member records.
    const allMembersOrg = {
      id: '__all_members__',
      name: 'All Members',
      level: 'State',
      stateScope: 'National',
      stateTerr: '',
      founded: '',
      website: '',
      contact: '',
      phone: '',
      chair: '',
      membershipSize: '',
      description: '',
      members: [
        // Include every member (linked + unlinked) so the map is always fully populated
        ...memberRecords.map((m) => {
          const orgLinks = (m.fields['Organization'] as string[] | undefined) ?? [];
          const parentOrgId = orgLinks[0] ?? '';
          return buildMember(m, orgStateMap[parentOrgId] ?? '', orgLevelMap[parentOrgId] ?? '');
        }),
      ],
    };
 
    const totalMembers = memberRecords.length;
 
    return new Response(
      JSON.stringify({
        organizations: [...organizations, allMembersOrg],
        totalMembers,
        lastFetched: new Date().toISOString(),
      }),
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
