import { useQuery } from "@tanstack/react-query";
 
export interface PurplbookMember {
  name: string;
  title: string;
  district: string;
  state: string;       // explicit State/Territory field — always populated
  level: string;       // e.g. "Federal" | "State" | "Local" | "County"
  party: string;
  since: number | null;
  website: string;
}
 
export interface PurplbookOrg {
  id: string;
  name: string;
  level: string;
  stateScope: string;
  stateTerr: string;   // state_territory field from Airtable
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
    staleTime: 60 * 60 * 1000,
  });
}
 
