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
// plain inline SVG. Positions from real county centroids (topojson/us-atlas),
// compressed to 27x25 with zero collisions.

const GRID: Record<string, [number, number]> = {
  Alcona: [14, 21], Alger: [5, 11], Allegan: [22, 12], Alpena: [12, 21],
  Antrim: [12, 15], Arenac: [16, 20], Baraga: [4, 5], Barry: [22, 15],
  Bay: [18, 20], Benzie: [14, 12], Berrien: [26, 11], Branch: [26, 16],
  Calhoun: [24, 16], Cass: [26, 12], Charlevoix: [10, 15], Cheboygan: [10, 18],
  Chippewa: [6, 19], Clare: [16, 16], Clinton: [21, 18], Crawford: [14, 18],
  Delta: [9, 10], Dickinson: [8, 6], Eaton: [22, 16], Emmet: [10, 16],
  Genesee: [21, 20], Gladwin: [16, 18], Gogebic: [5, 0], "Grand Traverse": [12, 14],
  Gratiot: [20, 18], Hillsdale: [26, 18], Houghton: [4, 4], Huron: [18, 22],
  Ingham: [22, 18], Ionia: [21, 16], Iosco: [15, 21], Iron: [8, 4],
  Isabella: [19, 16], Jackson: [24, 18], Kalamazoo: [24, 14], Kalkaska: [14, 15],
  Kent: [21, 14], Keweenaw: [0, 5], Lake: [16, 14], Lapeer: [20, 21],
  Leelanau: [11, 14], Lenawee: [26, 19], Livingston: [22, 19], Luce: [5, 14],
  Mackinac: [8, 16], Macomb: [22, 22], Manistee: [15, 12], Marquette: [5, 8],
  Mason: [16, 11], Mecosta: [18, 15], Menominee: [10, 8], Midland: [19, 18],
  Missaukee: [15, 16], Monroe: [26, 21], Montcalm: [20, 15], Montmorency: [11, 19],
  Muskegon: [20, 12], Newaygo: [19, 14], Oakland: [22, 21], Oceana: [18, 11],
  Ogemaw: [15, 19], Ontonagon: [4, 1], Osceola: [16, 15], Oscoda: [14, 19],
  Otsego: [11, 18], Ottawa: [21, 12], "Presque Isle": [10, 20], Roscommon: [15, 18],
  Saginaw: [19, 19], Sanilac: [20, 22], Schoolcraft: [8, 12], Shiawassee: [21, 19],
  "St. Clair": [22, 24], "St. Joseph": [26, 14], Tuscola: [19, 21], "Van Buren": [24, 12],
  Washtenaw: [24, 20], Wayne: [25, 22], Wexford: [15, 14],
};

const ALL_COUNTIES = Object.keys(GRID).sort();
const CELL = 26, GAP = 3;
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

type LayerKey = "broadband" | "water" | "energy";
type ViewKey = "map" | "list";

// Each layer has its own unit and its own "good direction" — these are
// genuinely different metrics from the live API, not a single unified scale:
//   broadband: availabilityPctOfZip — higher is BETTER (more coverage)
//   water:     affordabilityRatioPct — higher is WORSE (more cost burden)
//   energy:    medianBurdenPct for Black households specifically — higher is WORSE
const LAYER_LABEL: Record<LayerKey, string> = {
  broadband: "Broadband Availability",
  water: "Water Affordability Burden",
  energy: "Energy Burden (Black Households)",
};
const LAYER_UNIT_SUFFIX: Record<LayerKey, string> = {
  broadband: "% coverage",
  water: "% of income",
  energy: "% of income",
};
const LAYER_ICON: Record<LayerKey, typeof Wifi> = {
  broadband: Wifi,
  water: Droplets,
  energy: Zap,
};
const VIEW_LABEL: Record<ViewKey, string> = { map: "Map", list: "County List" };

// No-data fill: needs to read as a distinct, visible TILE against the dark
// page background — the previous version (near-transparent, low-alpha hatch)
// effectively vanished against liberation-dark, which is what made most of
// the 83 counties look "missing" rather than just "unsampled."
const NO_DATA_FILL = "hsl(40 20% 88% / 0.22)";

// Rewritten for legibility on a DARK background — PurplBook's own ramp
// (lightness 82->32, darker = more) works because PurplBook sits on a white
// page; darkening a tile on a dark background makes it LESS visible, the
// opposite of what's needed here. Lightness stays in a fixed, always-visible
// band; SATURATION carries the intensity signal instead: low value = pale,
// high value = vivid. Every data tile stays clearly lighter than the page
// background regardless of magnitude.
function tileColor(value: number | null, layer: LayerKey): string {
  if (value === null) return NO_DATA_FILL;
  const max = layer === "broadband" ? 100 : 15;
  const t = Math.min(1, Math.max(0, value / max));
  const saturation = 25 + t * 55;
  const lightness = 78 - t * 18;
  const hue = layer === "broadband" ? 152 : 14;
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
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

  // Energy burden specific to Black households, matched by county name.
  // If a county has multiple race rows, this picks the Black-households row;
  // other races are still shown in the detail panel, just not used for the map fill.
  const energyByCounty = useMemo(() => {
    const map = new Map<string, EnergyBurdenEntry>();
    for (const row of energyRows ?? []) {
      if (row.racialGroup?.toLowerCase().includes("black")) map.set(row.geography, row);
    }
    return map;
  }, [energyRows]);

  const allEnergyByCountyName = useMemo(() => {
    const map = new Map<string, EnergyBurdenEntry[]>();
    for (const row of energyRows ?? []) {
      if (!map.has(row.geography)) map.set(row.geography, []);
      map.get(row.geography)!.push(row);
    }
    return map;
  }, [energyRows]);

  function metricValue(countyName: string, ly: LayerKey): number | null {
    if (ly === "broadband") return countyAggregates.get(countyName)?.broadbandAvailabilityPct ?? null;
    if (ly === "water") return countyAggregates.get(countyName)?.waterAffordabilityRatioPct ?? null;
    return energyByCounty.get(countyName)?.medianBurdenPct ?? null;
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
    <div className="px-4 pt-6 pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-liberation-cream/15 mb-4 pb-0">
        <div className="flex">
          {(Object.keys(VIEW_LABEL) as ViewKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                view === key
                  ? "text-liberation-cream border-liberation-gold"
                  : "text-liberation-cream/40 border-transparent hover:text-liberation-cream/60"
              }`}
              aria-current={view === key ? "true" : undefined}
            >
              {VIEW_LABEL[key]}
            </button>
          ))}
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-liberation-cream/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a county…"
            aria-label="Search counties"
            className="pl-7 pr-3 py-1.5 text-xs rounded-md bg-liberation-dark/40 border border-liberation-cream/20 text-liberation-cream placeholder:text-liberation-cream/30 w-40 focus:outline-none focus:border-liberation-gold/50"
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
                  : "bg-transparent text-liberation-cream/60 border-liberation-cream/20 hover:border-liberation-cream/40"
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
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      )}

      {isError && (
        <div role="alert" className="h-40 flex flex-col items-center justify-center gap-2 text-liberation-cream/50 text-sm border border-liberation-cream/10 rounded-lg">
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
          allEnergyByCountyName={allEnergyByCountyName}
          placesByCounty={placesByCounty}
        />
      )}

      {view === "map" && !isLoading && !isError && (
        <div className="border-t-2 border-liberation-cream/10 mt-1">
          {openCounty ? (
            <CountyDetailPanel
              countyName={openCounty}
              county={countiesByName.get(openCounty)}
              waterRates={(servicesData?.waterSewageRates ?? []).filter((w) => w.county === openCounty)}
              broadbandRates={(servicesData?.broadbandRates ?? []).filter((b) => b.county === openCounty)}
              energyRows={allEnergyByCountyName.get(openCounty) ?? []}
              places={placesByCounty.get(openCounty) ?? []}
              onClose={() => setOpenCounty(null)}
            />
          ) : (
            <p className="text-left text-xs text-liberation-cream/40 py-6">
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
        className="w-full block"
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
                x={x} y={y} width={CELL} height={CELL} rx={4}
                fill={tileColor(value, layer)}
                stroke={isOpen ? "#A8442C" : "hsl(40 15% 82% / 0.45)"}
                strokeWidth={isOpen ? 2 : 0.75}
                style={{ transition: "stroke 0.1s ease" }}
              />
              <text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="ui-monospace, monospace"
                fontWeight={600}
                fontSize={ABBR[name]?.length > 2 ? 8 : 9}
                fill={value !== null ? "hsl(30 25% 18%)" : "hsl(40 15% 55%)"}
                style={{ pointerEvents: "none" }}
              >
                {ABBR[name] ?? name.slice(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-left text-xs text-liberation-cream/40 mt-2 h-4" aria-live="polite">
        {hovered ? (
          <span>
            <strong className="text-liberation-cream/80">{hovered} County</strong>
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

      <div className="flex gap-5 flex-wrap text-[11px] text-liberation-cream/40 py-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: tileColor(layer === "broadband" ? 100 : 15, layer) }} />
          {layer === "broadband" ? "High coverage" : "High burden"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: tileColor(layer === "broadband" ? 20 : 2, layer) }} />
          {layer === "broadband" ? "Lower coverage" : "Lower burden"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-liberation-cream/20" style={{ background: NO_DATA_FILL }} />
          Not yet sampled
        </span>
      </div>
    </>
  );
}

// ── County List (Ledger) view ──────────────────────────────────────────────────
// Mirrors PurplBook's LedgerView. IMPORTANT SCOPE NOTE: this lists counties
// only. Nesting individual places (cities/villages) under their county was
// requested, but the live michigan-essential-services function does not
// currently return place-level records at all (verified directly against
// the deployed source — no `places` field exists in its response). Adding
// that requires a backend change first: a places query similar to the
// existing counties query, filtered to level='place', plus a resolvable
// parent-county link via geo_crosswalk. Flagging this plainly rather than
// building UI that pretends to support data that doesn't exist yet.

function ListView({
  layer,
  counties,
  openCounty,
  setOpenCounty,
  metricValue,
  countiesByName,
  waterRates,
  broadbandRates,
  allEnergyByCountyName,
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
  allEnergyByCountyName: Map<string, EnergyBurdenEntry[]>;
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
    return <p className="text-xs text-liberation-cream/40 py-6">No counties or places match that search.</p>;
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
          <div key={name} role="listitem" className="border-b border-liberation-cream/10">
            <button
              onClick={() => setOpenCounty(isOpen ? null : name)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 py-2.5 text-left"
            >
              <span className={`flex-shrink-0 w-3.5 h-3.5 text-liberation-cream/25 transition-transform ${isOpen ? "rotate-90 text-liberation-gold" : ""}`}>
                ▸
              </span>
              <span className={`font-bold text-sm flex-shrink-0 w-28 ${isEmpty ? "text-liberation-cream/35" : "text-liberation-cream"}`}>
                {name}
                {places.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-normal text-liberation-cream/35">({places.length})</span>
                )}
              </span>
              <span className="flex-1 h-1.5 rounded-full bg-liberation-cream/10 overflow-hidden max-w-[160px]">
                <span className="block h-full rounded-full" style={{ width: `${widthPct}%`, background: barColor(layer) }} />
              </span>
              <span className={`text-xs font-mono w-16 text-right flex-shrink-0 ${isEmpty ? "text-liberation-cream/30" : "text-liberation-cream/70"}`}>
                {isEmpty ? "—" : `${value}%`}
              </span>
            </button>
            {isOpen && (
              <CountyDetailPanel
                countyName={name}
                county={countiesByName.get(name)}
                waterRates={waterRates.filter((w) => w.county === name)}
                broadbandRates={broadbandRates.filter((b) => b.county === name)}
                energyRows={allEnergyByCountyName.get(name) ?? []}
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
      <ul className="space-y-1 text-xs text-liberation-cream/60">
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
    return <p className="text-xs text-liberation-cream/40">Not enough data to chart.</p>;
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
      <ul className="text-[11px] text-liberation-cream/60 space-y-0.5">
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
          <h4 className="font-semibold text-liberation-cream">{countyName} County</h4>
          <button onClick={onClose} className="text-xs text-liberation-cream/40 hover:text-liberation-cream/70">
            Close ✕
          </button>
        </div>
      )}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-liberation-cream/10 bg-liberation-dark/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-liberation-cream/70 mb-2">
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
            <p className="text-xs text-liberation-cream/40">Not yet sampled in this county.</p>
          )}
        </div>

        <div className="rounded-lg border border-liberation-cream/10 bg-liberation-dark/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-liberation-cream/70 mb-2">
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
            <p className="text-xs text-liberation-cream/40">Not yet sampled in this county.</p>
          )}
        </div>

        <div className="rounded-lg border border-liberation-cream/10 bg-liberation-dark/30 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-liberation-cream/70 mb-2">
            <Zap className="w-3.5 h-3.5" /> Energy Burden by Race
          </div>
          {racePopulationPie.length > 0 && <MiniPie data={racePopulationPie} />}
          {energyRows.length > 0 ? (
            <div className="mt-2">
              <div className="text-[11px] text-liberation-cream/50 mb-1">Median energy burden (% of income), by race:</div>
              <TruncatedList
                items={energyRows}
                keyFn={(r) => r.id}
                initialCount={3}
                render={(r) => (
                  <>
                    {r.racialGroup}
                    {r.medianBurdenPct !== null && `: ${r.medianBurdenPct}%`}
                    {r.dataYear && ` (${r.dataYear})`}
                  </>
                )}
              />
            </div>
          ) : (
            <p className="text-xs text-liberation-cream/40 mt-2">Burden-by-race not yet sampled in this county.</p>
          )}
        </div>
      </div>

      {/* Energy providers & rate changes — lets a person connect their own
          utility to recent rate actions and, where available, that utility's
          rate history over time. */}
      <div className="mt-3 rounded-lg border border-liberation-cream/10 bg-liberation-dark/30 p-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-liberation-cream/70 mb-1.5">
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
                  <strong className="text-liberation-cream/80">{a.utility}</strong> — {a.actionType || "rate action"}
                  {a.residentialPctIncrease !== null && `, ${a.residentialPctIncrease}% residential increase`}
                  {a.effectiveDate && ` (effective ${a.effectiveDate})`}
                </>
              )}
            />
            {utilityRateHistory.length > 0 && (
              <div className="mt-2 pt-2 border-t border-liberation-cream/10">
                <div className="text-[11px] text-liberation-cream/50 mb-1">Rate over time:</div>
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
          <p className="text-xs text-liberation-cream/40">
            No rate actions on file for {countyName} specifically — most filings are utility-wide. See the Rate Actions tab for the full statewide list.
          </p>
        )}
      </div>

      {county && (
        <div className="mt-3 text-xs text-liberation-cream/40">
          {county.medianHouseholdIncome !== null && <span>County median household income: ${county.medianHouseholdIncome.toLocaleString()}</span>}
          {county.povertyRatePct !== null && <span> · Poverty rate: {county.povertyRatePct}%</span>}
        </div>
      )}

      {places.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-liberation-cream/70 mb-1.5">
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
