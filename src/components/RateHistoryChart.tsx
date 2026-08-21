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

// Light-theme line chart for Rate History over time.
//
// FIXED 2026-08-18: x/y axis tick labels were invisible. Root cause: the
// prior version set `stroke="#9ca3af"` on <XAxis>/<YAxis>, but in recharts
// `stroke` colors the axis LINE, not the tick label text -- tick text color
// is controlled by the separate `tick` prop. With no `tick` prop set, label
// color fell back to recharts' default text handling, which in this
// component's actual rendering context ended up invisible (not just faint).
// Fixed by explicitly setting `tick={{ fill: ... }}` on both axes.
//
// REBUILT 2026-08-18 for monthly data: utility_rate_history_mi now stores
// one row per utility per MONTH (readingDate, e.g. "2024-03-01"), not one
// row per utility per YEAR -- per explicit instruction that no aggregation
// should happen without confirmation. This component previously grouped by
// `year`; it now groups by `readingDate` and formats the x-axis as
// month/year. With up to ~99 months per utility, not every tick can be
// labeled without crowding -- a capped tick count keeps the axis readable
// while every data point still plots on the line itself.

export interface RateHistoryRow {
  id: string;
  utility: string;
  readingDate: string; // "YYYY-MM-01"
  year: number | null;
  utilityAndDate: string;
  serviceType: string;
  rateUnit: string;
  rateCentsPerKwh: number | null;
  rateChangeM: number | null;
  momChangePct: number | null; // month-over-month, not year-over-year
  caseNumber: string;
  source: string;
  notes: string;
}

const LINE_COLORS = [
  "hsl(45 85% 45%)", // liberation-gold, darkened for contrast on white
  "hsl(152 45% 40%)",
  "hsl(14 65% 48%)",
  "hsl(210 55% 48%)",
  "hsl(280 45% 50%)",
  "hsl(320 50% 50%)",
  "hsl(190 55% 42%)",
  "hsl(30 70% 45%)",
];

const AXIS_TICK_STYLE = { fill: "#4b5563", fontSize: 12 };
const AXIS_LINE_COLOR = "#9ca3af";

function formatMonthYear(dateStr: string): string {
  // "2024-03-01" -> "Mar 2024" -- avoids a Date() timezone-shift bug where
  // parsing "2024-03-01" as local time can roll back to the last day of
  // February depending on the browser's timezone offset.
  const [y, m] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] ?? m} ${y}`;
}

export default function RateHistoryChart({ rows }: { rows: RateHistoryRow[] }) {
  // Reshape into one row per month, one column per utility — the standard
  // shape recharts' LineChart expects for multiple series sharing an x-axis.
  const { chartData, utilities } = useMemo(() => {
    const byDate = new Map<string, Record<string, number | null>>();
    const utilitySet = new Set<string>();

    for (const r of rows) {
      if (!r.readingDate || r.rateCentsPerKwh === null || !r.utility) continue;
      utilitySet.add(r.utility);
      if (!byDate.has(r.readingDate)) byDate.set(r.readingDate, {});
      byDate.get(r.readingDate)![r.utility] = r.rateCentsPerKwh;
    }

    const sortedDates = Array.from(byDate.keys()).sort();
    const data = sortedDates.map((date) => ({
      readingDate: date,
      label: formatMonthYear(date),
      ...byDate.get(date),
    }));
    return { chartData: data, utilities: Array.from(utilitySet) };
  }, [rows]);

  // A single data point per utility can't show a trend — same "not enough
  // to chart" honesty standard used elsewhere in this project.
  const hasEnoughData = chartData.length >= 2 && utilities.length > 0;

  if (!hasEnoughData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-500 text-sm">
          {rows.length === 0
            ? "No rate history data yet."
            : "Not enough months of data yet to chart a trend — need at least two readings for a given utility."}
        </p>
      </div>
    );
  }

  // Cap the number of x-axis ticks shown so labels don't overlap when
  // there are ~90+ months of data — every data point still plots on the
  // line regardless of which ticks get a visible label.
  const maxTicks = 12;
  const tickInterval = Math.max(0, Math.ceil(chartData.length / maxTicks) - 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-gray-800 mb-1">
        Residential Rate Over Time (¢/kWh)
      </div>
      <div className="text-xs text-gray-400 mb-2">
        Monthly readings, {chartData[0]?.label}–{chartData[chartData.length - 1]?.label}
      </div>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke={AXIS_LINE_COLOR}
              tick={AXIS_TICK_STYLE}
              tickLine={false}
              interval={tickInterval}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke={AXIS_LINE_COLOR}
              tick={AXIS_TICK_STYLE}
              tickLine={false}
              label={{
                value: "¢/kWh",
                angle: -90,
                position: "insideLeft",
                fill: "#4b5563",
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#1f2937" }}
              itemStyle={{ color: "#1f2937" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#4b5563" }} />
            {utilities.map((utility, i) => (
              <Line
                key={utility}
                type="monotone"
                dataKey={utility}
                name={utility}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
