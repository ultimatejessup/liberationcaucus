import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY');
    if (!MAILCHIMP_API_KEY) {
      throw new Error('MAILCHIMP_API_KEY is not configured');
    }

    const MAILCHIMP_AUDIENCE_ID = Deno.env.get('MAILCHIMP_AUDIENCE_ID');
    if (!MAILCHIMP_AUDIENCE_ID) {
      throw new Error('MAILCHIMP_AUDIENCE_ID is not configured');
    }

    // Extract data center from API key (e.g., "us1" from "xxxx-us1")
    const dataCenter = MAILCHIMP_API_KEY.split('-').pop();
    if (!dataCenter) {
      throw new Error('Invalid Mailchimp API key format');
    }

    const { email, name } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const nameParts = (name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`anystring:${MAILCHIMP_API_KEY}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Member already exists is not an error for the user
      if (data.title === 'Member Exists') {
        return new Response(JSON.stringify({ success: true, message: 'Already subscribed' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Mailchimp API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Mailchimp subscribe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
