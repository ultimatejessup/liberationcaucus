import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHEET_ID = '15WE0TAFOSOe1B48rnvQEWC7nlRRH95bvntKKqzvI0mA';

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    // Skip empty rows
    if (Object.values(row).some(v => v.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sheet = url.searchParams.get('sheet') || 'Events';
    
    // gid mapping: first sheet = 0, second sheet = gid from URL
    const gidMap: Record<string, string> = {
      'Events': '0',
      'News': '1',
    };
    
    const gid = gidMap[sheet] || '0';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    
    console.log(`Fetching sheet: ${sheet} from ${csvUrl}`);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      console.error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log(`Received CSV (${csvText.length} chars), first 200: ${csvText.substring(0, 200)}`);
    
    const data = parseCSV(csvText);
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