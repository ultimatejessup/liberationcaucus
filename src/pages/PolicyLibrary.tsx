import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Search, Download, ExternalLink, RefreshCw, BookOpen } from "lucide-react";
import { usePolicyLibrary, type PolicyFactSheet } from "@/hooks/usePolicyLibrary";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function FactSheetCard({ sheet, index }: { sheet: PolicyFactSheet; index: number }) {
  const { ref, isVisible } = useScrollAnimation();
  const primaryFile = sheet.files[0];

  return (
    <div ref={ref} className={`animate-on-scroll ${isVisible ? "visible" : ""} stagger-${(index % 4) + 1}`}>
      <div className="bg-liberation-cream/5 border border-liberation-gold/20 rounded-xl p-6 hover:border-liberation-gold/40 transition-all h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-liberation-gold/10 rounded-lg p-3 shrink-0">
            <FileText className="w-6 h-6 text-liberation-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-liberation-cream mb-1">{sheet.title}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {sheet.campaigns.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded-full bg-liberation-gold/10 text-liberation-gold border border-liberation-gold/30"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {sheet.summary && <p className="text-liberation-cream/70 text-sm mb-4 flex-grow">{sheet.summary}</p>}

        {sheet.date && <p className="text-liberation-cream/40 text-xs mb-4">Updated {sheet.date}</p>}

        {sheet.files.length > 1 && (
          <div className="mb-3 text-xs text-liberation-cream/40">{sheet.files.length} files attached</div>
        )}

        <div className="flex flex-wrap gap-3 mt-auto">
          {primaryFile && (
            <Button
              size="sm"
              className="bg-liberation-gold hover:bg-liberation-gold/90 text-liberation-dark font-semibold"
              asChild
            >
              <a href={primaryFile.url} target="_blank" rel="noopener noreferrer">
                Download {formatFileSize(primaryFile.size) && `(${formatFileSize(primaryFile.size)})`}
                <Download className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          )}
          {sheet.relatedLink && (
            <Button
              variant="outline"
              size="sm"
              className="border-liberation-gold/40 text-liberation-gold hover:bg-liberation-gold hover:text-liberation-dark"
              asChild
            >
              <a href={sheet.relatedLink} target="_blank" rel="noopener noreferrer">
                Related coverage <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const PolicyLibrary = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { data, isLoading, isError, refetch } = usePolicyLibrary();
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState<string>("All");

  const factSheets = useMemo(() => data?.factSheets ?? [], [data?.factSheets]);
  const campaigns = useMemo(() => data?.campaigns ?? [], [data?.campaigns]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return factSheets.filter((sheet) => {
      const matchesCampaign =
        campaignFilter === "All" || sheet.campaigns.some((c) => c.id === campaignFilter);
      const matchesSearch =
        !q ||
        sheet.title.toLowerCase().includes(q) ||
        sheet.summary.toLowerCase().includes(q);
      return matchesCampaign && matchesSearch;
    });
  }, [factSheets, search, campaignFilter]);

  return (
    <>
      <Helmet>
        <title>Policy Library | Liberation Caucus</title>
        <meta
          name="description"
          content="Research, fact sheets, and policy documents from the Liberation Caucus, organized by campaign."
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
              Fact sheets, legislative analysis, and reference materials behind our campaigns.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-liberation-cream/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fact sheets…"
                className="pl-9 bg-liberation-cream/5 border-liberation-cream/20 text-liberation-cream placeholder:text-liberation-cream/30"
              />
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
              <button
                onClick={() => setCampaignFilter("All")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  campaignFilter === "All"
                    ? "bg-liberation-gold text-liberation-dark border-liberation-gold"
                    : "border-liberation-cream/20 text-liberation-cream/50 hover:text-liberation-cream/80"
                }`}
              >
                All ({factSheets.length})
              </button>
              {campaigns.map((c) => {
                const count = factSheets.filter((s) => s.campaigns.some((sc) => sc.id === c.id)).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCampaignFilter(c.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      campaignFilter === c.id
                        ? "bg-liberation-gold text-liberation-dark border-liberation-gold"
                        : "border-liberation-cream/20 text-liberation-cream/50 hover:text-liberation-cream/80"
                    }`}
                  >
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>

            {isLoading && (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-liberation-cream/5 border border-liberation-gold/10 rounded-xl p-6">
                    <Skeleton className="h-6 w-3/4 mb-3 bg-liberation-cream/10" />
                    <Skeleton className="h-4 w-1/2 mb-2 bg-liberation-cream/10" />
                    <Skeleton className="h-4 w-full mb-2 bg-liberation-cream/10" />
                    <Skeleton className="h-4 w-2/3 bg-liberation-cream/10" />
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
                No fact sheets match your search.
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {filtered.map((sheet, i) => (
                  <FactSheetCard key={sheet.id} sheet={sheet} index={i} />
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
