import { useQuery } from "@tanstack/react-query";

export interface PurplbookMember {
  name: string;
  title: string;
  district: string;
  since: number | null;
}

export interface PurplbookOrg {
  id: string;
  name: string;
  level: "Federal" | "National Umbrella" | "State" | "Local" | string;
  stateScope: string;
  founded: string;
  website: string;
  contact: string;
  phone: string;
  chair: string;
  membershipSize: string;
  description: string;
  members: PurplbookMember[];
}

interface PurplbookResponse {
  organizations: PurplbookOrg[];
  totalMembers: number;
  lastFetched: string;
}

async function fetchPurplbookDirectory(): Promise<PurplbookResponse> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/purplbook-directory`, {
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load the directory. Please try again.");
  }

  return response.json();
}

export function usePurplbookDirectory() {
  return useQuery({
    queryKey: ["purplbook", "directory"],
    queryFn: fetchPurplbookDirectory,
    staleTime: 60 * 60 * 1000, // 1 hour — this is periodic-refresh reference data, not live data
  });
}
