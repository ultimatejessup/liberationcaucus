import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHEET_ID = '15WE0TAFOSOe1B48rnvQEWC7nlRRH95bvntKKqzvI0mA';

function parseGvizResponse(text: string): Record<string, string>[] {
  // Response format: google.visualization.Query.setResponse({...})
  const jsonStr = text.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
  const json = JSON.parse(jsonStr);
  
  if (json.status === 'error') {
    throw new Error(json.errors?.[0]?.detailed_message || 'Google Sheets query error');
  }

  const table = json.table;
  const headers = table.cols.map((col: any) => col.label || col.id);
  const rows: Record<string, string>[] = [];

  for (const row of table.rows) {
    const obj: Record<string, string> = {};
    row.c.forEach((cell: any, idx: number) => {
      obj[headers[idx]] = cell?.v?.toString() || cell?.f || '';
    });
    // Skip empty rows
    if (Object.values(obj).some(v => v.length > 0)) {
      rows.push(obj);
    }
  }
  return rows;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sheet = url.searchParams.get('sheet') || 'Events';

    // Use the public gviz endpoint which works with published sheets
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`;

    console.log(`Fetching sheet: ${sheet}`);

    const response = await fetch(gvizUrl);
    if (!response.ok) {
      console.error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }

    const text = await response.text();
    console.log(`Received response (${text.length} chars)`);

    const data = parseGvizResponse(text);
    console.log(`Parsed ${data.length} rows from ${sheet}`);

    return new Response(JSON.stringify({ data, sheet }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});