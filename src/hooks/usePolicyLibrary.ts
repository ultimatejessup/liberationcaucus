import { useQuery } from "@tanstack/react-query";

export interface PolicyFile {
  url: string;
  filename: string;
  type: string;
  size: number;
}

export interface PolicyCampaign {
  id: string;
  name: string;
}

export interface PolicyFactSheet {
  id: string;
  title: string;
  summary: string;
  date: string;
  relatedLink: string;
  campaigns: PolicyCampaign[];
  files: PolicyFile[];
}

interface PolicyLibraryResponse {
  factSheets: PolicyFactSheet[];
  campaigns: PolicyCampaign[];
  fetchedAt: string;
}

async function fetchPolicyLibrary(): Promise<PolicyLibraryResponse> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/policy-library`, {
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load the policy library. Please try again.");
  }

  return response.json();
}

export function usePolicyLibrary() {
  return useQuery({
    queryKey: ["policy-library"],
    queryFn: fetchPolicyLibrary,
    // Short staleTime: Airtable's API-obtained attachment URLs expire after
    // ~2 hours, so this refetches often enough that a person browsing the
    // page always has a working download link, without hitting Airtable on
    // every render.
    staleTime: 5 * 60 * 1000,
  });
}
