// supabase/functions/legiscan-sync/index.ts
//
// Secret needed: LEGISCAN_API_KEY (Project Settings -> Edge Functions -> Secrets)
// Call with empty body (or omit) for a full nationwide sync, or
// {"state":"MI"} to pilot one state first -- recommended before running
// nationwide, since you have known-correct Michigan Sponsors/Elected
// Officials data to validate matches against.
//
// After this runs, run the matching-pass UPDATE statements at the bottom
// of 07_legislators_core.sql to link sponsors/members/legislation_sponsor/
// legislation_advocacy to the canonical rows this creates.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LEGISCAN_KEY = Deno.env.get("LEGISCAN_API_KEY")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function legiscan(op: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ key: LEGISCAN_KEY, op, ...params });
  const res = await fetch(`https://api.legiscan.com/?${qs}`);
  const json = await res.json();
  if (json.status !== "OK") throw new Error(`LegiScan ${op} failed: ${JSON.stringify(json)}`);
  return json;
}

Deno.serve(async (req) => {
  try {
    const { state } = await req.json().catch(() => ({ state: null }));

    const sessionList = await legiscan("getSessionList", state ? { state } : {});
    const sessions = sessionList.sessions.filter((s: any) => s.year_end >= new Date().getFullYear() - 1);

    let upserted = 0;

    for (const session of sessions) {
      const peopleResp = await legiscan("getSessionPeople", { id: String(session.session_id) });
      const people = Object.values(peopleResp.sessionpeople.people) as any[];

      for (const p of people) {
        const { data: legislator } = await supabase
          .from("legislators")
          .upsert(
            {
              legiscan_people_id: p.people_id,
              full_name: p.name,
              first_name: p.first_name,
              last_name: p.last_name,
              party: p.party,
              level: session.state === "US" ? "federal" : "state",
              chamber: p.role === "Rep" ? (session.state === "US" ? "U.S. House" : "State House")
                     : p.role === "Sen" ? (session.state === "US" ? "U.S. Senate" : "State Senate")
                     : "Unicameral",
              state: session.state,
              district: p.district,
              role_title: p.role,
              status: "active",
              source: "legiscan",
              legiscan_last_synced_at: new Date().toISOString(),
            },
            { onConflict: "legiscan_people_id" },
          )
          .select("id")
          .single();

        if (legislator) {
          await supabase.from("legislator_terms").upsert(
            {
              legislator_id: legislator.id,
              legiscan_session_id: session.session_id,
              state: session.state,
              chamber: p.role,
              district: p.district,
              party: p.party,
              session_name: session.session_name,
              session_year_start: session.year_start,
              session_year_end: session.year_end,
            },
            { onConflict: "legislator_id,legiscan_session_id" },
          );
          upserted++;
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sessions: sessions.length, legislators_upserted: upserted }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("legiscan-sync error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
