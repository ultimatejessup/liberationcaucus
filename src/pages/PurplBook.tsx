import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Landmark, Globe2, Map, Building2, Search, ExternalLink, RefreshCw } from "lucide-react";
import { usePurplbookDirectory, type PurplbookOrg } from "@/hooks/usePurplbookDirectory";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const LEVELS = ["All", "Federal", "National Umbrella", "State", "Local"] as const;
type Level = (typeof LEVELS)[number];

const LEVEL_STYLES: Record<string, { text: string; bg: string; border: string; icon: typeof Landmark }> = {
  Federal: { text: "text-liberation-gold", bg: "bg-liberation-gold/10", border: "border-liberation-gold/30", icon: Landmark },
  "National Umbrella": { text: "text-liberation-orange", bg: "bg-liberation-orange/10", border: "border-liberation-orange/30", icon: Globe2 },
  State: { text: "text-liberation-green", bg: "bg-liberation-green/10", border: "border-liberation-green/30", icon: Map },
  Local: { text: "text-liberation-purple", bg: "bg-liberation-purple/10", border: "border-liberation-purple/30", icon: Building2 },
};

function OrgCard({ org }: { org: PurplbookOrg }) {
  const style = LEVEL_STYLES[org.level] ?? LEVEL_STYLES.Federal;
  const Icon = style.icon;

  return (
    <AccordionItem
      value={org.id}
      className={`rounded-xl border ${style.border} bg-liberation-cream/5 px-5 mb-3 overflow-hidden`}
    >
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-start gap-3 text-left">
          <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${style.bg}`}>
            <Icon className={`h-4 w-4 ${style.text}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-liberation-cream">{org.name}</span>
              <Badge variant="outline" className={`${style.text} ${style.border} text-[10px] uppercase tracking-wide`}>
                {org.level}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-liberation-cream/50">{org.stateScope}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-5">
        <p className="text-sm leading-relaxed text-liberation-cream/70">{org.description}</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { label: "Current Chair / Leader", value: org.chair },
            { label: "Membership", value: org.membershipSize },
            { label: "Phone", value: org.phone },
            { label: "Contact", value: org.contact },
          ]
            .filter((item) => item.value && item.value !== "N/A")
            .map((item) => (
              <div key={item.label} className="rounded-lg border border-liberation-cream/10 bg-liberation-cream/5 p-3">
                <div className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>{item.label}</div>
                <div className="mt-1 text-sm text-liberation-cream/80">{item.value}</div>
              </div>
            ))}
        </div>

        {org.members.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-liberation-cream/40">
              Listed Members ({org.members.length})
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-liberation-cream/10 divide-y divide-liberation-cream/10">
              {org.members.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-liberation-cream">{m.name}</span>
                    <span className="text-liberation-cream/50"> — {m.title}</span>
                  </div>
                  <div className="flex-shrink-0 text-right text-liberation-cream/40">
                    <div>{m.district}</div>
                    {m.since && <div>since {m.since}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {org.website && (
          <a
            href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${style.text} hover:underline`}
          >
            Visit official website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

const PurplBook = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { data, isLoading, isError, refetch } = usePurplbookDirectory();
  const [filter, setFilter] = useState<Level>("All");
  const [search, setSearch] = useState("");

  const organizations = useMemo(() => data?.organizations ?? [], [data?.organizations]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: organizations.length };
    for (const level of LEVELS.slice(1)) {
      c[level] = organizations.filter((o) => o.level === level).length;
    }
    return c;
  }, [organizations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return organizations.filter((o) => {
      const matchesLevel = filter === "All" || o.level === filter;
      const matchesSearch =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.stateScope.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q);
      return matchesLevel && matchesSearch;
    });
  }, [organizations, filter, search]);

  return (
    <>
      <Helmet>
        <title>Purple Book | Black Caucus Legislative Directory | Liberation Caucus</title>
        <meta
          name="description"
          content="A directory of Black legislative caucus organizations and members across federal, state, and local government in the United States, maintained by the Liberation Caucus."
        />
      </Helmet>

      <Header />

      <main className="pt-20 bg-liberation-dark min-h-screen">
        <section className="py-16 md:py-20" ref={heroRef}>
          <div className={`container mx-auto px-4 text-center animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <span className="text-liberation-purple font-semibold text-sm tracking-widest uppercase">
              United States · Federal · State · Local
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-4">
              The <span className="text-liberation-purple">Purple Book</span>
            </h1>
            <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
              A directory of Black legislative caucus organizations and their members across the
              United States — federal, state, and local government.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-8">
              {[
                { label: "Organizations", value: organizations.length || "—" },
                { label: "Members Tracked", value: data ? `${data.totalMembers}+` : "—" },
                { label: "Levels of Government", value: 4 },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-liberation-purple">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wide text-liberation-cream/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-liberation-cream/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, state, or keyword…"
                className="pl-9 bg-liberation-cream/5 border-liberation-cream/20 text-liberation-cream placeholder:text-liberation-cream/30"
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {LEVELS.map((level) => {
                const active = filter === level;
                const style = level === "All" ? null : LEVEL_STYLES[level];
                return (
                  <button
                    key={level}
                    onClick={() => setFilter(level)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      active
                        ? style
                          ? `${style.bg} ${style.text} ${style.border}`
                          : "bg-liberation-gold text-liberation-dark border-liberation-gold"
                        : "border-liberation-cream/20 text-liberation-cream/50 hover:text-liberation-cream/80"
                    }`}
                  >
                    {level} ({counts[level] ?? 0})
                  </button>
                );
              })}
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-liberation-cream/5" />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-liberation-red/30 bg-liberation-red/10 p-6 text-center">
                <p className="text-liberation-cream/80">
                  The directory couldn't load. This is reference data refreshed periodically — try again in a moment.
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
                No organizations match your search.
              </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <Accordion type="single" collapsible>
                {filtered.map((org) => (
                  <OrgCard key={org.id} org={org} />
                ))}
              </Accordion>
            )}

            <div className="mt-8 rounded-lg border border-liberation-cream/10 bg-liberation-cream/5 p-4 text-xs leading-relaxed text-liberation-cream/40">
              <strong className="text-liberation-cream/60">Note:</strong> This directory reflects
              publicly available information and is refreshed periodically, not in real time.
              Leadership and membership change with each election and legislative session. Member
              rosters are partial — visit official organization websites for complete, current
              lists.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PurplBook;
