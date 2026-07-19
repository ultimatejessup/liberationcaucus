import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dark-theme line chart for Rate History over time. This tab stays on the
// site's dark theme (liberation-cream/liberation-dark) — only the county
// cartogram moved to a light card, matching how PurplBook keeps the site's
// dark header/footer and is only itself light within its own section.
//
// utility_rate_history_mi has 0 rows as of 2026-07-19 (verified directly),
// so this component is built ahead of the data existing — see
// liberation-caucus-data-collection-SKILL.md for how to populate it. Handles
// the "not enough data yet" case explicitly rather than rendering an empty
// or misleading chart.

export interface RateHistoryRow {
  id: string;
  utilityAndYear: string;
  utility: string;
  year: number | null;
  serviceType: string;
  rateUnit: string;
  rateCentsPerKwh: number | null;
  yoyChangePct: number | null;
  caseNumber: string;
  source: string;
  notes: string;
}

const LINE_COLORS = [
  "hsl(45 90% 55%)", // liberation-gold
  "hsl(152 45% 55%)",
  "hsl(14 65% 60%)",
  "hsl(210 55% 60%)",
  "hsl(280 45% 62%)",
];

export default function RateHistoryChart({ rows }: { rows: RateHistoryRow[] }) {
  // Reshape into one row per year, one column per utility — the standard
  // shape recharts' LineChart expects for multiple series sharing an x-axis.
  const { chartData, utilities } = useMemo(() => {
    const byYear = new Map<number, Record<string, number | null>>();
    const utilitySet = new Set<string>();

    for (const r of rows) {
      if (r.year === null || r.rateCentsPerKwh === null || !r.utility) continue;
      utilitySet.add(r.utility);
      if (!byYear.has(r.year)) byYear.set(r.year, {});
      byYear.get(r.year)![r.utility] = r.rateCentsPerKwh;
    }

    const sortedYears = Array.from(byYear.keys()).sort((a, b) => a - b);
    const data = sortedYears.map((year) => ({ year, ...byYear.get(year) }));
    return { chartData: data, utilities: Array.from(utilitySet) };
  }, [rows]);

  // A single data point per utility can't show a trend — same "not enough
  // to chart" honesty standard used elsewhere in this project (see the
  // cartogram's MiniPie component).
  const hasEnoughData = chartData.length >= 2 && utilities.length > 0;

  if (!hasEnoughData) {
    return (
      <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-6 text-center">
        <p className="text-liberation-cream/60 text-sm">
          {rows.length === 0
            ? "No rate history data yet."
            : "Not enough years of data yet to chart a trend — need at least two years for a given utility."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 p-4">
      <div className="text-sm font-medium text-liberation-cream/80 mb-1">
        Residential Rate Over Time (¢/kWh)
      </div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,236,216,0.1)" />
            <XAxis
              dataKey="year"
              stroke="rgba(244,236,216,0.4)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(244,236,216,0.4)"
              fontSize={12}
              tickLine={false}
              label={{
                value: "¢/kWh",
                angle: -90,
                position: "insideLeft",
                fill: "rgba(244,236,216,0.4)",
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1512",
                border: "1px solid rgba(244,236,216,0.15)",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#f4ecd8" }}
              itemStyle={{ color: "#f4ecd8" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "rgba(244,236,216,0.7)" }} />
            {utilities.map((utility, i) => (
              <Line
                key={utility}
                type="monotone"
                dataKey={utility}
                name={utility}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
