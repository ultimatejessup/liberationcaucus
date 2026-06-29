import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  Construction,
} from "lucide-react";
import {
  useUtilityRateTracker,
  type RateAction,
  type StateComparison,
  type EnergyBurden,
  type CommissionMeeting,
} from "@/hooks/useUtilityRateTracker";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function StatBlock({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <div className="rounded-lg border border-liberation-cream/10 bg-liberation-cream/5 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-liberation-gold">{label}</div>
      <div className="mt-1 text-sm text-liberation-cream/80">{value}</div>
    </div>
  );
}

function RateActionCard({ action }: { action: RateAction }) {
  return (
    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-liberation-cream">{action.title}</h3>
          <p className="text-sm text-liberation-cream/50">
            {action.utility}
            {action.caseNumber && ` · Case ${action.caseNumber}`}
          </p>
        </div>
        {action.actionType && (
          <Badge variant="outline" className="text-liberation-gold border-liberation-gold/30 shrink-0">
            {action.actionType}
          </Badge>
        )}
      </div>

      {action.justification && (
        <p className="text-sm text-liberation-cream/70 mb-4">{action.justification}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <StatBlock label="Approved" value={action.amountApprovedM ? `$${action.amountApprovedM}M` : null} />
        <StatBlock label="Requested" value={action.amountRequestedM ? `$${action.amountRequestedM}M` : null} />
        <StatBlock
          label="% of Request"
          value={action.pctOfRequestApproved !== null ? `${action.pctOfRequestApproved}%` : null}
        />
        <StatBlock
          label="Monthly Impact"
          value={action.residentialMonthlyImpact !== null ? `+$${action.residentialMonthlyImpact}/mo` : null}
        />
        <StatBlock label="Effective" value={action.effectiveDate} />
        <StatBlock
          label="Customers Affected"
          value={action.customersAffected ? action.customersAffected.toLocaleString() : null}
        />
      </div>

      {action.agPosition && (
        <div className="mt-4 rounded-lg border border-liberation-red/20 bg-liberation-red/5 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-liberation-red mb-1">
            AG Position
          </div>
          <p className="text-sm text-liberation-cream/70">{action.agPosition}</p>
        </div>
      )}

      {action.sourceUrl && (
        <a
          href={action.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-liberation-gold hover:underline"
        >
          Source <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

function StateComparisonRow({ row }: { row: StateComparison }) {
  const isFocus = row.group === "Michigan (Focus)";
  return (
    <tr className={isFocus ? "bg-liberation-gold/10" : ""}>
      <td className="py-3 px-3 font-medium text-liberation-cream">
        {row.state} {isFocus && <span className="text-liberation-gold">★</span>}
      </td>
      <td className="py-3 px-3 text-liberation-cream/80">{row.avgRateCentsPerKwh}¢</td>
      <td className="py-3 px-3 text-liberation-cream/80">
        {row.pctAboveBelowNational !== null
          ? `${row.pctAboveBelowNational > 0 ? "+" : ""}${row.pctAboveBelowNational}%`
          : "—"}
      </td>
      <td className="py-3 px-3 text-liberation-cream/60">{row.marketStructure}</td>
    </tr>
  );
}

function EnergyBurdenCard({ item }: { item: EnergyBurden }) {
  return (
    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-liberation-cream">{item.geography}</h3>
        {item.racialGroup && (
          <Badge variant="outline" className="text-liberation-purple border-liberation-purple/30">
            {item.racialGroup}
          </Badge>
        )}
      </div>
      {item.medianBurdenPct !== null && (
        <div className="text-2xl font-bold text-liberation-gold mb-1">{item.medianBurdenPct}%</div>
      )}
      <p className="text-xs text-liberation-cream/40 mb-2">median energy burden</p>
      {item.notes && <p className="text-sm text-liberation-cream/70">{item.notes}</p>}
      {item.sourceUrl && (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-liberation-gold hover:underline"
        >
          {item.source || "Source"} <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function MeetingCard({ meeting }: { meeting: CommissionMeeting }) {
  return (
    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-liberation-cream">{meeting.title}</h3>
        {meeting.dataCompleteness && (
          <Badge
            variant="outline"
            className={
              meeting.dataCompleteness === "Full minutes retrieved"
                ? "text-liberation-green border-liberation-green/30"
                : "text-liberation-cream/50 border-liberation-cream/20"
            }
          >
            {meeting.dataCompleteness}
          </Badge>
        )}
      </div>
      {meeting.keyActions && <p className="text-sm text-liberation-cream/70 mb-3">{meeting.keyActions}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-liberation-cream/40">
        {meeting.chair && <span>Chair: {meeting.chair}</span>}
        {meeting.rateCasesOnAgenda && <span>Rate cases: {meeting.rateCasesOnAgenda}</span>}
      </div>
      {meeting.minutesUrl && (
        <a
          href={meeting.minutesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-liberation-gold hover:underline"
        >
          View minutes <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

const UtilityRateTracker = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { data, isLoading, isError, refetch } = useUtilityRateTracker();

  return (
    <>
      <Helmet>
        <title>Michigan Utility Rate Tracker | Liberation Caucus</title>
        <meta
          name="description"
          content="Tracking MPSC rate cases for DTE Electric and Consumers Energy, state utility rate comparisons, and the disproportionate energy burden on Black households in Michigan."
        />
      </Helmet>

      <Header />

      <main className="pt-20 bg-liberation-dark min-h-screen">
        <section className="py-16 md:py-20" ref={heroRef}>
          <div className={`container mx-auto px-4 text-center animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-liberation-gold/10 mb-6">
              <Zap className="w-8 h-8 text-liberation-gold" />
            </div>
            <span className="text-liberation-gold font-semibold text-sm tracking-widest uppercase">
              Energy Is a Justice Issue
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-liberation-cream mt-4 mb-4">
              Michigan Utility <span className="text-liberation-gold">Rate Tracker</span>
            </h1>
            <p className="text-lg text-liberation-cream/70 max-w-2xl mx-auto">
              Tracking MPSC rate cases, state rate comparisons, and how Michigan's utility rate
              crisis falls hardest on Black households.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-5xl">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full bg-liberation-cream/5" />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-liberation-red/30 bg-liberation-red/10 p-6 text-center">
                <p className="text-liberation-cream/80">The tracker couldn't load. Try again in a moment.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-liberation-gold hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && data && (
              <Tabs defaultValue="rate-actions" className="w-full">
                <TabsList className="bg-liberation-cream/5 border border-liberation-cream/10 flex-wrap h-auto gap-1 mb-8">
                  <TabsTrigger
                    value="rate-actions"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-liberation-cream/70"
                  >
                    <TrendingUp className="w-4 h-4 mr-1.5" /> Rate Actions
                  </TabsTrigger>
                  <TabsTrigger
                    value="state-comparison"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-liberation-cream/70"
                  >
                    State Comparison
                  </TabsTrigger>
                  <TabsTrigger
                    value="energy-burden"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-liberation-cream/70"
                  >
                    <Users className="w-4 h-4 mr-1.5" /> Energy Burden
                  </TabsTrigger>
                  <TabsTrigger
                    value="rate-history"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-liberation-cream/70"
                  >
                    Rate History
                  </TabsTrigger>
                  <TabsTrigger
                    value="commission-meetings"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-liberation-cream/70"
                  >
                    <Calendar className="w-4 h-4 mr-1.5" /> Commission Meetings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rate-actions" className="space-y-4">
                  {data.rateActions.map((action) => (
                    <RateActionCard key={action.id} action={action} />
                  ))}
                </TabsContent>

                <TabsContent value="state-comparison">
                  <div className="rounded-xl border border-liberation-gold/20 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-liberation-cream/10">
                        <tr>
                          <th className="text-left py-3 px-3 text-liberation-cream/60 font-semibold">State</th>
                          <th className="text-left py-3 px-3 text-liberation-cream/60 font-semibold">
                            Rate (¢/kWh)
                          </th>
                          <th className="text-left py-3 px-3 text-liberation-cream/60 font-semibold">
                            vs. National
                          </th>
                          <th className="text-left py-3 px-3 text-liberation-cream/60 font-semibold">
                            Market
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-liberation-cream/10">
                        {[...data.stateComparison]
                          .sort((a, b) => (b.avgRateCentsPerKwh ?? 0) - (a.avgRateCentsPerKwh ?? 0))
                          .map((row) => (
                            <StateComparisonRow key={row.id} row={row} />
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-liberation-cream/40">
                    ★ indicates Michigan, the focus state for this tracker.
                  </p>
                </TabsContent>

                <TabsContent value="energy-burden" className="grid sm:grid-cols-2 gap-4">
                  {data.energyBurden.map((item) => (
                    <EnergyBurdenCard key={item.id} item={item} />
                  ))}
                </TabsContent>

                <TabsContent value="rate-history">
                  {data.rateHistory.length === 0 ? (
                    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-10 text-center">
                      <Construction className="w-8 h-8 text-liberation-gold/60 mx-auto mb-3" />
                      <p className="text-liberation-cream/70 font-medium">Data collection in progress</p>
                      <p className="text-liberation-cream/40 text-sm mt-1 max-w-md mx-auto">
                        Historical year-over-year rate data for DTE and Consumers Energy is being
                        compiled. Check back soon, or see the Rate Actions tab for the latest
                        approved cases.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.rateHistory.map((row) => (
                        <div key={row.id} className="rounded-lg border border-liberation-gold/20 bg-liberation-cream/5 p-4">
                          {row.utilityAndYear}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="commission-meetings" className="grid sm:grid-cols-2 gap-4">
                  {[...data.commissionMeetings]
                    .sort((a, b) => (b.date > a.date ? 1 : -1))
                    .map((meeting) => (
                      <MeetingCard key={meeting.id} meeting={meeting} />
                    ))}
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-10 rounded-lg border border-liberation-cream/10 bg-liberation-cream/5 p-4 text-xs leading-relaxed text-liberation-cream/40">
              <strong className="text-liberation-cream/60">Note:</strong> This tracker reflects
              publicly available MPSC filings and is refreshed periodically, not in real time.
              Figures such as residential bill impact may carry rounding or reporting
              discrepancies between sources — where this is known, it is noted directly on the
              relevant record rather than silently resolved.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UtilityRateTracker;
