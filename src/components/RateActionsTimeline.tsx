import type { RateAction } from "@/hooks/useUtilityRateTracker";

// Vertical timeline for Rate Actions — gives an at-a-glance chronological
// view above the existing detail cards (RateActionCard), rather than
// replacing them. Matches the site's actual live dark theme
// (liberation-cream/liberation-dark) — this page was NOT converted to the
// light theme delivered in an earlier session (verified directly against
// GitHub 2026-08-02: <main> is still bg-liberation-dark), so this component
// is built to match what's actually deployed, not what was proposed.
//
// Ordering: sorts by effectiveDate, falling back to decisionDate when
// effectiveDate is missing. Actions with neither (e.g. "Pending" filings
// with only a future filing date) are shown in a separate "Not yet dated"
// group at the end rather than silently dropped or mis-sorted to the top.

const ACTION_TYPE_COLOR: Record<string, string> = {
  "Rate Increase Approved": "#A8442C", // liberation-red / terracotta
  "Regulatory Reform": "#D4A94E", // liberation-gold
  "Assistance Program": "#4E9A6B", // green
  Pending: "#8b8378", // muted, matches liberation-cream at low opacity visually
};
const DEFAULT_COLOR = "#8b8378";

function timelineDate(action: RateAction): string | null {
  return action.effectiveDate || action.decisionDate || null;
}

export default function RateActionsTimeline({ actions }: { actions: RateAction[] }) {
  const dated = actions
    .filter((a) => timelineDate(a) !== null)
    .sort((a, b) => (timelineDate(a) as string).localeCompare(timelineDate(b) as string));
  const undated = actions.filter((a) => timelineDate(a) === null);

  if (actions.length === 0) return null;

  return (
    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-6 mb-4">
      <div className="text-sm font-medium text-liberation-cream/80 mb-4">Timeline</div>

      {dated.length > 0 ? (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-liberation-cream/15" />
          <div className="space-y-5">
            {dated.map((action) => {
              const date = timelineDate(action);
              const color = ACTION_TYPE_COLOR[action.actionType] ?? DEFAULT_COLOR;
              const isEffective = Boolean(action.effectiveDate);
              return (
                <div key={action.id} className="relative">
                  <span
                    className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-liberation-dark"
                    style={{ background: color }}
                  />
                  <div className="text-xs text-liberation-black/50 mb-0.5">
                    {date}
                    <span className="ml-1.5 text-liberation-black/35">
                      {isEffective ? "effective" : "decided"}
                    </span>
                  </div>
                  <div className="text-sm text-liberation-black/90 font-medium">{action.title}</div>
                  <div className="text-xs text-liberation-black/50 mt-0.5">
                    {action.utility}
                    {action.residentialPctIncrease !== null && (
                      <span className="text-liberation-red/80"> · +{action.residentialPctIncrease}% residential</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-liberation-cream/40">No dated rate actions yet.</p>
      )}

      {undated.length > 0 && (
        <div className="mt-5 pt-4 border-t border-liberation-cream/10">
          <div className="text-[11px] text-liberation-cream/40 mb-2">
            Not yet dated ({undated.length}):
          </div>
          <ul className="space-y-1 text-xs text-liberation-cream/50">
            {undated.map((a) => (
              <li key={a.id}>
                {a.title} — {a.utility}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
