import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface MembershipPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  zipCode: string;
  precinctLeader?: string;
  committees?: string[];
  councils?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json() as MembershipPayload;
    const {
      firstName,
      lastName,
      email,
      mobile = '',
      zipCode,
      precinctLeader = '',
      committees = [],
      councils = [],
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !zipCode) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'First name, last name, email, and zip code are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Length limits to match the rest of the site's validation conventions
    if (firstName.length > 100 || lastName.length > 100 || email.length > 255 || zipCode.length > 10 || mobile.length > 20 || precinctLeader.length > 200) {
      console.error('Input exceeds length limits');
      return new Response(
        JSON.stringify({ error: 'One or more fields exceed the allowed length.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ZIP_CODE_REGEX.test(zipCode)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid 5-digit zip code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(committees) || !Array.isArray(councils)) {
      return new Response(
        JSON.stringify({ error: 'Invalid committee or council selection.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to Airtable
    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    const airtableBaseId = Deno.env.get('AIRTABLE_MEMBERSHIP_BASE_ID');
    const airtableTableId = Deno.env.get('AIRTABLE_MEMBERSHIP_TABLE_ID');

    if (!airtableApiKey || !airtableBaseId || !airtableTableId) {
      console.error('Missing Airtable configuration (AIRTABLE_API_KEY / AIRTABLE_MEMBERSHIP_BASE_ID / AIRTABLE_MEMBERSHIP_TABLE_ID)');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim();

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Full Name': fullName,
                'First Name': firstName,
                'Last Name': lastName,
                'Email': email,
                'Mobile Phone': mobile,
                'Zip Code': zipCode,
                'Precinct Leader': precinctLeader,
                'Committees': committees,
                'Councils': councils,
                'Status': 'New',
                'Submitted At': new Date().toISOString(),
                'Source': 'Website Form',
              },
            },
          ],
        }),
      }
    );

    const airtableResult = await airtableResponse.json();

    if (!airtableResponse.ok) {
      console.error('Airtable insert error:', JSON.stringify(airtableResult));
      throw new Error('Failed to save membership submission');
    }

    console.log('Membership submission saved to Airtable:', airtableResult.records?.[0]?.id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Membership form error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
