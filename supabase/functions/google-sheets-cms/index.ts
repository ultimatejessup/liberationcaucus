// Google Sheets CMS edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHEET_ID = '15WE0TAFOSOe1B48rnvQEWC7nlRRH95bvntKKqzvI0mA';

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    if (Object.values(obj).some(v => v.length > 0)) {
      rows.push(obj);
    }
  }
  return rows;
}

const SHEET_GIDS: Record<string, string> = {
  'Events': '0',
  'News': '1',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sheet = url.searchParams.get('sheet') || 'Events';
    const gid = SHEET_GIDS[sheet] || '0';

    // Use the pub endpoint for published sheets - no auth needed
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-${SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

    // Also try the direct export URL as fallback
    const exportUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

    // Try the gviz endpoint with proper headers
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;

    console.log(`Fetching sheet: ${sheet} (gid: ${gid})`);

    // Try gviz with csv output first
    let response = await fetch(gvizUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
      },
    });

    if (!response.ok) {
      console.log(`gviz failed (${response.status}), trying export URL...`);
      response = await fetch(exportUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
        },
      });
    }

    if (!response.ok) {
      console.error(`All fetch attempts failed: ${response.status} ${response.statusText}`);
      const body = await response.text();
      console.error(`Response body: ${body.substring(0, 500)}`);
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }

    const text = await response.text();
    console.log(`Received response (${text.length} chars), first 200: ${text.substring(0, 200)}`);

    const data = parseCSV(text);
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
