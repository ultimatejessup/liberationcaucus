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
      // Capitalize first letter of each header for consistent API
      const key = header.charAt(0).toUpperCase() + header.slice(1).toLowerCase();
      obj[key] = values[idx] || '';
    });
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

    // Try Google Sheets API v4 first if API key is available
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    
    let data: Record<string, string>[] = [];

    if (apiKey) {
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheet)}?key=${apiKey}`;
      console.log(`Fetching sheet: ${sheet} via Sheets API v4`);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const result = await response.json();
        const rows = result.values || [];
        if (rows.length >= 2) {
          const headers = rows[0];
          data = rows.slice(1).map((row: string[]) => {
            const obj: Record<string, string> = {};
            headers.forEach((header: string, idx: number) => {
              const key = header.charAt(0).toUpperCase() + header.slice(1).toLowerCase();
              obj[key] = row[idx] || '';
            });
            return obj;
          }).filter((obj: Record<string, string>) => Object.values(obj).some(v => v.length > 0));
        }
        console.log(`Parsed ${data.length} rows from ${sheet} via API v4`);
      } else {
        console.log(`API v4 failed (${response.status}), falling back to gviz...`);
      }
    }

    // Fallback to gviz CSV endpoint
    if (data.length === 0) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
      console.log(`Fetching sheet: ${sheet} via gviz`);
      
      const response = await fetch(gvizUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
      }

      const text = await response.text();
      console.log(`Received response (${text.length} chars), first 200: ${text.substring(0, 200)}`);
      data = parseCSV(text);
      console.log(`Parsed ${data.length} rows from ${sheet}`);
    }

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
