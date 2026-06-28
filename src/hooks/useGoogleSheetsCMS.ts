import { useQuery } from "@tanstack/react-query";

export interface CMSEvent {
  Title: string;
  Date: string;
  Time: string;
  Location: string;
  Description: string;
  Link: string;
  [key: string]: string;
}

export interface CMSNews {
  Title: string;
  Date: string;
  Summary: string;
  Content: string;
  "Image url": string;
  "Image URL": string;
  Link: string;
  [key: string]: string;
}

export interface CMSFactSheet {
  Title: string;
  Date: string;
  Campaign: string;
  Summary: string;
  "File url": string;
  "File URL": string;
  "File type": string;
  "Related link": string;
  [key: string]: string;
}

async function fetchSheet<T>(sheet: string): Promise<T[]> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const response = await fetch(
    `${projectUrl}/functions/v1/google-sheets-cms?sheet=${encodeURIComponent(sheet)}`,
    {
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheet}`);
  }

  const result = await response.json();
  return result.data as T[];
}

export function useEvents() {
  return useQuery({
    queryKey: ['cms', 'events'],
    queryFn: () => fetchSheet<CMSEvent>('Events'),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export function useNews() {
  return useQuery({
    queryKey: ['cms', 'news'],
    queryFn: () => fetchSheet<CMSNews>('News'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFactSheets() {
  return useQuery({
    queryKey: ['cms', 'factsheets'],
    queryFn: () => fetchSheet<CMSFactSheet>('Fact Sheets'),
    staleTime: 5 * 60 * 1000,
  });
}
