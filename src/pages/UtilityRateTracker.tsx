import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  Construction,
  Map,
} from "lucide-react";
import {
  useUtilityRateTracker,
  type RateAction,
  type StateComparison,
  type EnergyBurden,
  type CommissionMeeting,
} from "@/hooks/useUtilityRateTracker";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import UtilityCountyCartogram from "@/components/UtilityCountyCartogram";
import RateHistoryChart from "@/components/RateHistoryChart";
import RateActionsTimeline from "@/components/RateActionsTimeline";

// Matches the forest green used on the county cartogram's "broadband"
// category tile and bars — see UtilityCountyCartogram.tsx. Kept as a literal
// hex here rather than a Tailwind class since that green isn't yet a
// formalized token; swap for a class (e.g. text-liberation-forest) if one
// gets added to the Tailwind config later.
const ESSENTIALS_GREEN = "#2F6B45";

function StatBlock({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-liberation-gold">{label}</div>
      <div className="mt-1 text-sm text-gray-700">{value}</div>
    </div>
  );
}

function RateActionCard({ action }: { action: RateAction }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-green-900">{action.title}</h3>
          <p className="text-sm text-green-500">
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
        <p className="text-sm text-gray-600 mb-4">{action.justification}</p>
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
          <p className="text-sm text-gray-600">{action.agPosition}</p>
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
      <td className="py-3 px-3 font-medium text-gray-900">
        {row.state} {isFocus && <span className="text-liberation-gold">★</span>}
      </td>
      <td className="py-3 px-3 text-gray-700">{row.avgRateCentsPerKwh}¢</td>
      <td className="py-3 px-3 text-gray-700">
        {row.pctAboveBelowNational !== null
          ? `${row.pctAboveBelowNational > 0 ? "+" : ""}${row.pctAboveBelowNational}%`
          : "—"}
      </td>
      <td className="py-3 px-3 text-gray-500">{row.marketStructure}</td>
    </tr>
  );
}

function EnergyBurdenCard({ item }: { item: EnergyBurden }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{item.geography}</h3>
        {item.racialGroup && (
          <Badge variant="outline" className="text-liberation-purple border-liberation-purple/30">
            {item.racialGroup}
          </Badge>
        )}
      </div>
      {item.medianBurdenPct !== null && (
        <div className="text-2xl font-bold text-liberation-gold mb-1">{item.medianBurdenPct}%</div>
      )}
      <p className="text-xs text-gray-400 mb-2">median energy burden</p>
      {item.notes && <p className="text-sm text-gray-600">{item.notes}</p>}
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
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
        {meeting.dataCompleteness && (
          <Badge
            variant="outline"
            className={
              meeting.dataCompleteness === "Full minutes retrieved"
                ? "text-liberation-green border-liberation-green/30"
                : "text-gray-400 border-gray-300"
            }
          >
            {meeting.dataCompleteness}
          </Badge>
        )}
      </div>
      {meeting.keyActions && <p className="text-sm text-gray-600 mb-3">{meeting.keyActions}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
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
        <title>Michigan Essentials Watch | Liberation Caucus</title>
        <meta
          name="description"
          content="Michigan Essentials Watch: tracking water, energy, and broadband affordability across Michigan's 83 counties, MPSC rate cases for DTE Electric and Consumers Energy, and the disproportionate burden on Black households."
        />
      </Helmet>

      <Header />

      {/* bg-white + hero/container conventions matched to purplbook's main
          section (PurplBook.tsx) so the two Liberation Caucus tools read as
          one consistent product family rather than two different apps. */}
      <main className="pt-20 bg-white min-h-screen">
        <section className="py-10 md:py-14 border-b border-gray-100" ref={heroRef}>
          <div className={`container mx-auto px-6 max-w-5xl animate-on-scroll ${heroVisible ? "visible" : ""}`}>
            <span className="text-liberation-gold font-semibold text-xs tracking-widest uppercase">
              Liberation Caucus
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-3">
              <span className="text-gray-900">Michigan </span>
              <span style={{ color: ESSENTIALS_GREEN }}>Essentials</span>
              <span className="text-gray-900"> Watch</span>
            </h1>
            <p className="text-base text-gray-500 max-w-xl">
              Tracking water, energy, and broadband affordability across Michigan's 83
              counties — MPSC rate cases, state rate comparisons, and how the state's
              utility rate crisis falls hardest on Black households.
            </p>
            <div className="mt-5 flex flex-wrap gap-8">
              {[
                { label: "Counties Tracked", value: "83" },
                { label: "Places Sampled", value: "745" },
                { label: "Rate Actions Logged", value: data ? data.rateActions.length : "—" },
                { label: "Commission Meetings", value: data ? data.commissionMeetings.length : "—" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold" style={{ color: ESSENTIALS_GREEN }}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            {isLoading && (
              <div className="space-y-4 pt-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full bg-gray-100" />
                ))}
              </div>
            )}

            {isError && (
              <div className="pt-8">
                <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                  <p className="text-gray-700 text-sm">The tracker couldn't load. Try again in a moment.</p>
                  <button
                    onClick={() => refetch()}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-liberation-gold hover:underline"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !isError && data && (
              <Tabs defaultValue="county-map" className="w-full pt-8">
                <TabsList className="bg-gray-50 border border-gray-200 flex-wrap h-auto gap-1 mb-8">
                  <TabsTrigger
                    value="county-map"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-gray-500"
                  >
                    <Map className="w-4 h-4 mr-1.5" /> County Map
                  </TabsTrigger>
                  <TabsTrigger
                    value="rate-actions"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-gray-500"
                  >
                    <TrendingUp className="w-4 h-4 mr-1.5" /> Rate Actions
                  </TabsTrigger>
                  <TabsTrigger
                    value="state-comparison"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-gray-500"
                  >
                    State Comparison
                  </TabsTrigger>
                  <TabsTrigger
                    value="energy-burden"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-gray-500"
                  >
                    <Users className="w-4 h-4 mr-1.5" /> Energy Burden
                  </TabsTrigger>
                  <TabsTrigger
                    value="rate-history"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-gray-500"
                  >
                    Rate History
                  </TabsTrigger>
                  <TabsTrigger
                    value="commission-meetings"
                    className="data-[state=active]:bg-liberation-gold data-[state=active]:text-liberation-dark text-gray-500"
                  >
                    <Calendar className="w-4 h-4 mr-1.5" /> Commission Meetings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rate-actions" className="space-y-4">
                  <RateActionsTimeline actions={data.rateActions} />
                  {data.rateActions.map((action) => (
                    <RateActionCard key={action.id} action={action} />
                  ))}
                </TabsContent>

                <TabsContent value="state-comparison">
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-3 text-gray-500 font-semibold">State</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-semibold">Rate (¢/kWh)</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-semibold">vs. National</th>
                          <th className="text-left py-3 px-3 text-gray-500 font-semibold">Market</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[...data.stateComparison]
                          .sort((a, b) => (b.avgRateCentsPerKwh ?? 0) - (a.avgRateCentsPerKwh ?? 0))
                          .map((row) => (
                            <StateComparisonRow key={row.id} row={row} />
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">
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
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
                      <Construction className="w-8 h-8 text-liberation-gold/60 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium">Data collection in progress</p>
                      <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                        Historical year-over-year rate data for DTE and Consumers Energy is being
                        compiled. Check back soon, or see the Rate Actions tab for the latest
                        approved cases.
                      </p>
                    </div>
                  ) : (
                    <RateHistoryChart rows={data.rateHistory} />
                  )}
                </TabsContent>

                <TabsContent value="commission-meetings" className="grid sm:grid-cols-2 gap-4">
                  {[...data.commissionMeetings]
                    .sort((a, b) => (b.date > a.date ? 1 : -1))
                    .map((meeting) => (
                      <MeetingCard key={meeting.id} meeting={meeting} />
                    ))}
                </TabsContent>
                <TabsContent value="county-map">
                  <UtilityCountyCartogram />
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-400">
              <strong className="text-gray-600">Note:</strong> This tracker reflects publicly
              available MPSC filings and is refreshed periodically, not in real time. Figures
              such as residential bill impact may carry rounding or reporting discrepancies
              between sources — where this is known, it is noted directly on the relevant
              record rather than silently resolved.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UtilityRateTracker;
