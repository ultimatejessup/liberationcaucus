import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  RefreshCw,
  BookOpen,
  ChevronRight,
  Scale,
} from "lucide-react";
import {
  usePolicyLibrary,
  type PolicyCampaign,
  type PolicyLegislation,
  type PolicyFactSheet,
} from "@/hooks/usePolicyLibrary";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

const STATUS_STYLES: Record<string, string> = {
  "In Committee": "bg-liberation-gold/10 text-liberation-gold border-liberation-gold/30",
  "Introduced": "bg-liberation-green/10 text-liberation-green border-liberation-green/30",
};

function StatusBadge({ status }: { status: string }) {
  if (!status) return null;
  const cls = STATUS_STYLES[status] ?? "bg-liberation-cream/10 text-liberation-cream/60 border-liberation-cream/20";
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${cls}`}>
      {status}
    </span>
  );
}

function LegislationRow({ bill }: { bill: PolicyLegislation }) {
  const content = (
    <>
      <span className="font-mono text-sm font-semibold text-liberation-cream shrink-0 min-w-[130px]">
        {bill.billNumber}
      </span>
      <span className="text-sm text-liberation-cream/70 flex-1">{bill.title}</span>
      <StatusBadge status={bill.status} />
      <span className="text-xs text-liberation-cream/40 shrink-0 hidden sm:inline">{bill.chamber}</span>
    </>
  );

  const rowCls =
    "flex flex-wrap items-center gap-2.5 px-3 py-2.5 rounded-md border border-liberation-cream/10 bg-liberation-cream/[0.03]";

  if (bill.sourceUrl) {
    return (
      <a
        href={bill.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${rowCls} hover:border-liberation-gold/30 hover:bg-liberation-cream/[0.06] transition-colors group`}
      >
        {content}
        <ExternalLink className="w-3 h-3 text-liberation-cream/0 group-hover:text-liberation-gold/70 transition-colors shrink-0" />
      </a>
    );
  }
  return <div className={rowCls}>{content}</div>;
}

function FactSheetRow({ sheet }: { sheet: PolicyFactSheet }) {
  const primaryFile = sheet.files[0];
  return (
    <div className="rounded-md border border-liberation-cream/10 bg-liberation-cream/[0.03] p-3">
      <div className="flex items-start gap-3">
        <FileText className="w-4 h-4 text-liberation-gold shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-liberation-cream">{sheet.title}</div>
          {sheet.summary && (
            <p className="text-xs text-liberation-cream/60 mt-1">{sheet.summary}</p>
          )}
          {sheet.date && (
            <p className="text-[11px] text-liberation-cream/35 mt-1">Updated {sheet.date}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {primaryFile && (
              <Button
                size="sm"
                className="h-7 text-xs bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
                asChild
              >
                <a href={primaryFile.url} target="_blank" rel="noopener noreferrer">
                  Download {formatFileSize(primaryFile.size) && `(${formatFileSize(primaryFile.size)})`}
                  <Download className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
            {sheet.relatedLink && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark"
                asChild
              >
                <a href={sheet.relatedLink} target="_blank" rel="noopener noreferrer">
                  Related coverage <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
            {sheet.files.length > 1 && (
              <span className="text-[11px] text-liberation-cream/35 self-center">
                +{sheet.files.length - 1} more file{sheet.files.length - 1 === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ledger row: one campaign, inline-expanding to show its bills + fact sheets ──

function CampaignRow({
  campaign,
  isOpen,
  onToggle,
}: {
  campaign: PolicyCampaign;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-liberation-cream/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-4 text-left group"
      >
        <ChevronRight
          className={`w-4 h-4 text-liberation-gold shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <span className="font-bold text-liberation-cream group-hover:text-liberation-gold transition-colors">
          {campaign.name}
        </span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {campaign.legislation.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-liberation-purple/10 text-liberation-purple border border-liberation-purple/30">
              {campaign.legislation.length} bill{campaign.legislation.length === 1 ? "" : "s"}
            </span>
          )}
          {campaign.factSheets.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-liberation-gold/10 text-liberation-gold border border-liberation-gold/30">
              {campaign.factSheets.length} fact sheet{campaign.factSheets.length === 1 ? "" : "s"}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="pb-6 pl-7 space-y-5">
          {campaign.description && (
            <p className="text-sm text-liberation-cream/60 max-w-3xl leading-relaxed">
              {campaign.description}
            </p>
          )}

          {campaign.legislation.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-liberation-purple mb-2">
                <Scale className="w-3 h-3" /> Tracked legislation
              </div>
              <div className="space-y-1.5">
                {campaign.legislation.map((bill) => (
                  <LegislationRow key={bill.id} bill={bill} />
                ))}
              </div>
            </div>
          )}

          {campaign.factSheets.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-liberation-gold mb-2">
                <FileText className="w-3 h-3" /> Fact sheets
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {campaign.factSheets.map((sheet) => (
                  <FactSheetRow key={sheet.id} sheet={sheet} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PolicyLibrary = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { data, isLoading, isError, refetch } = usePolicyLibrary();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const campaigns = useMemo(() => data?.campaigns ?? [], [data?.campaigns]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return campaigns;
    return campaigns.filter((c) => {
      const matchesCampaign =
        c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchesBill = c.legislation.some(
        (b) => b.billNumber.toLowerCase().includes(q) || b.title.toLowerCase().includes(q)
      );
      const matchesSheet = c.factSheets.some(
        (s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
      );
      return matchesCampaign || matchesBill || matchesSheet;
    });
  }, [campaigns, search]);

  const totalBills = useMemo(
    () => campaigns.reduce((sum, c) => sum + c.legislation.length, 0),
    [campaigns]
  );
  const totalSheets = useMemo(
    () => campaigns.reduce((sum, c) => sum + c.factSheets.length, 0),
    [campaigns]
  );

  return (
    <>
      <Helmet>
        <title>Policy Library | Liberation Caucus</title>
        <meta
          name="description"
          content="Research, fact sheets, and tracked legislation from the Liberation Caucus, organized by campaign."
        />
      </Helmet>

      <Header />

      <main className="pt-20 bg-liberation-dark min-h-screen">
        <section className="py-16 md:py-20" ref={heroRef}>
          <div className={`container mx-auto px-4 text-center animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-liberation-gold/10 mb-6">
              <BookOpen className="w-8 h-8 text-liberation-gold" />
            </div>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
              Research &amp; Policy
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-4">
              Policy <span className="text-liberation-gold">Library</span>
            </h1>
            <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
              Fact sheets and tracked legislation behind our campaigns, organized by campaign —
              click any row to open it.
            </p>
            {!isLoading && !isError && (
              <p className="text-xs text-liberation-cream/40 mt-3 font-mono">
                {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"} · {totalBills} bill{totalBills === 1 ? "" : "s"} tracked · {totalSheets} fact sheet{totalSheets === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-liberation-cream/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a campaign, bill, or fact sheet…"
                className="pl-9 bg-liberation-cream/5 border-liberation-cream/20 text-liberation-cream placeholder:text-liberation-cream/30"
              />
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-4 border-b border-liberation-cream/10">
                    <Skeleton className="h-5 w-1/3 bg-liberation-cream/10" />
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-liberation-red/30 bg-liberation-red/10 p-6 text-center">
                <p className="text-liberation-cream/80">
                  The policy library couldn't load. Try again in a moment.
                </p>
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
              <div className="rounded-xl border border-liberation-cream/10 p-10 text-center text-liberation-cream/40">
                No campaigns match your search.
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div>
                {filtered.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    isOpen={openId === campaign.id}
                    onToggle={() => setOpenId(openId === campaign.id ? null : campaign.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PolicyLibrary;
