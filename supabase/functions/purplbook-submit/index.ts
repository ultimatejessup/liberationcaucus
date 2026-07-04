import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE_ID                 = 'app0HExiar6hu2Ttl';
const MEMBER_SUBMISSIONS_ID   = 'tbltu72B7vqxR7tXj';
const ORG_SUBMISSIONS_ID      = 'tblgsfyQOLlBEoM5W';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(msg: string): Response {
  return new Response(
    JSON.stringify({ error: msg }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function err(msg: string, status = 500): Response {
  return new Response(
    JSON.stringify({ error: msg }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function ok(): Response {
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function postToAirtable(
  apiKey: string,
  tableId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tableId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields: { ...fields, 'Review Status': 'New' } }],
        typecast: true,
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable error ${res.status}: ${text}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('AIRTABLE_API_KEY');
  if (!apiKey) {
    console.error('Missing AIRTABLE_API_KEY');
    return err('Server configuration error');
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad('Invalid JSON body');
  }

  const kind = body.kind as string;
  if (!kind || !['member', 'organization'].includes(kind)) {
    return bad('Field "kind" must be "member" or "organization".');
  }

  // ── Validate submitter email (present on both forms) ─────────────────────
  const submitterEmail = String(body['Submitter Email'] ?? '').trim();
  if (!submitterEmail || !EMAIL_RE.test(submitterEmail)) {
    return bad('A valid submitter email is required.');
  }

  // ── Validate and route ───────────────────────────────────────────────────
  try {
    if (kind === 'member') {
      const fullName  = String(body['Full Name']  ?? '').trim();
      const orgName   = String(body['Org Name (text)'] ?? '').trim();
      const titleRole = String(body['Title/Role'] ?? '').trim();
      const level     = String(body['Level']      ?? '').trim();
      const state     = String(body['State/Territory'] ?? '').trim();
      const source    = String(body['Source']     ?? '').trim();

      if (!fullName)  return bad('Full Name is required.');
      if (!orgName)   return bad('Org Name is required.');
      if (!titleRole) return bad('Title/Role is required.');
      if (!level)     return bad('Level is required.');
      if (!state)     return bad('State/Territory is required.');
      if (!source)    return bad('Source is required.');
      if (fullName.length > 200 || orgName.length > 300) return bad('Name fields exceed allowed length.');

      // Strip the internal routing key before writing to Airtable
      const { kind: _k, ...fields } = body;
      await postToAirtable(apiKey, MEMBER_SUBMISSIONS_ID, fields);

    } else {
      const orgName      = String(body['Org Name']        ?? '').trim();
      const level        = String(body['Level']           ?? '').trim();
      const missionSummary = String(body['Mission Summary'] ?? '').trim();
      const source       = String(body['Source']          ?? '').trim();

      if (!orgName)        return bad('Org Name is required.');
      if (!level)          return bad('Level is required.');
      if (!missionSummary) return bad('Mission Summary is required.');
      if (!source)         return bad('Source is required.');
      if (orgName.length > 300) return bad('Org Name exceeds allowed length.');

      const { kind: _k, ...fields } = body;
      await postToAirtable(apiKey, ORG_SUBMISSIONS_ID, fields);
    }

    return ok();

  } catch (e) {
    console.error('purplbook-submit error:', e);
    return err('Unable to submit at this time. Please try again.');
  }
});
