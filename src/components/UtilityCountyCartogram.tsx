import { useMemo, useState, type ReactNode } from "react";
import { Wifi, Droplets, Zap, Search, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMichiganEssentialServices,
  aggregateByCounty,
  groupPlacesByCounty,
  type CountyEntry,
  type PlaceEntry,
  type WaterSewageRateEntry,
  type BroadbandRateEntry,
} from "@/hooks/useMichiganEssentialServices";
import {
  useEnergyBurdenByCounty,
  useRateActionsByCounty,
  useRateHistoryByCounty,
  type EnergyBurdenEntry,
  type RateActionEntry,
  type RateHistoryEntry,
} from "@/hooks/useEnergyBurdenByCounty";

// ── Grid layout ──────────────────────────────────────────────────────────────
// Same technique as PurplBook.tsx's AtlasView: hand-derived cartogram grid,
// plain inline SVG. REBUILT 2026-07-18: the original version scaled real
// county centroids directly onto a grid, which produced visibly uneven
// spacing (large gaps between some counties, cramped clusters elsewhere) —
// real-world coordinate spacing doesn't translate cleanly to a uniform grid.
// This version instead RANKS counties into latitude bands (rows), then packs
// each row's counties into CONSECUTIVE integer columns (sorted by longitude,
// no internal gaps) with a per-row column offset derived from that row's
// mean longitude — preserving Michigan's general silhouette (narrow UP
// tapering to a point, Lower Peninsula widening below) while guaranteeing
// uniform, gapless spacing within and between rows. 16 rows x 11 cols,
// zero position collisions, all 83 counties present.

const GRID: Record<string, [number, number]> = {
  Alcona: [7, 9], Alger: [2, 5], Allegan: [13, 4], Alpena: [6, 9],
  Antrim: [6, 6], Arenac: [9, 8], Baraga: [1, 3], Barry: [13, 5],
  Bay: [10, 9], Benzie: [7, 4], Berrien: [15, 3], Branch: [15, 6],
  Calhoun: [14, 6], Cass: [15, 4], Charlevoix: [5, 5], Cheboygan: [5, 7],
  Chippewa: [3, 7], Clare: [9, 6], Clinton: [12, 7], Crawford: [7, 7],
  Delta: [4, 5], Dickinson: [4, 4], Eaton: [13, 6], Emmet: [5, 6],
  Genesee: [12, 9], Gladwin: [9, 7], Gogebic: [2, 3], "Grand Traverse": [7, 5],
  Gratiot: [11, 6], Hillsdale: [15, 7], Houghton: [1, 2], Huron: [9, 9],
  Ingham: [13, 7], Ionia: [12, 6], Iosco: [8, 9], Iron: [3, 4],
  Isabella: [10, 7], Jackson: [14, 7], Kalamazoo: [14, 5], Kalkaska: [7, 6],
  Kent: [12, 5], Keweenaw: [0, 2], Lake: [9, 4], Lapeer: [11, 9],
  Leelanau: [6, 5], Lenawee: [15, 8], Livingston: [13, 8], Luce: [2, 6],
  Mackinac: [3, 6], Macomb: [13, 10], Manistee: [8, 4], Marquette: [2, 4],
  Mason: [9, 3], Mecosta: [10, 6], Menominee: [5, 4], Midland: [10, 8],
  Missaukee: [8, 6], Monroe: [15, 9], Montcalm: [11, 5], Montmorency: [6, 8],
  Muskegon: [11, 4], Newaygo: [10, 5], Oakland: [13, 9], Oceana: [10, 4],
  Ogemaw: [8, 8], Ontonagon: [1, 1], Osceola: [9, 5], Oscoda: [7, 8],
  Otsego: [6, 7], Ottawa: [12, 4], "Presque Isle": [5, 8], Roscommon: [8, 7],
  Saginaw: [11, 7], Sanilac: [11, 10], Schoolcraft: [3, 5], Shiawassee: [12, 8],
  "St. Clair": [12, 10], "St. Joseph": [15, 5], Tuscola: [11, 8], "Van Buren": [14, 4],
  Washtenaw: [14, 8], Wayne: [14, 9], Wexford: [8, 5],
};

const ALL_COUNTIES = Object.keys(GRID).sort();
const CELL = 42, GAP = 5;
const GRID_ROWS = Math.max(...Object.values(GRID).map(([r]) => r)) + 1;
const GRID_COLS = Math.max(...Object.values(GRID).map(([, c]) => c)) + 1;

// County abbreviations for on-tile labels, same technique as PurplBook's
// ABBR map — every county is legible at a glance without needing hover,
// rather than relying on color alone.
const ABBR: Record<string, string> = {
  Alcona: "ALC", Alger: "ALG", Allegan: "ALL", Alpena: "ALP", Antrim: "ANT",
  Arenac: "ARE", Baraga: "BRG", Barry: "BAR", Bay: "BAY", Benzie: "BEN",
  Berrien: "BER", Branch: "BRA", Calhoun: "CAL", Cass: "CAS", Charlevoix: "CHA",
  Cheboygan: "CHE", Chippewa: "CHI", Clare: "CLA", Clinton: "CLI", Crawford: "CRA",
  Delta: "DEL", Dickinson: "DIC", Eaton: "EAT", Emmet: "EMM", Genesee: "GEN",
  Gladwin: "GLA", Gogebic: "GOG", "Grand Traverse": "GT", Gratiot: "GRA",
  Hillsdale: "HIL", Houghton: "HOU", Huron: "HUR", Ingham: "ING", Ionia: "ION",
  Iosco: "IOS", Iron: "IRO", Isabella: "ISA", Jackson: "JAC", Kalamazoo: "KZO",
  Kalkaska: "KLK", Kent: "KEN", Keweenaw: "KEW", Lake: "LAK", Lapeer: "LAP",
  Leelanau: "LEE", Lenawee: "LEN", Livingston: "LIV", Luce: "LUC", Mackinac: "MAK",
  Macomb: "MAC", Manistee: "MAN", Marquette: "MAR", Mason: "MAS", Mecosta: "MEC",
  Menominee: "MEN", Midland: "MID", Missaukee: "MIS", Monroe: "MOE", Montcalm: "MTC",
  Montmorency: "MTM", Muskegon: "MUS", Newaygo: "NEW", Oakland: "OAK", Oceana: "OCE",
  Ogemaw: "OGE", Ontonagon: "ONT", Osceola: "OSC", Oscoda: "OSD", Otsego: "OTS",
  Ottawa: "OTT", "Presque Isle": "PI", Roscommon: "ROS", Saginaw: "SAG",
  Sanilac: "SAN", Schoolcraft: "SCH", Shiawassee: "SHI", "St. Clair": "SC",
  "St. Joseph": "SJ", Tuscola: "TUS", "Van Buren": "VB", Washtenaw: "WAS",
  Wayne: "WAY", Wexford: "WEX",
};

type LayerKey = "broadband" | "water";
type ViewKey = "map" | "list";

// Each layer has its own unit and its own "good direction" — these are
// genuinely different metrics from the live API, not a single unified scale:
//   broadband: availabilityPctOfZip — higher is BETTER (more coverage)
//   water:     affordabilityRatioPct — higher is WORSE (more cost burden)
// Energy burden is deliberately NOT a map layer here — verified directly
// against the live database that energy_burden_by_race has geography_id =
// null on every row, so it's genuinely statewide/national reference data,
// not something that can honestly be shown per county. It's still surfaced
// in the county detail panel, clearly labeled as statewide context rather
// than implied to be county-specific.
const LAYER_LABEL: Record<LayerKey, string> = {
  broadband: "Broadband Availability",
  water: "Water Affordability Burden",
};
const LAYER_UNIT_SUFFIX: Record<LayerKey, string> = {
  broadband: "% coverage",
  water: "% of income",
};
const LAYER_ICON: Record<LayerKey, typeof Wifi> = {
  broadband: Wifi,
  water: Droplets,
};
const VIEW_LABEL: Record<ViewKey, string> = { map: "Map", list: "County List" };

// No-data fill: a light neutral gray, clearly distinct from both the white
// card background and the data-color ramp below, so every one of the 83
// counties reads as a present, distinct tile even with no data sampled yet.
const NO_DATA_FILL = "hsl(220 10% 92%)";
const NO_DATA_TEXT = "hsl(220 10% 60%)";

// Same lightness curve PurplBook itself uses (82% -> 32%, darker = more
// intense) — this only works cleanly on a LIGHT background, which is why an
// earlier version of this file used an inverted, saturation-driven ramp: the
// component used to sit on the site's dark theme. Now that it sits in its
// own white card (matching PurplBook's own light-background pattern), the
// straightforward approach applies directly.
function tileColor(value: number | null, layer: LayerKey): string {
  if (value === null) return NO_DATA_FILL;
  const max = layer === "broadband" ? 100 : 15;
  const t = Math.min(1, Math.max(0, value / max));
  const lightness = 82 - t * 50;
  const hue = layer === "broadband" ? "152 40%" : "14 60%";
  return `hsl(${hue} ${lightness}%)`;
}

function barColor(layer: LayerKey): string {
  return layer === "broadband" ? "hsl(152 55% 55%)" : "hsl(14 65% 58%)";
}

export default function UtilityCountyCartogram() {
  const [view, setView] = useState<ViewKey>("map");
  const [layer, setLayer] = useState<LayerKey>("water");
  const [openCounty, setOpenCounty] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // energyRows is genuinely statewide/national reference data (verified
  // directly: every row in energy_burden_by_race has geography_id = null),
  // so unlike waterRates/broadbandRates there is no per-county grouping to
  // do here — the same flat list is shown in every county's detail panel,
  // clearly labeled there as statewide context rather than county-specific.
  const { data: servicesData, isLoading: servicesLoading, isError: servicesError } = useMichiganEssentialServices();
  const { data: energyRows, isLoading: energyLoading } = useEnergyBurdenByCounty();

  const isLoading = servicesLoading || energyLoading;
  const isError = servicesError;

  const countiesByName = useMemo(() => {
    const map = new Map<string, CountyEntry>();
    for (const c of servicesData?.counties ?? []) map.set(c.name, c);
    return map;
  }, [servicesData]);

  const countyAggregates = useMemo(
    () => aggregateByCounty(servicesData?.waterSewageRates ?? [], servicesData?.broadbandRates ?? []),
    [servicesData]
  );

  const placesByCounty = useMemo(
    () => groupPlacesByCounty(servicesData?.places ?? []),
    [servicesData]
  );

  function metricValue(countyName: string, ly: LayerKey): number | null {
    if (ly === "broadband") return countyAggregates.get(countyName)?.broadbandAvailabilityPct ?? null;
    return countyAggregates.get(countyName)?.waterAffordabilityRatioPct ?? null;
  }

  const filteredCounties = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COUNTIES;
    return ALL_COUNTIES.filter(
      (n) =>
        n.toLowerCase().includes(q) ||
        (placesByCounty.get(n) ?? []).some((p) => p.name.toLowerCase().includes(q))
    );
  }, [query, placesByCounty]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 mb-4 pb-0">
        <div className="flex">
          {(Object.keys(VIEW_LABEL) as ViewKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                view === key
                  ? "text-gray-900 border-liberation-gold"
                  : "text-gray-400 border-transparent hover:text-gray-700"
              }`}
              aria-current={view === key ? "true" : undefined}
            >
              {VIEW_LABEL[key]}
            </button>
          ))}
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a county…"
            aria-label="Search counties"
            className="pl-7 pr-3 py-1.5 text-xs rounded-md bg-gray-100 border border-gray-300 text-gray-900 placeholder:text-gray-400 w-40 focus:outline-none focus:border-liberation-gold/50"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(LAYER_LABEL) as LayerKey[]).map((key) => {
          const Icon = LAYER_ICON[key];
          const active = layer === key;
          return (
            <button
              key={key}
              onClick={() => setLayer(key)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                active
                  ? "bg-liberation-gold text-liberation-dark border-liberation-gold"
                  : "bg-transparent text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {LAYER_LABEL[key]}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading essential services data">
          <Skeleton className="h-[500px] w-full max-w-2xl rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      )}

      {isError && (
        <div role="alert" className="h-40 flex flex-col items-center justify-center gap-2 text-gray-500 text-sm border border-gray-200 rounded-lg">
          <span>Data couldn't load.</span>
          <button onClick={() => window.location.reload()} className="text-xs text-liberation-gold hover:underline">
            Try refreshing the page
          </button>
        </div>
      )}

      {!isLoading && !isError && view === "map" && (
        <MapView
          layer={layer}
          query={query}
          openCounty={openCounty}
          setOpenCounty={setOpenCounty}
          hovered={hovered}
          setHovered={setHovered}
          metricValue={metricValue}
        />
      )}

      {!isLoading && !isError && view === "list" && (
        <ListView
          layer={layer}
          counties={filteredCounties}
          openCounty={openCounty}
          setOpenCounty={setOpenCounty}
          metricValue={metricValue}
          countiesByName={countiesByName}
          waterRates={servicesData?.waterSewageRates ?? []}
          broadbandRates={servicesData?.broadbandRates ?? []}
          energyRows={energyRows ?? []}
          placesByCounty={placesByCounty}
        />
      )}

      {view === "map" && !isLoading && !isError && (
        <div className="border-t-2 border-gray-200 mt-1">
          {openCounty ? (
            <CountyDetailPanel
              countyName={openCounty}
              county={countiesByName.get(openCounty)}
              waterRates={(servicesData?.waterSewageRates ?? []).filter((w) => w.county === openCounty)}
              broadbandRates={(servicesData?.broadbandRates ?? []).filter((b) => b.county === openCounty)}
              energyRows={energyRows ?? []}
              places={placesByCounty.get(openCounty) ?? []}
              onClose={() => setOpenCounty(null)}
            />
          ) : (
            <p className="text-left text-xs text-gray-400 py-6">
              Select any county above to see its water, energy, and broadband data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Map view ──────────────────────────────────────────────────────────────────

function MapView({
  layer,
  query,
  openCounty,
  setOpenCounty,
  hovered,
  setHovered,
  metricValue,
}: {
  layer: LayerKey;
  query: string;
  openCounty: string | null;
  setOpenCounty: (c: string | null) => void;
  hovered: string | null;
  setHovered: (c: string | null) => void;
  metricValue: (countyName: string, layer: LayerKey) => number | null;
}) {
  const q = query.trim().toLowerCase();

  return (
    <>
      <svg
        viewBox={`0 0 ${GRID_COLS * (CELL + GAP)} ${GRID_ROWS * (CELL + GAP)}`}
        className="w-full max-w-2xl block"
        style={{ height: "auto", overflow: "visible" }}
        role="group"
        aria-label="Michigan county cartogram"
      >
        {Object.entries(GRID).map(([name, [r, c]]) => {
          const value = metricValue(name, layer);
          const isOpen = openCounty === name;
          const isHovered = hovered === name;
          const matches = !q || name.toLowerCase().includes(q);
          const x = c * (CELL + GAP);
          const y = r * (CELL + GAP);
          const cx = x + CELL / 2;
          const cy = y + CELL / 2;
          return (
            <g
              key={name}
              tabIndex={0}
              role="button"
              aria-label={`${name} County${value !== null ? `, ${value}${LAYER_UNIT_SUFFIX[layer]}` : ", not yet sampled"}`}
              aria-pressed={isOpen}
              opacity={matches ? 1 : 0.2}
              style={{
                cursor: "pointer",
                outline: "none",
                transform: isHovered ? "scale(1.12)" : "scale(1)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: "transform 0.15s ease",
              }}
              onClick={() => setOpenCounty(isOpen ? null : name)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenCounty(isOpen ? null : name);
                }
              }}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(name)}
              onBlur={() => setHovered(null)}
            >
              <rect
                x={x} y={y} width={CELL} height={CELL} rx={6}
                fill={tileColor(value, layer)}
                stroke={isOpen ? "#A8442C" : "#e5e7eb"}
                strokeWidth={isOpen ? 2 : 0.75}
                style={{ transition: "stroke 0.1s ease" }}
              />
              <text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="ui-monospace, monospace"
                fontWeight={600}
                fontSize={ABBR[name]?.length > 2 ? 13 : 15}
                fill={value !== null ? "#1f2937" : NO_DATA_TEXT}
                style={{ pointerEvents: "none" }}
              >
                {ABBR[name] ?? name.slice(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-left text-xs text-gray-400 mt-2 h-4" aria-live="polite">
        {hovered ? (
          <span>
            <strong className="text-gray-800">{hovered} County</strong>
            {" — "}
            {(() => {
              const v = metricValue(hovered, layer);
              return v !== null ? `${v}${LAYER_UNIT_SUFFIX[layer]}` : "not yet sampled";
            })()}
          </span>
        ) : (
          "Hover or tab to a county for its value · click or press Enter to open details below"
        )}
      </div>

      <div className="flex gap-5 flex-wrap text-[11px] text-gray-400 py-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: tileColor(layer === "broadband" ? 100 : 15, layer) }} />
          {layer === "broadband" ? "High coverage" : "High burden"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: tileColor(layer === "broadband" ? 20 : 2, layer) }} />
          {layer === "broadband" ? "Lower coverage" : "Lower burden"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-gray-300" style={{ background: NO_DATA_FILL }} />
          Not yet sampled
        </span>
      </div>
    </>
  );
}

// ── County List (Ledger) view ──────────────────────────────────────────────────
// Mirrors PurplBook's LedgerView. IMPORTANT SCOPE NOTE: this lists counties
// County List view. Places are nested under their county via the
// place->county crosswalk built from a TIGER/Line point-in-polygon join
// (745/745 places matched — see RECONCILIATION.md). Energy burden is passed
// through as a flat, statewide list (see the note above) — the same data is
// shown in every county's detail panel, clearly labeled as statewide
// reference rather than implied to be county-specific.

function ListView({
  layer,
  counties,
  openCounty,
  setOpenCounty,
  metricValue,
  countiesByName,
  waterRates,
  broadbandRates,
  energyRows,
  placesByCounty,
}: {
  layer: LayerKey;
  counties: string[];
  openCounty: string | null;
  setOpenCounty: (c: string | null) => void;
  metricValue: (countyName: string, layer: LayerKey) => number | null;
  countiesByName: Map<string, CountyEntry>;
  waterRates: WaterSewageRateEntry[];
  broadbandRates: BroadbandRateEntry[];
  energyRows: EnergyBurdenEntry[];
  placesByCounty: Map<string, PlaceEntry[]>;
}) {
  const max = useMemo(() => {
    let m = 1;
    for (const name of counties) {
      const v = metricValue(name, layer);
      if (v !== null) m = Math.max(m, v);
    }
    return m;
  }, [counties, layer, metricValue]);

  if (counties.length === 0) {
    return <p className="text-xs text-gray-400 py-6">No counties or places match that search.</p>;
  }

  return (
    <div role="list" aria-label="Michigan counties">
      {counties.map((name) => {
        const value = metricValue(name, layer);
        const isEmpty = value === null;
        const widthPct = isEmpty ? 0 : Math.max((value / max) * 100, 2);
        const isOpen = openCounty === name;
        const places = placesByCounty.get(name) ?? [];

        return (
          <div key={name} role="listitem" className="border-b border-gray-200">
            <button
              onClick={() => setOpenCounty(isOpen ? null : name)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 py-2.5 text-left"
            >
              <span className={`flex-shrink-0 w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-90 text-liberation-gold" : ""}`}>
                ▸
              </span>
              <span className={`font-bold text-sm flex-shrink-0 w-28 ${isEmpty ? "text-gray-400" : "text-gray-900"}`}>
                {name}
                {places.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-normal text-gray-400">({places.length})</span>
                )}
              </span>
              <span className="flex-1 h-1.5 rounded-full bg-gray-50 overflow-hidden max-w-[160px]">
                <span className="block h-full rounded-full" style={{ width: `${widthPct}%`, background: barColor(layer) }} />
              </span>
              <span className={`text-xs font-mono w-16 text-right flex-shrink-0 ${isEmpty ? "text-gray-400" : "text-gray-700"}`}>
                {isEmpty ? "—" : `${value}%`}
              </span>
            </button>
            {isOpen && (
              <CountyDetailPanel
                countyName={name}
                county={countiesByName.get(name)}
                waterRates={waterRates.filter((w) => w.county === name)}
                broadbandRates={broadbandRates.filter((b) => b.county === name)}
                energyRows={energyRows}
                places={places}
                onClose={() => setOpenCounty(null)}
                compact
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── County detail panel ──────────────────────────────────────────────────────

function TruncatedList<T>({
  items,
  render,
  keyFn,
  initialCount = 5,
}: {
  items: T[];
  render: (item: T) => ReactNode;
  keyFn: (item: T) => string;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;

  return (
    <>
      <ul className="space-y-1 text-xs text-gray-600">
        {visible.map((item) => (
          <li key={keyFn(item)}>{render(item)}</li>
        ))}
      </ul>
      {!expanded && hiddenCount > 0 && (
        <button onClick={() => setExpanded(true)} className="text-[11px] text-liberation-gold hover:underline mt-1">
          +{hiddenCount} more
        </button>
      )}
    </>
  );
}

// ── Mini pie chart ────────────────────────────────────────────────────────────
// Small recharts pie for the three summary cards. Each slice's meaning is
// deliberately kept to things that are genuinely "parts of a whole" (sums to
// ~100%) — technology mix, bill composition, population share — rather than
// forcing independent percentages (like burden % per race group, which does
// NOT sum to 100 across races) into a pie, which would misrepresent the data.
const PIE_COLORS = ["hsl(152 45% 58%)", "hsl(14 65% 62%)", "hsl(40 55% 62%)", "hsl(210 45% 62%)", "hsl(280 35% 62%)"];

function MiniPie({ data }: { data: Array<{ name: string; value: number }> }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <p className="text-xs text-gray-400">Not enough data to chart.</p>;
  }
  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 72, height: 72 }} className="flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={18} outerRadius={34} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
              contentStyle={{ background: "#1a1512", border: "1px solid rgba(244,236,216,0.15)", borderRadius: 6, fontSize: 11 }}
              itemStyle={{ color: "#f4ecd8" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="text-[11px] text-gray-600 space-y-0.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            {d.name}: {d.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}

function CountyDetailPanel({
  countyName,
  county,
  waterRates,
  broadbandRates,
  energyRows,
  places,
  onClose,
  compact = false,
}: {
  countyName: string;
  county: CountyEntry | undefined;
  waterRates: WaterSewageRateEntry[];
  broadbandRates: BroadbandRateEntry[];
  energyRows: EnergyBurdenEntry[];
  places: PlaceEntry[];
  onClose: () => void;
  compact?: boolean;
}) {
  const { data: allRateActions } = useRateActionsByCounty() as { data: RateActionEntry[] | undefined };
  const { data: allRateHistory } = useRateHistoryByCounty() as { data: RateHistoryEntry[] | undefined };

  // Rate actions filed/decided specifically for this county. Most MPSC
  // filings are utility-wide rather than county-specific, so this is often
  // empty — that's shown honestly below rather than hidden.
  const countyRateActions = useMemo(
    () => (allRateActions ?? []).filter((a: RateActionEntry) => a.geography === countyName),
    [allRateActions, countyName]
  );

  // Rate history has no geography link at all (confirmed against the live
  // schema — utility_rate_history_mi is statewide/utility-level only), so
  // "over time" is shown for whichever utility(ies) actually filed an action
  // in this county, rather than every utility in the state.
  const relevantUtilities = useMemo(
    () => new Set(countyRateActions.map((a: RateActionEntry) => a.utility).filter(Boolean)),
    [countyRateActions]
  );
  const utilityRateHistory = useMemo(
    () =>
      (allRateHistory ?? [])
        .filter((h: RateHistoryEntry) => relevantUtilities.has(h.utility))
        .sort((a: RateHistoryEntry, b: RateHistoryEntry) => (a.year ?? 0) - (b.year ?? 0)),
    [allRateHistory, relevantUtilities]
  );

  // Broadband: technology mix by share of sampled records — genuinely
  // "parts of a whole" (every record has exactly one technology).
  const broadbandPie = useMemo(() => {
    if (broadbandRates.length === 0) return [];
    const counts = new Map<string, number>();
    for (const r of broadbandRates) {
      const tech = r.technology || "Unknown";
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      value: Math.round((count / broadbandRates.length) * 100),
    }));
  }, [broadbandRates]);

  // Water & sewage: fixed customer charge vs. estimated usage charge, as a
  // share of the typical monthly bill. The usage-charge share is a RESIDUAL
  // (typical bill minus the fixed charge) since per-record usage-volume
  // detail isn't tracked — an approximation, and labeled as one.
  const waterPie = useMemo(() => {
    const withBoth = waterRates.filter(
      (r) => r.estimatedTypicalMonthlyBill !== null && r.customerChargeMonthly !== null && r.estimatedTypicalMonthlyBill > 0
    );
    if (withBoth.length === 0) return [];
    const avgBill = withBoth.reduce((s, r) => s + (r.estimatedTypicalMonthlyBill ?? 0), 0) / withBoth.length;
    const avgFixed = withBoth.reduce((s, r) => s + (r.customerChargeMonthly ?? 0), 0) / withBoth.length;
    const fixedPct = Math.max(0, Math.min(100, Math.round((avgFixed / avgBill) * 100)));
    return [
      { name: "Fixed charge", value: fixedPct },
      { name: "Est. usage charge", value: 100 - fixedPct },
    ];
  }, [waterRates]);

  // Energy section pie: population share by race — a valid "parts of a
  // whole" from county demographics (sums to ~100%). Deliberately NOT a pie
  // of burden % per race, since those are independent figures that don't sum
  // to a meaningful total; burden % is still shown as plain numbers below.
  const racePopulationPie = useMemo(() => {
    if (!county || county.raceBreakdown.length === 0) return [];
    return county.raceBreakdown
      .filter((r) => r.pctOfPopulation !== null)
      .map((r) => ({ name: r.category, value: r.pctOfPopulation as number }));
  }, [county]);

  return (
    <div className={compact ? "pb-4 pl-6" : "py-4"} aria-live="polite">
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">{countyName} County</h4>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-800">
            Close ✕
          </button>
        </div>
      )}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
            <Wifi className="w-3.5 h-3.5" /> Broadband
          </div>
          {broadbandRates.length > 0 ? (
            <>
              <MiniPie data={broadbandPie} />
              <div className="mt-2">
                <TruncatedList
                  items={broadbandRates}
                  keyFn={(r) => r.id}
                  initialCount={3}
                  render={(r) => (
                    <>
                      {r.provider} — {r.technology || "—"}
                      {r.availabilityPctOfZip !== null && `, ${r.availabilityPctOfZip}% avail.`}
                    </>
                  )}
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">Not yet sampled in this county.</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
            <Droplets className="w-3.5 h-3.5" /> Water & Sewage
          </div>
          {waterRates.length > 0 ? (
            <>
              <MiniPie data={waterPie} />
              <div className="mt-2">
                <TruncatedList
                  items={waterRates}
                  keyFn={(r) => r.id}
                  initialCount={3}
                  render={(r) => (
                    <>
                      {r.provider} ({r.municipalityServiceArea || "—"})
                      {r.estimatedTypicalMonthlyBill !== null && ` — $${r.estimatedTypicalMonthlyBill}/mo`}
                      {r.affordabilityRatioPct !== null && `, ${r.affordabilityRatioPct}% of income`}
                    </>
                  )}
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400">Not yet sampled in this county.</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
            <Zap className="w-3.5 h-3.5" /> Energy Burden by Race
          </div>
          {racePopulationPie.length > 0 && (
            <>
              <div className="text-[11px] text-gray-500 mb-1">{countyName} population by race:</div>
              <MiniPie data={racePopulationPie} />
            </>
          )}
          {energyRows.length > 0 ? (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-[11px] text-gray-500 mb-1">
                Statewide reference (not specific to {countyName} — energy burden isn't tracked at the county level in this data source):
              </div>
              <TruncatedList
                items={energyRows}
                keyFn={(r: EnergyBurdenEntry) => r.id}
                initialCount={3}
                render={(r: EnergyBurdenEntry) => (
                  <>
                    {r.racialGroup}
                    {r.medianBurdenPct !== null && `: ${r.medianBurdenPct}%`}
                    {r.dataYear && ` (${r.dataYear})`}
                  </>
                )}
              />
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">Statewide energy burden reference data unavailable.</p>
          )}
        </div>
      </div>

      {/* Energy providers & rate changes — lets a person connect their own
          utility to recent rate actions and, where available, that utility's
          rate history over time. */}
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Energy Providers & Rate Changes
        </div>
        {countyRateActions.length > 0 ? (
          <>
            <TruncatedList
              items={countyRateActions}
              keyFn={(a: RateActionEntry) => a.id}
              initialCount={3}
              render={(a: RateActionEntry) => (
                <>
                  <strong className="text-gray-800">{a.utility}</strong> — {a.actionType || "rate action"}
                  {a.residentialPctIncrease !== null && `, ${a.residentialPctIncrease}% residential increase`}
                  {a.effectiveDate && ` (effective ${a.effectiveDate})`}
                </>
              )}
            />
            {utilityRateHistory.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-[11px] text-gray-500 mb-1">Rate over time:</div>
                <TruncatedList
                  items={utilityRateHistory}
                  keyFn={(h: RateHistoryEntry) => h.id}
                  initialCount={4}
                  render={(h: RateHistoryEntry) => (
                    <>
                      {h.utility} {h.year}: {h.rateCentsPerKwh !== null ? `${h.rateCentsPerKwh}¢/kWh` : "—"}
                      {h.yoyChangePct !== null && ` (${h.yoyChangePct > 0 ? "+" : ""}${h.yoyChangePct}% YoY)`}
                    </>
                  )}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400">
            No rate actions on file for {countyName} specifically — most filings are utility-wide. See the Rate Actions tab for the full statewide list.
          </p>
        )}
      </div>

      {county && (
        <div className="mt-3 text-xs text-gray-400">
          {county.medianHouseholdIncome !== null && <span>County median household income: ${county.medianHouseholdIncome.toLocaleString()}</span>}
          {county.povertyRatePct !== null && <span> · Poverty rate: {county.povertyRatePct}%</span>}
        </div>
      )}

      {places.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-700 mb-1.5">
            Places in this county ({places.length})
          </div>
          <TruncatedList
            items={places}
            keyFn={(p) => p.geoid}
            render={(p) => (
              <>
                {p.name}
                {p.population !== null && ` — pop. ${p.population.toLocaleString()}`}
                {p.medianHouseholdIncome !== null && `, $${p.medianHouseholdIncome.toLocaleString()} median income`}
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}
