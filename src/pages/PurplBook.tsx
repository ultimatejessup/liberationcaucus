import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Landmark,
  Globe2,
  Map,
  Building2,
  Search,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { usePurplbookDirectory, type PurplbookOrg, type PurplbookMember } from "@/hooks/usePurplbookDirectory";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVEL_ORDER = ["Federal", "State", "Local", "County"] as const;
type GovLevel = (typeof LEVEL_ORDER)[number];

const LEVEL_LABEL: Record<GovLevel, string> = {
  Federal: "Federal",
  State: "State Legislature",
  Local: "Local / Municipal",
  County: "County",
};

const LEVEL_STYLES: Record<string, {
  text: string; bg: string; border: string; icon: typeof Landmark;
}> = {
  Federal:            { text: "text-liberation-gold",   bg: "bg-liberation-gold/10",   border: "border-liberation-gold/30",   icon: Landmark  },
  "National Umbrella":{ text: "text-liberation-orange", bg: "bg-liberation-orange/10", border: "border-liberation-orange/30", icon: Globe2    },
  State:              { text: "text-liberation-green",  bg: "bg-liberation-green/10",  border: "border-liberation-green/30",  icon: Map       },
  Local:              { text: "text-liberation-purple", bg: "bg-liberation-purple/10", border: "border-liberation-purple/30", icon: Building2 },
  County:             { text: "text-liberation-purple", bg: "bg-liberation-purple/10", border: "border-liberation-purple/30", icon: Building2 },
};

const NAV_TABS = ["atlas", "ledger", "submit"] as const;
type ViewTab = (typeof NAV_TABS)[number];

const ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const ABBR: Record<string, string> = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",
  Connecticut:"CT",Delaware:"DE","District of Columbia":"DC",Florida:"FL",Georgia:"GA",
  Hawaii:"HI",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",
  Louisiana:"LA",Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",Minnesota:"MN",
  Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY",
  "North Carolina":"NC","North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",
  Pennsylvania:"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA",
  "West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY",
};

const GRID: Record<string, [number, number]> = {
  Alaska:[0,0], Maine:[0,11],
  Vermont:[1,10],"New Hampshire":[1,11],Washington:[1,1],Idaho:[1,2],Montana:[1,3],
  "North Dakota":[1,4],Minnesota:[1,5],Wisconsin:[1,6],Michigan:[1,7],"New York":[1,9],
  Massachusetts:[2,11],Oregon:[2,1],Nevada:[2,2],Wyoming:[2,3],"South Dakota":[2,4],
  Iowa:[2,5],Illinois:[2,6],Indiana:[2,7],Ohio:[2,8],Pennsylvania:[2,9],"New Jersey":[2,10],
  "Rhode Island":[3,11],California:[3,1],Utah:[3,2],Colorado:[3,3],Nebraska:[3,4],
  Missouri:[3,5],Kentucky:[3,6],"West Virginia":[3,7],Virginia:[3,8],Maryland:[3,9],
  Delaware:[4,10],Arizona:[4,2],"New Mexico":[4,3],Kansas:[4,4],Oklahoma:[4,5],
  Arkansas:[4,6],Tennessee:[4,7],"North Carolina":[4,8],"South Carolina":[4.5,9],
  Hawaii:[5,0],Texas:[5,4],Louisiana:[5,6],Mississippi:[5,7],Alabama:[5,8],Georgia:[5,9],
  "District of Columbia":[3.5,9.4],Florida:[6,9],
};

const CELL = 56, GAP = 4;
const GRID_COLS = Math.max(...Object.values(GRID).map(([,c]) => c)) + 1;
const GRID_ROWS = Math.max(...Object.values(GRID).map(([r]) => r)) + 1;

// ── Types ──────────────────────────────────────────────────────────────────────

interface StateEntry {
  total: number;
  byLevel: Partial<Record<GovLevel, PurplbookMember[]>>;
}

// ── Data mapping ──────────────────────────────────────────────────────────────
// Uses member.state directly — no text parsing. Requires the edge function
// to populate state and level per member (updated in purplbook-directory).

function buildStateMap(orgs: PurplbookOrg[]): Record<string, StateEntry> {
  const map: Record<string, StateEntry> = {};

  for (const org of orgs) {
    for (const member of org.members) {
      const st = member.state?.trim();
      if (!st || !ALL_STATES.includes(st)) continue;

      if (!map[st]) map[st] = { total: 0, byLevel: {} };

      const raw = member.level?.trim() as GovLevel;
      const lvl: GovLevel = LEVEL_ORDER.includes(raw) ? raw : "State";

      if (!map[st].byLevel[lvl]) map[st].byLevel[lvl] = [];
      map[st].byLevel[lvl]!.push(member);
      map[st].total++;
    }
  }

  return map;
}

function tileColor(total: number, max: number): string {
  if (total === 0) return "transparent";
  const t = Math.min(1, Math.log(total + 1) / Math.log(max + 1));
  const lightness = 82 - t * 50;
  return `hsl(152 34% ${lightness}%)`;
}

// ── Shared roster panel ───────────────────────────────────────────────────────

function StateRosterPanel({
  state,
  entry,
  onClose,
  compact = false,
}: {
  state: string;
  entry: StateEntry | undefined;
  onClose: () => void;
  compact?: boolean;
}) {
  const [activeLevel, setActiveLevel] = useState<GovLevel | null>(null);
  const byLevel = entry?.byLevel ?? {};
  const total = entry?.total ?? 0;
  const presentLevels = LEVEL_ORDER.filter(l => (byLevel[l]?.length ?? 0) > 0);
  const displayLevels = activeLevel ? [activeLevel] : presentLevels;

  return (
    <div className={compact
      ? "px-7 pb-5 pt-3 bg-gray-50 border-t border-gray-200"
      : "px-7 py-5 bg-white"}>
      <div className="flex items-baseline justify-between mb-3 gap-4">
        <div>
          {!compact && (
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              {state}
            </h3>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            {total === 0
              ? "No documented officials at any level"
              : `${total} documented official${total !== 1 ? "s" : ""} across ${presentLevels.length} level${presentLevels.length !== 1 ? "s" : ""} of government`}
          </p>
        </div>
        {!compact && (
          <button
            onClick={onClose}
            className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 hover:text-gray-600 transition-colors"
          >
            close ×
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-gray-700">
          <strong className="text-red-600">No entry.</strong> No Black elected officials
          are currently documented for {state} at any level of government.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {presentLevels.map(lvl => {
              const style = LEVEL_STYLES[lvl] ?? LEVEL_STYLES.State;
              const active = activeLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(active ? null : lvl)}
                  className={`rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : `${style.border} ${style.text} bg-white hover:${style.bg}`
                  }`}
                >
                  {LEVEL_LABEL[lvl]} · {byLevel[lvl]?.length ?? 0}
                </button>
              );
            })}
          </div>

          {displayLevels.map(lvl => {
            const members = byLevel[lvl] ?? [];
            if (!members.length) return null;
            const style = LEVEL_STYLES[lvl] ?? LEVEL_STYLES.State;
            return (
              <div key={lvl} className="mb-4">
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${style.text}`}>
                  {LEVEL_LABEL[lvl]}
                </div>
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {members.map((m, i) => (
                    <a
                      key={i}
                      href={m.website || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between gap-3 px-3 py-2 text-sm group transition-colors ${
                        m.website ? "hover:bg-gray-50 cursor-pointer" : ""
                      } ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900">{m.name}</span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {m.title}
                          {m.district ? ` · ${m.district}` : ""}
                          {m.party ? ` · ${m.party}` : ""}
                          {m.since ? ` · since ${m.since}` : ""}
                        </div>
                      </div>
                      {m.website && (
                        <span className="flex-shrink-0 text-xs text-liberation-purple opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          open <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Atlas view ────────────────────────────────────────────────────────────────

function AtlasView({
  stateMap,
  query,
  openState,
  setOpenState,
}: {
  stateMap: Record<string, StateEntry>;
  query: string;
  openState: string | null;
  setOpenState: (s: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const max = Math.max(1, ...Object.values(stateMap).map(s => s.total));

  const filteredSet = useMemo(() =>
    new Set(q ? ALL_STATES.filter(s => s.toLowerCase().includes(q)) : ALL_STATES),
    [q]
  );

  return (
    <div className="px-4 pt-6 pb-0">
      <svg
        viewBox={`0 0 ${GRID_COLS * (CELL + GAP)} ${(GRID_ROWS + 0.5) * (CELL + GAP)}`}
        className="w-full max-w-3xl block"
        style={{ height: "auto" }}
      >
        <defs>
          <pattern id="hatchZero" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="hsl(0 72% 45% / 0.15)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="hsl(0 72% 45% / 0.4)" strokeWidth="1.4" />
          </pattern>
        </defs>
        {Object.entries(GRID).map(([name, [r, c]]) => {
          const entry = stateMap[name];
          const total = entry?.total ?? 0;
          const isZero = total === 0;
          const dimmed = q && !filteredSet.has(name);
          const isOpen = openState === name;
          const x = c * (CELL + GAP);
          const y = r * (CELL + GAP);
          return (
            <g
              key={name}
              opacity={dimmed ? 0.2 : 1}
              style={{ cursor: "pointer" }}
              onClick={() => setOpenState(isOpen ? null : name)}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={x} y={y} width={CELL} height={CELL} rx={4}
                fill={isZero ? "url(#hatchZero)" : tileColor(total, max)}
                stroke={isOpen ? "#5B2A6F" : "#e5e7eb"}
                strokeWidth={isOpen ? 2.5 : 1}
                style={{ transition: "stroke 0.1s ease" }}
              />
              <text
                x={x + CELL / 2} y={y + CELL / 2 - 4}
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="600"
                fontSize="13"
                fill={isZero ? "#9ca3af" : "#1f2937"}
              >
                {ABBR[name]}
              </text>
              <text
                x={x + CELL / 2} y={y + CELL / 2 + 14}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="11"
                fill={isZero ? "#9ca3af" : "#374151"}
              >
                {total}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-left text-xs text-gray-400 mt-2 h-4">
        {hovered ? (
          <span>
            <strong className="text-gray-700">{hovered}</strong>
            {" — "}{stateMap[hovered]?.total ?? 0} documented official{(stateMap[hovered]?.total ?? 0) !== 1 ? "s" : ""}
          </span>
        ) : "Hover a tile for a count · click to open its roster below"}
      </div>

      <div className="flex gap-5 flex-wrap text-[11px] text-gray-400 py-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(152 34% 32%)" }} />
          High representation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(152 34% 65%)" }} />
          Some representation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-red-300"
            style={{ background: "repeating-linear-gradient(45deg, hsl(0 72% 45% / 0.15) 0 2px, white 2px 4px)" }} />
          Zero documented
        </span>
      </div>

      <div className="border-t-2 border-gray-200 mt-1">
        {openState ? (
          <StateRosterPanel
            state={openState}
            entry={stateMap[openState]}
            onClose={() => setOpenState(null)}
          />
        ) : (
          <p className="text-left text-xs text-gray-400 py-6">
            Click any tile above to open its roster here.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Ledger view ───────────────────────────────────────────────────────────────

function LedgerView({
  stateMap,
  query,
  openState,
  setOpenState,
}: {
  stateMap: Record<string, StateEntry>;
  query: string;
  openState: string | null;
  setOpenState: (s: string | null) => void;
}) {
  const max = Math.max(1, ...Object.values(stateMap).map(s => s.total));
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() =>
    ALL_STATES.filter(s => !q || s.toLowerCase().includes(q)), [q]);

  return (
    <div className="pb-10">
      {filtered.map(st => {
        const entry = stateMap[st];
        const total = entry?.total ?? 0;
        const isZero = total === 0;
        const widthPct = (total / max) * 100;
        const isOpen = openState === st;

        return (
          <div key={st} className="border-b border-gray-200">
            <button
              onClick={() => setOpenState(isOpen ? null : st)}
              className="w-full flex items-center gap-4 px-0 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 ${
                  isOpen ? "rotate-90 text-liberation-purple" : "text-gray-300"
                }`}
              />
              <span className={`font-bold text-base flex-shrink-0 w-48 ${
                isZero ? "text-red-500" : "text-gray-900"
              }`}>
                {st}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(widthPct, isZero ? 0 : 2)}%`,
                    background: isZero ? "hsl(0 72% 45%)" : "hsl(145 60% 30%)",
                  }}
                />
              </div>
              <span className={`font-mono text-sm font-semibold w-8 text-right flex-shrink-0 ${
                isZero ? "text-red-400" : "text-gray-600"
              }`}>
                {total}
              </span>
            </button>

            {isOpen && (
              <StateRosterPanel
                state={st}
                entry={entry}
                onClose={() => setOpenState(null)}
                compact
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Submit view ───────────────────────────────────────────────────────────────

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : null;

const EMPTY_MEMBER_FORM = {
  fullName:"", orgName:"", titleRole:"", level:"", officeType:"",
  state:"", district:"", party:"", servingSince:"", website:"",
  contact:"", phone:"", notes:"", source:"", submitterName:"", submitterEmail:"",
};

const EMPTY_ORG_FORM = {
  orgName:"", level:"", stateScope:"", founded:"", website:"", contact:"",
  phone:"", currentChair:"", membershipSize:"", missionSummary:"",
  source:"", submitterName:"", submitterEmail:"",
};

type SubmitKind = "member" | "organization";

function SubmitView() {
  const [kind, setKind] = useState<SubmitKind>("member");
  return (
    <div className="max-w-xl pt-6 pb-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Submit to purplbook</h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">
        Know a Black elected official or organization that isn't in purplbook yet?
        Every submission goes to a private review queue and is verified by the
        Liberation Caucus against a public source before anything is added.
      </p>

      <div className="flex gap-3 mb-8">
        {(["member", "organization"] as SubmitKind[]).map(k => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`flex-1 border rounded-lg px-4 py-3 text-sm font-semibold text-center transition-colors ${
              kind === k
                ? "border-liberation-purple bg-liberation-purple/10 text-liberation-purple"
                : "border-gray-200 text-gray-500 hover:text-gray-700"
            }`}
          >
            {k === "member" ? "An elected official" : "An organization"}
          </button>
        ))}
      </div>

      {kind === "member" ? <MemberForm /> : <OrgForm />}
    </div>
  );
}

function useFormState<T extends Record<string, string>>(empty: T) {
  const [form, setForm] = useState<T>(empty);
  const [status, setStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const update = (field: keyof T, value: string) =>
    setForm(f => ({ ...f, [field]: value }));
  return { form, update, status, setStatus, errorMsg, setErrorMsg, reset: () => setForm(empty) };
}

function SuccessBanner({ kind, onReset }: { kind: string; onReset: () => void }) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="font-bold text-gray-900 text-lg">Submission received</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        This {kind} has been sent to the Liberation Caucus review queue.
        Entries are added to purplbook only after a reviewer verifies the
        information against an official source — this usually takes a few days.
      </p>
      <button onClick={onReset} className="text-sm font-semibold text-liberation-purple hover:underline">
        Submit another
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2 text-sm text-gray-700 mb-4">
      <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
      {message}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-liberation-purple";

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Divider() {
  return <div className="border-t border-gray-100 my-6" />;
}

function SubmitBtn({ submitting }: { submitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full bg-liberation-purple hover:bg-liberation-purple/80 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wide text-sm"
    >
      {submitting ? "Submitting…" : "Submit for review"}
    </button>
  );
}

async function postToEdge(endpoint: string, payload: object): Promise<void> {
  if (!SUPABASE_FUNCTIONS_URL) throw new Error("Supabase URL not configured.");
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string })?.error ?? `Request failed (${res.status})`);
  }
}

function MemberForm() {
  const { form, update, status, setStatus, errorMsg, setErrorMsg, reset } = useFormState(EMPTY_MEMBER_FORM);

  function validate(): string | null {
    if (!form.fullName.trim()) return "The official's full name is required.";
    if (!form.orgName.trim()) return "Organization name is required.";
    if (!form.titleRole.trim()) return "Title or role is required.";
    if (!form.level) return "Level of government is required.";
    if (!form.state) return "State or territory is required.";
    if (!form.source.trim()) return "A source link or citation is required for verification.";
    if (!form.submitterEmail.trim()) return "Your email is required so the Caucus can follow up.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setStatus("error"); setErrorMsg(v); return; }
    setStatus("submitting");
    try {
      await postToEdge("purplbook-submit", {
        kind: "member",
        "Full Name": form.fullName,
        "Org Name (text)": form.orgName,
        "Title/Role": form.titleRole,
        "Level": form.level,
        "Office Type": form.officeType,
        "State/Territory": form.state,
        "District/Jurisdiction": form.district,
        "Party": form.party,
        ...(form.servingSince ? { "Serving Since": Number(form.servingSince) } : {}),
        "Website": form.website,
        "Contact": form.contact,
        "Phone": form.phone,
        "Notes": form.notes,
        "Source": form.source,
        "Submitter Name": form.submitterName,
        "Submitter Email": form.submitterEmail,
      });
      setStatus("success"); reset();
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") return <SuccessBanner kind="official" onReset={() => setStatus("idle")} />;

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Official's full name" required>
        <Input className={inputCls} value={form.fullName} onChange={e => update("fullName", e.target.value)} placeholder="e.g. Jane A. Carter" />
      </Field>
      <Field label="Organization / caucus name" required>
        <Input className={inputCls} value={form.orgName} onChange={e => update("orgName", e.target.value)} placeholder="e.g. Michigan Legislative Black Caucus" />
      </Field>
      <FormRow>
        <Field label="Title / role" required>
          <Input className={inputCls} value={form.titleRole} onChange={e => update("titleRole", e.target.value)} placeholder="e.g. State Representative" />
        </Field>
        <Field label="Office type">
          <Input className={inputCls} value={form.officeType} onChange={e => update("officeType", e.target.value)} placeholder="e.g. State House" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Level of government" required>
          <Select value={form.level} onValueChange={v => update("level", v)}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {LEVEL_ORDER.map(l => <SelectItem key={l} value={l}>{LEVEL_LABEL[l]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="State / territory" required>
          <Select value={form.state} onValueChange={v => update("state", v)}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {ALL_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </FormRow>
      <FormRow>
        <Field label="District / jurisdiction">
          <Input className={inputCls} value={form.district} onChange={e => update("district", e.target.value)} placeholder="e.g. District 12" />
        </Field>
        <Field label="Party">
          <Input className={inputCls} value={form.party} onChange={e => update("party", e.target.value)} placeholder="e.g. D" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Serving since (year)">
          <Input className={inputCls} value={form.servingSince} onChange={e => update("servingSince", e.target.value)} placeholder="e.g. 2023" />
        </Field>
        <Field label="Phone">
          <Input className={inputCls} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Office phone" />
        </Field>
      </FormRow>
      <Field label="Official website">
        <Input className={inputCls} value={form.website} onChange={e => update("website", e.target.value)} placeholder="https://" />
      </Field>
      <Field label="Contact">
        <Input className={inputCls} value={form.contact} onChange={e => update("contact", e.target.value)} placeholder="Email or contact form" />
      </Field>
      <Field label="Notes">
        <Textarea className={inputCls} value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Anything else worth knowing." rows={2} />
      </Field>
      <Field label="Source — link or citation" required>
        <Textarea className={inputCls} value={form.source} onChange={e => update("source", e.target.value)}
          placeholder="A link to an official bio page, government directory, or news coverage. This is what the reviewer checks against." rows={3} />
      </Field>
      <Divider />
      <FormRow>
        <Field label="Your name">
          <Input className={inputCls} value={form.submitterName} onChange={e => update("submitterName", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Your email" required>
          <Input className={inputCls} type="email" value={form.submitterEmail} onChange={e => update("submitterEmail", e.target.value)} placeholder="For follow-up if needed" />
        </Field>
      </FormRow>
      {status === "error" && <ErrorBanner message={errorMsg} />}
      <SubmitBtn submitting={status === "submitting"} />
      <p className="text-[11px] text-gray-400 mt-3">
        Submissions go to a private review queue — nothing appears publicly until approved.
      </p>
    </form>
  );
}

function OrgForm() {
  const { form, update, status, setStatus, errorMsg, setErrorMsg, reset } = useFormState(EMPTY_ORG_FORM);

  function validate(): string | null {
    if (!form.orgName.trim()) return "Organization name is required.";
    if (!form.level) return "Level of government is required.";
    if (!form.missionSummary.trim()) return "A short mission summary is required.";
    if (!form.source.trim()) return "A source link or citation is required for verification.";
    if (!form.submitterEmail.trim()) return "Your email is required so the Caucus can follow up.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setStatus("error"); setErrorMsg(v); return; }
    setStatus("submitting");
    try {
      await postToEdge("purplbook-submit", {
        kind: "organization",
        "Org Name": form.orgName,
        "Level": form.level,
        "State Scope": form.stateScope,
        "Founded": form.founded,
        "Website": form.website,
        "Contact": form.contact,
        "Phone": form.phone,
        "Current Chair/Leader": form.currentChair,
        "Membership Size": form.membershipSize,
        "Mission Summary": form.missionSummary,
        "Source": form.source,
        "Submitter Name": form.submitterName,
        "Submitter Email": form.submitterEmail,
      });
      setStatus("success"); reset();
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") return <SuccessBanner kind="organization" onReset={() => setStatus("idle")} />;

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Organization name" required>
        <Input className={inputCls} value={form.orgName} onChange={e => update("orgName", e.target.value)} placeholder="e.g. Iowa Legislative Black Caucus" />
      </Field>
      <FormRow>
        <Field label="Level of government" required>
          <Select value={form.level} onValueChange={v => update("level", v)}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {["Federal","National Umbrella","State","Local"].map(l =>
                <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="State scope">
          <Input className={inputCls} value={form.stateScope} onChange={e => update("stateScope", e.target.value)} placeholder="e.g. Iowa, or National" />
        </Field>
      </FormRow>
      <FormRow>
        <Field label="Founded">
          <Input className={inputCls} value={form.founded} onChange={e => update("founded", e.target.value)} placeholder="Year or N/A" />
        </Field>
        <Field label="Membership size">
          <Input className={inputCls} value={form.membershipSize} onChange={e => update("membershipSize", e.target.value)} placeholder="e.g. 12 legislators" />
        </Field>
      </FormRow>
      <Field label="Current chair / leader">
        <Input className={inputCls} value={form.currentChair} onChange={e => update("currentChair", e.target.value)} placeholder="Name and title, if known" />
      </Field>
      <FormRow>
        <Field label="Website">
          <Input className={inputCls} value={form.website} onChange={e => update("website", e.target.value)} placeholder="https://" />
        </Field>
        <Field label="Phone">
          <Input className={inputCls} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Optional" />
        </Field>
      </FormRow>
      <Field label="Contact">
        <Input className={inputCls} value={form.contact} onChange={e => update("contact", e.target.value)} placeholder="Email or contact form" />
      </Field>
      <Field label="Mission summary" required>
        <Textarea className={inputCls} value={form.missionSummary} onChange={e => update("missionSummary", e.target.value)}
          placeholder="One or two sentences on what this organization does and who it represents." rows={3} />
      </Field>
      <Field label="Source — link or citation" required>
        <Textarea className={inputCls} value={form.source} onChange={e => update("source", e.target.value)}
          placeholder="A link to the organization's official site or news coverage confirming it exists and is active." rows={3} />
      </Field>
      <Divider />
      <FormRow>
        <Field label="Your name">
          <Input className={inputCls} value={form.submitterName} onChange={e => update("submitterName", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Your email" required>
          <Input className={inputCls} type="email" value={form.submitterEmail} onChange={e => update("submitterEmail", e.target.value)} placeholder="For follow-up if needed" />
        </Field>
      </FormRow>
      {status === "error" && <ErrorBanner message={errorMsg} />}
      <SubmitBtn submitting={status === "submitting"} />
      <p className="text-[11px] text-gray-400 mt-3">
        Submissions go to a private review queue — nothing appears publicly until approved.
      </p>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const PurplBook = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { data, isLoading, isError, refetch } = usePurplbookDirectory();
  const [view, setView] = useState<ViewTab>("atlas");
  const [query, setQuery] = useState("");
  const [openState, setOpenState] = useState<string | null>(null);

  const organizations = useMemo(() => (data?.organizations ?? []) as PurplbookOrg[], [data?.organizations]);
  const stateMap = useMemo(() => buildStateMap(organizations), [organizations]);

  useEffect(() => { setOpenState(null); }, [view]);

  return (
    <>
      <Helmet>
        <title>purplbook | Black Elected Official Directory | Liberation Caucus</title>
        <meta name="description"
          content="A directory of Black elected officials and legislative caucus organizations across federal, state, and local government in the United States, maintained by the Liberation Caucus." />
      </Helmet>

      <Header />

      <main className="pt-20 bg-white min-h-screen">
        {/* Hero */}
        <section className="py-10 md:py-14 border-b border-gray-100" ref={heroRef}>
          <div className={`container mx-auto px-6 max-w-5xl animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <span className="text-liberation-purple font-semibold text-xs tracking-widest uppercase">
              Liberation Caucus
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-3">
              purpl<span className="text-black">book</span>
            </h1>
            <p className="text-base text-gray-500 max-w-xl">
              The Black elected official representation tracker — every documented official,
              organized by state, then by level of government.
            </p>
            <div className="mt-5 flex flex-wrap gap-8">
              {[
                { label: "Organizations", value: organizations.length || "—" },
                { label: "Officials Tracked", value: data ? `${data.totalMembers}+` : "—" },
                { label: "States Covered", value: isLoading ? "—" : `${Object.keys(stateMap).length}+` },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-liberation-purple">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* View switcher + search */}
        <div className="sticky top-20 z-10 bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex items-center justify-between gap-4 flex-wrap py-1">
              <div className="flex">
                {NAV_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setView(tab)}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-[3px] transition-colors ${
                      view === tab
                        ? "border-liberation-purple text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {view !== "submit" && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Find a state…"
                    className="pl-8 py-1.5 h-8 text-xs border-gray-200 w-44 focus:border-liberation-purple"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 max-w-5xl">
          {isLoading && (
            <div className="pt-8 space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full bg-gray-100" />)}
            </div>
          )}

          {isError && (
            <div className="pt-8">
              <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                <p className="text-gray-700 text-sm">
                  The directory couldn't load. Please try again in a moment.
                </p>
                <button onClick={() => refetch()}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-liberation-purple hover:underline">
                  <RefreshCw className="h-3.5 w-3.5" /> Try again
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {view === "atlas" && (
                <AtlasView stateMap={stateMap} query={query} openState={openState} setOpenState={setOpenState} />
              )}
              {view === "ledger" && (
                <LedgerView stateMap={stateMap} query={query} openState={openState} setOpenState={setOpenState} />
              )}
              {view === "submit" && <SubmitView />}
            </>
          )}

          {view !== "submit" && !isLoading && !isError && (
            <div className="mt-6 pb-16">
              <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
                <strong className="text-gray-500">Note:</strong> Data reflects publicly
                available information, refreshed periodically. Leadership and membership
                change with each election and legislative session — visit official
                organization websites for complete, current rosters.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PurplBook;
