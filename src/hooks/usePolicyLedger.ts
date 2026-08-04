import { useQuery } from "@tanstack/react-query";

export interface LedgerFile {
  url: string;
  filename: string;
  type: string;
  size: number;
}

export interface LedgerFactSheet {
  id: string;
  title: string;
  summary: string;
  /** Full body text for the in-app "web brief" reading view. Empty string
   * when a sheet only has a PDF and no web-native version yet. */
  content: string;
  date: string;
  relatedLink: string;
  files: LedgerFile[];
}

export interface LedgerSponsor {
  name: string;
  role: string;
  party?: string;
  district?: string;
}

export interface LedgerCampaign {
  id: number;
  name: string;
  description: string;
}

export type LevelOfGovernment = "Federal" | "State" | "Local" | "";

export interface LedgerBill {
  id: number;
  billNumber: string;
  title: string;
  status: string;
  levelOfGovernment: LevelOfGovernment;
  governmentBody: string;
  chamber: string;
  session: string;
  introducedDate: string;
  sourceUrl: string;
  summary: string;
  notes: string;
  campaign: LedgerCampaign | null;
  sponsors: LedgerSponsor[];
  relatedFactSheets: LedgerFactSheet[];
}

interface PolicyLedgerResponse {
  legislation: LedgerBill[];
  factSheets: (LedgerFactSheet & { campaignNames: string[] })[];
  fetchedAt: string;
}

async function fetchPolicyLedger(): Promise<PolicyLedgerResponse> {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${projectUrl}/functions/v1/policy-ledger`, {
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load the policy ledger. Please try again.");
  }

  return response.json();
}

export function usePolicyLedger() {
  return useQuery({
    queryKey: ["policy-ledger"],
    queryFn: fetchPolicyLedger,
    // Same short staleTime as the old policy-library hook: fact sheet
    // attachment URLs are sourced live from Airtable on every function call
    // and expire after ~2 hours, so this refetches often enough that a
    // person browsing the page always has a working download link.
    staleTime: 5 * 60 * 1000,
  });
}
