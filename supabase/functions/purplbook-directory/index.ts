import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Inlined from _shared/cors.ts and _shared/supabase-client.ts ----
// Every edge function is fully self-contained (no relative imports across
// function folders) after a deploy failed with "Module not found
// .../_shared/cors.ts" -- whatever deploy path was used only sent up the
// single index.ts, not the sibling _shared/ folder. Inlining removes that
// entire class of deploy-structure problem regardless of how each function
// gets deployed going forward.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
// ---- End inlined shared code ----

// Rewritten against the ACTUAL live schema (post reconciliation_migration.sql).
// Key differences from the original draft:
//   - `members` has a direct organization_id (int8) FK — there is no
//     organization_members junction table in the live schema. This is
//     actually simpler than originally planned and has the same effect:
//     a membership row cannot silently point at nothing, because
//     organization_id is a real FK, not a best-effort Airtable link array.
//   - `members.office_type` distinguishes elected officials from ordinary
//     caucus members; `legislator_id` + `legislator_match_confidence` link a
//     member row to the canonical `legislators` roster where one was found.
//   - `state_territory` (free text) was replaced by `state_id` -> geo_states
//     in the reconciliation migration.
//
// Response shape: organizations (with nested members) + totalMembers is
// unchanged, so usePurplbookDirectory.ts needs no frontend changes.
// `electedOfficials` remains an additive field (see prior version's notes).
//
// FIX (this version): PurplBook.tsx's buildStateMap() reads member.state
// directly to drive the Atlas cartogram and the "States Covered" stat.
// The previous version only exposed the state abbreviation folded into
// `district` as a fallback, never as its own key — so member.state was
// always undefined, stateMap was always empty, and the map/stat silently
// showed nothing even though org/member counts were correct. Added a
// dedicated `state` field sourced from geo_states.abbreviation.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getServiceClient();

    const [
      { data: orgRows, error: orgError },
      { count: totalMembers, error: memberCountError },
      { data: electedRows, error: electedError },
    ] = await Promise.all([
      supabase
        .from("organizations")
        .select(
          `
          id, name, level, focus_area, founded, website, contact, phone, current_chair, membership_size,
          mission_summary, last_verified,
          geo_states ( abbreviation ),
          members ( id, name, title_role, district_jurisdiction, serving_since, geo_states ( abbreviation ) )
        `
        )
        .order("name"),
      // count:'exact', head:true returns only the row count via `count`,
      // with `data` left null.
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase
        .from("members")
        .select(
          `id, name, office_type, district_jurisdiction, party, serving_since, legislator_match_confidence,
           geo_states ( abbreviation ),
           legislators ( full_name, office:role_title, chamber, party, photo_url, website )`
        )
        .not("office_type", "is", null)
        .order("name"),
    ]);

    if (orgError) throw orgError;
    if (memberCountError) throw memberCountError;
    if (electedError) throw electedError;

    const organizations = (orgRows ?? []).map((org) => ({
      id: org.id,
      name: org.name ?? "",
      level: org.level ?? "",
      stateScope: org.geo_states?.abbreviation ?? "",
      founded: org.founded ?? "",
      website: org.website ?? "",
      contact: org.contact ?? "",
      phone: org.phone ?? "",
      chair: org.current_chair ?? "",
      membershipSize: org.membership_size ?? "",
      description: org.mission_summary ?? "",
      focusArea: org.focus_area ?? "",
      lastVerified: org.last_verified ?? "",
      members: (org.members ?? []).map((m: any) => ({
        name: m.name ?? "",
        title: m.title_role ?? "",
        state: m.geo_states?.abbreviation ?? "",
        district: m.district_jurisdiction || m.geo_states?.abbreviation || "",
        since: m.serving_since ?? null,
      })),
    }));

    // Elected officials sourced from `members` where office_type is set,
    // enriched with the canonical `legislators` roster when a confident
    // match exists (legislator_match_confidence). Members whose match is
    // low-confidence or unmatched still appear, using their own fields —
    // this mirrors the "member row is always real" guarantee the schema
    // gives us now, just without the extra legislators-table detail.
    const electedOfficials = (electedRows ?? []).map((e: any) => ({
      id: e.id,
      name: e.legislators?.full_name ?? e.name ?? "",
      office: e.legislators?.office ?? e.office_type ?? "",
      jurisdiction: e.district_jurisdiction ?? "",
      party: e.legislators?.party ?? e.party ?? "",
      chamber: e.legislators?.chamber ?? "",
      stateScope: e.geo_states?.abbreviation ?? "",
      servingSince: e.serving_since ?? null,
      matchConfidence: e.legislator_match_confidence ?? "unmatched",
      photoUrl: e.legislators?.photo_url ?? "",
      website: e.legislators?.website ?? "",
    }));

    return jsonResponse({
      organizations,
      totalMembers: totalMembers ?? 0,
      electedOfficials,
      lastFetched: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Purple Book directory fetch error:", error);
    return jsonResponse({ error: "Unable to load directory data. Please try again later." }, 500);
  }
});
