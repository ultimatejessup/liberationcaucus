import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Wifi, Droplets } from "lucide-react";
import { useCountyMetrics, type CountyMetric } from "@/hooks/useUtilityRateTracker";
import michiganCountiesGeoJson from "@/data/michigan-counties.json";

// ── Color ramps ──────────────────────────────────────────────────────────
// Both ramps run from the site's forest-green (good/affordable/available) to
// terracotta (bad/unaffordable/unavailable) — same semantic direction as the
// rest of the tracker's badges (green = favorable, red/terracotta = concern).
// All five stops individually verified at >= 4.5:1 contrast against the
// liberation-dark (#1a1410-range) page background used for labels drawn on
// top of the map, per WCAG AA.

const BROADBAND_RAMP = [
  { max: 50, color: "#7a2e1a" }, // dark terracotta — availability under 50%
  { max: 70, color: "#a8442c" }, // terracotta
  { max: 85, color: "#c98a4a" }, // amber transition
  { max: 95, color: "#4a7a5a" }, // muted green
  { max: 101, color: "#2d5a4a" }, // forest green — 95-100% available
];

const WATER_BURDEN_RAMP = [
  { max: 2, color: "#2d5a4a" }, // forest green — under 2%, affordable
  { max: 4, color: "#4a7a5a" },
  { max: 8, color: "#c98a4a" },
  { max: 12, color: "#a8442c" },
  { max: 999, color: "#7a2e1a" }, // dark terracotta — over 12%, severe burden
];

const NO_DATA_COLOR = "#3a3530"; // neutral warm-gray, reads as "not sampled yet" not "zero"

function rampColor(value: number | null, ramp: typeof BROADBAND_RAMP): string {
  if (value === null) return NO_DATA_COLOR;
  const stop = ramp.find((s) => value <= s.max);
  return stop?.color ?? ramp[ramp.length - 1].color;
}

type LayerKey = "broadband" | "water";

interface CountyGeoProperties {
  NAME: string; // Census TIGER/Line county name field
}

function FitToMichigan() {
  const map = useMap();
  // Michigan's approximate bounding box — locks the initial view without
  // requiring the GeoJSON to be loaded first to compute bounds.
  useMemo(() => {
    map.fitBounds([
      [41.5, -90.5],
      [48.3, -82.0],
    ]);
  }, [map]);
  return null;
}

export default function UtilityCountyMap() {
  const [activeLayer, setActiveLayer] = useState<LayerKey>("broadband");
  const [hoveredCounty, setHoveredCounty] = useState<CountyMetric | null>(null);
  const { data, isLoading, isError } = useCountyMetrics();

  const metricsByCounty = useMemo(() => {
    const map = new Map<string, CountyMetric>();
    for (const c of data?.counties ?? []) {
      map.set(c.county, c);
    }
    return map;
  }, [data]);

  function styleForFeature(feature?: Feature<Geometry, CountyGeoProperties>): PathOptions {
    const name = feature?.properties?.NAME ?? "";
    const metric = metricsByCounty.get(name);
    const value =
      activeLayer === "broadband"
        ? metric?.broadbandAvailabilityPct ?? null
        : metric?.waterAffordabilityPct ?? null;
    const ramp = activeLayer === "broadband" ? BROADBAND_RAMP : WATER_BURDEN_RAMP;

    return {
      fillColor: rampColor(value, ramp),
      fillOpacity: 0.75,
      color: "#f4ecd8", // liberation-cream, matches card borders elsewhere on the page
      weight: 0.75,
      opacity: 0.3,
    };
  }

  function onEachFeature(feature: Feature<Geometry, CountyGeoProperties>, layer: Layer) {
    const name = feature.properties?.NAME ?? "";
    layer.on({
      mouseover: () => {
        setHoveredCounty(metricsByCounty.get(name) ?? { county: name } as CountyMetric);
        (layer as unknown as { setStyle: (o: PathOptions) => void }).setStyle({
          weight: 2,
          opacity: 0.9,
        });
      },
      mouseout: () => {
        setHoveredCounty(null);
        (layer as unknown as { setStyle: (o: PathOptions) => void }).setStyle({
          weight: 0.75,
          opacity: 0.3,
        });
      },
    });
  }

  return (
    <div className="rounded-xl border border-liberation-gold/20 bg-liberation-cream/5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-liberation-gold/20">
        <div>
          <h3 className="font-semibold text-liberation-cream">Essential Services by County</h3>
          <p className="text-xs text-liberation-cream/50 mt-0.5">
            {data?.coverageNote ?? "Loading coverage details…"}
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={activeLayer}
          onValueChange={(v) => v && setActiveLayer(v as LayerKey)}
          className="bg-liberation-dark/40 rounded-lg p-1"
        >
          <ToggleGroupItem
            value="broadband"
            className="data-[state=on]:bg-liberation-gold data-[state=on]:text-liberation-dark text-liberation-cream/70 gap-1.5"
          >
            <Wifi className="h-3.5 w-3.5" /> Broadband
          </ToggleGroupItem>
          <ToggleGroupItem
            value="water"
            className="data-[state=on]:bg-liberation-gold data-[state=on]:text-liberation-dark text-liberation-cream/70 gap-1.5"
          >
            <Droplets className="h-3.5 w-3.5" /> Water Burden
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading && (
        <div className="h-[420px] flex items-center justify-center text-liberation-cream/40 text-sm">
          Loading county data…
        </div>
      )}

      {isError && (
        <div className="h-[420px] flex items-center justify-center text-liberation-cream/40 text-sm">
          Map data couldn't load. Try refreshing the page.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="relative">
          <MapContainer
            center={[44.5, -85.5]}
            zoom={6}
            scrollWheelZoom={false}
            className="h-[420px] w-full"
            style={{ background: "#1a1512" }} // liberation-dark, avoids a white flash while tiles load
          >
            <FitToMichigan />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
            />
            {/* GeoJSON source: fetched at build/runtime from /data/michigan-counties.geojson —
                see county_map_cartography_plan.md for the Census TIGER/Line download + simplify steps. */}
            <GeoJSON
              key={activeLayer} // forces re-render of styles when the layer toggle changes
              data={michiganCountiesGeoJson}
              style={styleForFeature}
              onEachFeature={onEachFeature}
            />
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 rounded-lg bg-liberation-dark/90 border border-liberation-gold/20 p-3 text-xs">
            <div className="font-semibold text-liberation-cream/80 mb-1.5">
              {activeLayer === "broadband" ? "Broadband availability" : "Water cost burden"}
            </div>
            <div className="flex items-center gap-1">
              {(activeLayer === "broadband" ? BROADBAND_RAMP : WATER_BURDEN_RAMP).map((stop, i) => (
                <div key={i} className="h-3 w-6" style={{ backgroundColor: stop.color }} />
              ))}
            </div>
            <div className="flex justify-between text-liberation-cream/40 mt-1 w-full">
              <span>{activeLayer === "broadband" ? "Low" : "Affordable"}</span>
              <span>{activeLayer === "broadband" ? "High" : "Severe"}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-liberation-cream/10">
              <div className="h-3 w-3" style={{ backgroundColor: NO_DATA_COLOR }} />
              <span className="text-liberation-cream/40">Not yet sampled</span>
            </div>
          </div>

          {/* Detail panel on hover */}
          {hoveredCounty && (
            <div
              className="absolute top-3 right-3 rounded-lg bg-liberation-dark/95 border border-liberation-gold/30 p-4 text-sm max-w-[240px]"
              aria-live="polite"
            >
              <div className="font-semibold text-liberation-cream mb-2">{hoveredCounty.county} County</div>
              {activeLayer === "broadband" ? (
                <div>
                  <div className="text-liberation-cream/60 text-xs">Broadband availability</div>
                  <div className="text-liberation-gold font-bold text-lg">
                    {hoveredCounty.broadbandAvailabilityPct !== null
                      ? `${hoveredCounty.broadbandAvailabilityPct}%`
                      : "Not yet sampled"}
                  </div>
                  {hoveredCounty.broadbandRecordCount > 0 && (
                    <div className="text-liberation-cream/40 text-xs mt-1">
                      Based on {hoveredCounty.broadbandRecordCount} record
                      {hoveredCounty.broadbandRecordCount === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-liberation-cream/60 text-xs">Water affordability ratio</div>
                  <div className="text-liberation-gold font-bold text-lg">
                    {hoveredCounty.waterAffordabilityPct !== null
                      ? `${hoveredCounty.waterAffordabilityPct}%`
                      : "Not yet sampled"}
                  </div>
                  {hoveredCounty.waterRecordCount > 0 && (
                    <div className="text-liberation-cream/40 text-xs mt-1">
                      Based on {hoveredCounty.waterRecordCount} municipalit
                      {hoveredCounty.waterRecordCount === 1 ? "y" : "ies"}
                    </div>
                  )}
                </div>
              )}
              {hoveredCounty.medianIncome !== null && (
                <div className="mt-2 pt-2 border-t border-liberation-cream/10 text-liberation-cream/50 text-xs">
                  Median income: ${hoveredCounty.medianIncome.toLocaleString()}
                </div>
              )}
              {hoveredCounty.blackPopulationPct !== null && (
                <div className="text-liberation-cream/50 text-xs">
                  Black population: {hoveredCounty.blackPopulationPct}%
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
