import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Scale,
  Search,
  ExternalLink,
  RefreshCw,
  FileText,
  Download,
  Landmark,
  Map,
  Building2,
  BookOpenText,
} from "lucide-react";
import {
  usePolicyLedger,
  type LedgerBill,
  type LedgerFactSheet,
  type LevelOfGovernment,
} from "@/hooks/usePolicyLedger";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Mirrors purplbook's LEVEL_STYLES (PurplBook.tsx) so "Federal"/"State"/"Local"
// mean the same color across every Liberation Caucus tool. Local is included
// for forward-compatibility (e.g. Detroit City Council resolutions) even
// though nothing in the ledger is Local yet.
const LEVEL_STYLES: Record<
  LevelOfGovernment,
  { text: string; bg: string; border: string; icon: typeof Landmark }
> = {
  Federal: { text: "text-liberation-gold", bg: "bg-liberation-gold/10", border: "border-liberation-gold/30", icon: Landmark },
  State: { text: "text-liberation-green", bg: "bg-liberation-green/10", border: "border-liberation-green/30", icon: Map },
  Local: { text: "text-liberation-purple", bg: "bg-liberation-purple/10", border: "border-liberation-purple/30", icon: Building2 },
  "": { text: "text-gray-400", bg: "bg-gray-100", border: "border-gray-200", icon: Landmark },
};

const LEVELS: LevelOfGovernment[] = ["Federal", "State", "Local"];

// Known-outcome statuses get semantic color; anything else (new LegiScan
// status strings, etc.) falls back to a neutral gray outline rather than
// silently rendering unstyled.
const STATUS_TONE: Record<string, "green" | "red" | "gold" | "neutral"> = {
  "Signed into Law": "green",
  "Enacted": "green",
  "Passed House": "gold",
  "Passed Senate": "gold",
  "Passed House, sent to Senate": "gold",
  "Died in Committee": "red",
  "Failed": "red",
};

function StatusBadge({ status }: { status: string }) {
  if (!status) return null;
  const tone = STATUS_TONE[status] ?? "neutral";
  const cls =
    tone === "green"
      ? "text-liberation-green border-liberation-green/30 bg-liberation-green/10"
      : tone === "red"
        ? "text-liberation-red border-liberation-red/30 bg-liberation-red/10"
        : tone === "gold"
          ? "text-liberation-gold border-liberation-gold/30 bg-liberation-gold/10"
          : "text-gray-500 border-gray-300 bg-gray-50";
  return <Badge variant="outline" className={`shrink-0 font-normal ${cls}`}>{status}</Badge>;
}

function LevelBadge({ level }: { level: LevelOfGovernment }) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES[""];
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${style.text} ${style.bg} ${style.border}`}>
      <Icon className="w-3 h-3" />
      {level || "Unclassified"}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function FactSheetCard({ sheet, onRead }: { sheet: LedgerFactSheet; onRead?: (sheet: LedgerFactSheet) => void }) {
  const primaryFile = sheet.files[0];
  const hasWebBrief = Boolean(sheet.content && sheet.content.trim() !== "");
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <FileText className="w-4 h-4 text-liberation-gold shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">{sheet.title}</div>
          {sheet.summary && <p className="text-xs text-gray-600 mt-1">{sheet.summary}</p>}
          {sheet.date && <p className="text-[11px] text-gray-400 mt-1">Updated {sheet.date}</p>}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {hasWebBrief && (
              <Button
                size="sm"
                className="h-7 text-xs bg-liberation-gold hover:bg-liberation-gold/90 text-white font-semibold"
                onClick={() => onRead?.(sheet)}
              >
                Read online
                <BookOpenText className="w-3 h-3 ml-1" />
              </Button>
            )}
            {primaryFile && (
              <Button
                size="sm"
                variant={hasWebBrief ? "outline" : "default"}
                className={hasWebBrief
                  ? "h-7 text-xs border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-white"
                  : "h-7 text-xs bg-liberation-gold hover:bg-liberation-gold/90 text-white font-semibold"}
                asChild
              >
                <a href={primaryFile.url} target="_blank" rel="noopener noreferrer">
                  Download {formatFileSize(primaryFile.size) && `(${formatFileSize(primaryFile.size)})`}
                  <Download className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
            {sheet.relatedLink && (
              <Button variant="outline" size="sm" className="h-7 text-xs border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-white" asChild>
                <a href={sheet.relatedLink} target="_blank" rel="noopener noreferrer">
                  Related coverage <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Web brief: full text published straight from the `content` column, no PDF
// or design pass required. Basic paragraph splitting on blank lines --
// content is expected to be plain text/simple markdown-ish, not raw HTML.
function BriefReaderDialog({ sheet, onClose }: { sheet: LedgerFactSheet | null; onClose: () => void }) {
  if (!sheet) return null;
  const paragraphs = sheet.content.split(/\n\s*\n/).filter((p) => p.trim() !== "");
  return (
    <Dialog open={Boolean(sheet)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">{sheet.title}</DialogTitle>
          {sheet.date && <DialogDescription className="text-gray-500">Updated {sheet.date}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 mt-2 text-sm text-gray-700 leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BillDetailDialog({
  bill,
  onClose,
  onReadBrief,
}: {
  bill: LedgerBill | null;
  onClose: () => void;
  onReadBrief: (sheet: LedgerFactSheet) => void;
}) {
  if (!bill) return null;
  return (
    <Dialog open={Boolean(bill)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <LevelBadge level={bill.levelOfGovernment} />
            <StatusBadge status={bill.status} />
          </div>
          <DialogTitle className="text-xl text-gray-900">
            <span className="font-mono text-base text-gray-500 mr-2">{bill.billNumber}</span>
            {bill.title}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {bill.governmentBody}
            {bill.chamber ? ` · ${bill.chamber}` : ""}
            {bill.session ? ` · ${bill.session}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {bill.sponsors.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Sponsor{bill.sponsors.length === 1 ? "" : "s"}
              </div>
              <p className="text-sm text-gray-700">
                {bill.sponsors.map((s) => `${s.role === "co-sponsor" ? "Co-sponsor " : ""}${s.name}`).join(" · ")}
              </p>
            </div>
          )}

          {bill.summary && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                What's been proposed
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{bill.summary}</p>
            </div>
          )}

          {bill.notes && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Notes
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{bill.notes}</p>
            </div>
          )}

          {bill.sourceUrl && (
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" asChild>
              <a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer">
                View official bill text <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
            </Button>
          )}

          {bill.campaign && (
            <div className="rounded-lg border border-liberation-purple/20 bg-liberation-purple/5 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-liberation-purple mb-1">
                Liberation Caucus campaign
              </div>
              <div className="text-sm font-semibold text-gray-900">{bill.campaign.name}</div>
              {bill.campaign.description && (
                <p className="text-xs text-gray-600 mt-1">{bill.campaign.description}</p>
              )}
            </div>
          )}

          {bill.relatedFactSheets.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-liberation-gold mb-2">
                <FileText className="w-3 h-3" /> Related Liberation Caucus content
              </div>
              <div className="space-y-2">
                {bill.relatedFactSheets.map((sheet) => (
                  <FactSheetCard key={sheet.id} sheet={sheet} onRead={onReadBrief} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PolicyLedger = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { data, isLoading, isError, refetch } = usePolicyLedger();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelOfGovernment | "All">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedBill, setSelectedBill] = useState<LedgerBill | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<LedgerFactSheet | null>(null);

  const legislation = useMemo(() => data?.legislation ?? [], [data?.legislation]);
  const factSheets = useMemo(() => data?.factSheets ?? [], [data?.factSheets]);

  const statuses = useMemo(
    () => Array.from(new Set(legislation.map((b) => b.status).filter(Boolean))).sort(),
    [legislation]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return legislation.filter((b) => {
      const matchesLevel = levelFilter === "All" || b.levelOfGovernment === levelFilter;
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const matchesSearch =
        !q ||
        b.billNumber.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.governmentBody.toLowerCase().includes(q) ||
        b.sponsors.some((s) => s.name.toLowerCase().includes(q));
      return matchesLevel && matchesStatus && matchesSearch;
    });
  }, [legislation, search, levelFilter, statusFilter]);

  return (
    <>
      <Helmet>
        <title>Policy Ledger | Liberation Caucus</title>
        <meta
          name="description"
          content="Every piece of legislation the Liberation Caucus tracks — level of government, sponsoring body, and sponsor — plus the policy briefs behind them."
        />
      </Helmet>

      <Header />

      {/* bg-white + hero/container conventions matched to purplbook and
          Michigan Essentials Watch so all three tools read as one product
          family. See UtilityRateTracker.tsx for the same pattern. */}
      <main className="pt-20 bg-white min-h-screen">
        <section className="py-10 md:py-14 border-b border-gray-100" ref={heroRef}>
          <div className={`container mx-auto px-6 max-w-5xl animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-liberation-gold/10 mb-4">
              <Scale className="w-6 h-6 text-liberation-gold" />
            </div>
            <span className="text-liberation-gold font-semibold text-xs tracking-widest uppercase">
              Liberation Caucus
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-3">
              <span className="text-gray-900">Policy </span>
              <span className="text-liberation-gold">Ledger</span>
            </h1>
            <p className="text-base text-gray-500 max-w-xl">
              A running register of legislation the Caucus tracks — what's proposed, at what
              level of government, by whom. Policy briefs with fuller context are below.
            </p>
            <div className="mt-5 flex flex-wrap gap-8">
              {[
                { label: "Bills Tracked", value: legislation.length || "—" },
                { label: "Policy Briefs", value: factSheets.length || "—" },
                { label: "Levels of Government", value: 3 },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-liberation-gold">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            {/* ── The ledger ── */}
            <div className="pt-8">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a bill, sponsor, or body…"
                  className="pl-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {(["All", ...LEVELS] as const).map((lvl) => {
                  const active = levelFilter === lvl;
                  const style = lvl === "All" ? null : LEVEL_STYLES[lvl];
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevelFilter(lvl)}
                      className={`rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : style
                            ? `${style.border} ${style.text} bg-white hover:${style.bg}`
                            : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {["All", ...statuses].map((s) => {
                  const active = statusFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {isLoading && (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-gray-100" />
                  ))}
                </div>
              )}

              {isError && (
                <div className="rounded-xl border border-liberation-red/30 bg-liberation-red/5 p-6 text-center">
                  <p className="text-gray-700">The policy ledger couldn't load. Try again in a moment.</p>
                  <button
                    onClick={() => refetch()}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-liberation-gold hover:underline"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <div className="rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                  No legislation matches your filters.
                </div>
              )}

              {!isLoading && !isError && filtered.length > 0 && (
                <div className="rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-left text-[10px] uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-2.5 font-bold">Legislation</th>
                        <th className="px-4 py-2.5 font-bold whitespace-nowrap">Level</th>
                        <th className="px-4 py-2.5 font-bold">Organization</th>
                        <th className="px-4 py-2.5 font-bold">Sponsor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((bill, i) => (
                        <tr
                          key={bill.id}
                          onClick={() => setSelectedBill(bill)}
                          className={`cursor-pointer hover:bg-liberation-gold/5 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="font-mono text-xs font-semibold text-gray-900">{bill.billNumber}</div>
                            <div className="text-gray-600 mt-0.5">{bill.title}</div>
                          </td>
                          <td className="px-4 py-3 align-top whitespace-nowrap">
                            <LevelBadge level={bill.levelOfGovernment} />
                          </td>
                          <td className="px-4 py-3 align-top text-gray-600">{bill.governmentBody || "—"}</td>
                          <td className="px-4 py-3 align-top text-gray-600">
                            {bill.sponsors[0]?.name ?? "—"}
                            {bill.sponsors.length > 1 && (
                              <span className="text-gray-400"> +{bill.sponsors.length - 1}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Policy briefs ── */}
            {!isLoading && !isError && factSheets.length > 0 && (
              <div className="pt-16">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-liberation-gold" />
                  <h2 className="text-lg font-bold text-gray-900">Policy Briefs</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4 max-w-xl">
                  Context and analysis behind the ledger above — not tied to a single bill.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {factSheets.map((sheet) => (
                    <FactSheetCard key={sheet.id} sheet={sheet} onRead={setSelectedBrief} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <BillDetailDialog bill={selectedBill} onClose={() => setSelectedBill(null)} onReadBrief={setSelectedBrief} />
      <BriefReaderDialog sheet={selectedBrief} onClose={() => setSelectedBrief(null)} />

      <Footer />
    </>
  );
};

export default PolicyLedger;
