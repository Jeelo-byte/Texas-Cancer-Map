import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TexasMapProps {
  activeOverlay: string | null;
  onCountyClick: (countyName: string) => void;
  realCounties: any[];
  darkMode?: boolean;
  legendBottomClass?: string;
  overlays?: { id: string; label: string; description?: string }[];
}

const overlayColors = {
  poverty: "#f87171",
  healthcare: "#34d399",
  pollution: "#60a5fa",
  mortality: "#a78bfa",
  carcinogen: "#fb923c",
  cancer: "#f472b6",
  default: "#60a5fa",
  none: "#d1d5db",
};

// Add diverging color stops
const divergingColors = {
  negative: "#ef4444", // Tailwind red-500
  zero: "#f3f4f6",    // Tailwind gray-100
  positive: "#3b82f6", // Tailwind blue-500
};

// Mapping from overlayKey to county property name
const overlayKeyToCountyProp: Record<string, string> = {
  population: "population",
  incidence_rate: "cancerIncidence",
  mortality_rate: "cancerMortality",
  avg_annual_deaths: "averageAnnualDeaths",
  recent_trend: "recentTrend",
  poverty_rate: "povertyRate",
  healthcare_access: "healthcareAccess",
  pollution_level: "pollutionLevel",
  overlay_field: "overlayField",
};

function InvalidateMapSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

export const TexasMap = ({
  activeOverlay,
  onCountyClick,
  realCounties,
  darkMode,
  legendBottomClass = "bottom-16",
  overlays = [],
}: TexasMapProps) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    fetch("/Texas_County_Boundaries.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  useEffect(() => {
    if (!geoData || !realCounties) return;
    const geoIds = new Set(
      geoData.features.map((f: any) => f.properties.OBJECTID?.toString()),
    );
    const dataIds = new Set(realCounties.map((c: any) => c.id));
    const missingInData = Array.from(geoIds).filter((id) => !dataIds.has(id));
    const missingInGeo = Array.from(dataIds).filter((id) => !geoIds.has(id));
    console.log("OBJECTIDs in GeoJSON but not in data.json:", missingInData);
    console.log("OBJECTIDs in data.json but not in GeoJSON:", missingInGeo);
  }, [geoData, realCounties]);

  // Find the real data for the hovered county by OBJECTID
  const hoveredCountyData = hoveredCountyId
    ? realCounties.find((c) => c.id === hoveredCountyId)
    : null;
  if (hoveredCountyId) {
    console.log(
      "Hovered OBJECTID:",
      hoveredCountyId,
      "Data:",
      hoveredCountyData,
    );
  }

  // --- Dynamic overlay value calculation ---
  // For carcinogen/cancer overlays, cache counts per county
  const countyCarcinogenTypeCounts: Record<string, number> = {};
  const countyCancerTypeCounts: Record<string, number> = {};
  let overlayMin = 0;
  let overlayMax = 100;

  // Determine if overlay is a metric, carcinogen, or cancer
  let overlayType: 'metric' | 'carcinogen' | 'cancer' | 'none' = 'none';
  let overlayKey = '';
  if (activeOverlay) {
    if (activeOverlay.startsWith('carcinogen_')) {
      overlayType = 'carcinogen';
      overlayKey = activeOverlay.replace('carcinogen_', '');
    } else if (activeOverlay.startsWith('cancer_')) {
      overlayType = 'cancer';
      overlayKey = activeOverlay.replace('cancer_', '');
    } else {
      overlayType = 'metric';
      overlayKey = activeOverlay;
    }
  }

  // For carcinogen/cancer overlays, count per county
  if (overlayType === 'carcinogen') {
    for (const county of realCounties) {
      let count = 0;
      // Debug: log sites and carcinogens for this county
      console.log('[DEBUG] Carcinogen overlay', {
        countyId: county.id,
        sites: county.sites,
      });
      for (const site of county.sites || []) {
        if (site.carcinogens) {
          console.log('[DEBUG] Site carcinogens', {
            siteId: site.id,
            carcinogens: site.carcinogens,
          });
          count += site.carcinogens.filter((carc: any) => carc.id === overlayKey).length;
        }
      }
      countyCarcinogenTypeCounts[county.id] = count;
    }
    const values = Object.values(countyCarcinogenTypeCounts).filter((v) => typeof v === 'number' && !isNaN(v) && v > 0);
    overlayMin = values.length ? Math.min(...values) : 0;
    overlayMax = values.length ? Math.max(...values) : 1;
  } else if (overlayType === 'cancer') {
    for (const county of realCounties) {
      let count = 0;
      // Debug: log sites, carcinogens, and linkedCancers for this county
      console.log('[DEBUG] Cancer overlay', {
        countyId: county.id,
        sites: county.sites,
      });
      for (const site of county.sites || []) {
        if (site.carcinogens) {
          for (const carc of site.carcinogens) {
            console.log('[DEBUG] Carcinogen linkedCancers', {
              carcinogenId: carc.id,
              linkedCancers: carc.linkedCancers,
            });
            if (carc.linkedCancers) {
              count += carc.linkedCancers.filter((cancer: any) => cancer.id === overlayKey).length;
            }
          }
        }
      }
      countyCancerTypeCounts[county.id] = count;
    }
    const values = Object.values(countyCancerTypeCounts).filter((v) => typeof v === 'number' && !isNaN(v) && v > 0);
    overlayMin = values.length ? Math.min(...values) : 0;
    overlayMax = values.length ? Math.max(...values) : 1;
  } else if (overlayType === 'metric') {
    // For metrics, get min/max dynamically
    const prop = overlayKeyToCountyProp[overlayKey] || overlayKey;
    const values = realCounties
      .map((c: any) => Number(c[prop]))
      .filter((v: any) => typeof v === 'number' && !isNaN(v) && v !== 0 && v !== null && v !== undefined);
    overlayMin = values.length ? Math.min(...values) : 0;
    overlayMax = values.length ? Math.max(...values) : 1;
  }

  // Helper to interpolate color for diverging scale
  function interpolateDivergingColor(value: number, min: number, max: number) {
    if (value < 0 && min < 0) {
      // Interpolate from red to gray
      const t = (value - min) / (0 - min);
      return interpolateColor(divergingColors.negative, divergingColors.zero, t);
    } else if (value > 0 && max > 0) {
      // Interpolate from gray to blue
      const t = value / max;
      return interpolateColor(divergingColors.zero, divergingColors.positive, t);
    } else {
      // value is exactly zero
      return divergingColors.zero;
    }
  }

  // Helper to interpolate between two colors
  function interpolateColor(colorA: string, colorB: string, t: number) {
    // colorA and colorB are hex, e.g. #f87171
    const rA = parseInt(colorA.slice(1, 3), 16);
    const gA = parseInt(colorA.slice(3, 5), 16);
    const bA = parseInt(colorA.slice(5, 7), 16);
    const rB = parseInt(colorB.slice(1, 3), 16);
    const gB = parseInt(colorB.slice(3, 5), 16);
    const bB = parseInt(colorB.slice(5, 7), 16);
    const R = Math.round(rA + (rB - rA) * t);
    const G = Math.round(gA + (gB - gA) * t);
    const B = Math.round(bA + (bB - bA) * t);
    return `rgb(${R},${G},${B})`;
  }

  // Compute carcinogen/cancer counts for overlays
  const countyCarcinogenCounts: Record<string, number> = {};
  const countyCancerCounts: Record<string, number> = {};
  if (activeOverlay === "carcinogen_count" || activeOverlay === "cancer_count") {
    for (const county of realCounties) {
      // Gather all carcinogen IDs for all sites in this county
      const carcinogenIds = new Set<string>();
      const cancerIds = new Set<string>();
      for (const site of county.sites) {
        // Find carcinogen links for this site
        if (site.carcinogens) {
          site.carcinogens.forEach((carc: any) => carcinogenIds.add(carc.id));
          // For each carcinogen, add all linked cancers
          site.carcinogens.forEach((carc: any) => {
            if (carc.linkedCancers) {
              carc.linkedCancers.forEach((cancer: any) => cancerIds.add(cancer.id));
            }
          });
        }
      }
      countyCarcinogenCounts[county.id] = carcinogenIds.size;
      countyCancerCounts[county.id] = cancerIds.size;
    }
  }

  const onEachFeature = (feature: any, layer: any) => {
    const objectId = feature.properties.OBJECTID?.toString();
    const countyName = feature.properties.CNTY_NM;
    layer.on({
      mouseover: (e: any) => {
        setHoveredCountyId(objectId);
        setTooltipPos({
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
        });
      },
      mouseout: (e: any) => {
        setHoveredCountyId(null);
        setTooltipPos(null);
      },
      click: () => {
        console.log("Clicked OBJECTID:", objectId);
        onCountyClick(objectId);
      },
    });
  };

  const getCountyStyle = (feature: any) => {
    const objectId = feature.properties.OBJECTID?.toString();
    const isHovered =
      hoveredCountyId && objectId && hoveredCountyId === objectId;
    if (isHovered) {
      return {
        fillColor: "#2563eb",
        weight: 3,
        color: "#2563eb",
        fillOpacity: 0.5,
      };
    }
    if (!activeOverlay) {
      return {
        fillColor: darkMode ? "#334155" : "#2563eb",
        weight: 1,
        color: darkMode ? "#64748b" : "#fff",
        fillOpacity: 0.2,
      };
    }
    const county = realCounties.find((c) => c.id === objectId);
    let value: number | null = null;
    if (!county) {
      console.log("[DEBUG] No county found for OBJECTID:", objectId);
      return {
        fillColor: "#6b7280",
        weight: 1,
        color: darkMode ? "#64748b" : "#fff",
        fillOpacity: 0.8,
      };
    }
    if (overlayType === 'carcinogen') {
      value = countyCarcinogenTypeCounts[county.id] ?? 0;
    } else if (overlayType === 'cancer') {
      value = countyCancerTypeCounts[county.id] ?? 0;
    } else if (overlayType === 'metric') {
      const prop = overlayKeyToCountyProp[overlayKey] || overlayKey;
      value = county[prop] ?? null;
    }
    // Debug log for overlay rendering
    console.log('[DEBUG] Overlay:', { overlayType, overlayKey, county, value });
    if (value === null || value === undefined || isNaN(value) || value === 0) {
      return {
        fillColor: "#d1d5db",
        weight: 1,
        color: darkMode ? "#64748b" : "#fff",
        fillOpacity: 0.8,
      };
    }
    let fillColor;
    if (overlayMin < 0 && overlayMax > 0) {
      // Diverging color scale
      fillColor = interpolateDivergingColor(value, overlayMin, overlayMax);
    } else {
      // Normal scale
      let t = 0;
      if (overlayMax > overlayMin) {
        t = (value - overlayMin) / (overlayMax - overlayMin);
      }
      if (activeOverlay === "healthcare") {
        t = 1 - t;
      }
      t = Math.max(0, Math.min(1, t));
      let colorKey: keyof typeof overlayColors;
      if (overlayType === 'metric' && overlayColors.hasOwnProperty(overlayKey)) {
        colorKey = overlayKey as keyof typeof overlayColors;
      } else if (
        overlayType === 'carcinogen' ||
        overlayType === 'cancer' ||
        overlayType === 'none'
      ) {
        colorKey = overlayType;
      } else {
        colorKey = 'default';
      }
      fillColor = interpolateColor(
        "#f3f4f6",
        overlayColors[colorKey] || overlayColors.default,
        t,
      );
    }
    return {
      fillColor,
      weight: 1,
      color: darkMode ? "#64748b" : "#fff",
      fillOpacity: 0.8,
    };
  };

  return (
    <div className="w-full h-full min-h-screen rounded-lg relative bg-background">
      <MapContainer
        center={[31.0, -99.0]}
        zoom={6}
        minZoom={5}
        maxBounds={[
          [25.5, -107.0],
          [36.7, -93.5],
        ]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{
          height: "100%",
          width: "100%",
          background: "var(--background)",
        }}
        className="rounded-lg"
      >
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getCountyStyle}
            onEachFeature={onEachFeature}
            interactive={true}
          />
        )}
      </MapContainer>
      {/* Tooltip */}
      {hoveredCountyId && tooltipPos && (
        <div
          className="pointer-events-none fixed z-[10000] bg-background dark:bg-background border border-border dark:border-border rounded shadow px-3 py-2 text-sm text-foreground dark:text-foreground"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y + 12,
            minWidth: 120,
            maxWidth: 220,
          }}
        >
          <div className="font-semibold">
            {hoveredCountyData ? hoveredCountyData.name + " County" : "County"}
          </div>
          <div>
            Incidence Rate:{" "}
            {hoveredCountyData ? hoveredCountyData.cancerIncidence : "N/A"}
          </div>
          {hoveredCountyData && (
            <>
              <div>
                Avg Annual Deaths:{" "}
                {hoveredCountyData.averageAnnualDeaths ?? "N/A"}
              </div>
              <div>
                Recent Trend: {hoveredCountyData.recentTrend ?? "N/A"}%/yr
              </div>
            </>
          )}
        </div>
      )}
      {/* Legend */}
      <div
        className="absolute z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col gap-2 min-w-[220px] border border-slate-200 dark:border-slate-700"
        style={{ left: 16, bottom: 96 }} // 6rem = 96px
      >
        <div className="font-semibold text-sm mb-1">Legend</div>
        {activeOverlay ? (
          <>
            <div className="flex flex-col gap-1 w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs capitalize break-words whitespace-normal max-w-[120px] cursor-help underline decoration-dashed">
                      {overlays.find((o) => o.id === activeOverlay)?.label || activeOverlay}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {overlays.find((o) => o.id === activeOverlay)?.description || activeOverlay}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center w-full mt-1">
                <span className="text-xs">Low</span>
                <div
                  className="flex-1 h-3 rounded bg-gradient-to-r mx-2"
                  style={{
                    background:
                      overlayMin < 0 && overlayMax > 0
                        ? `linear-gradient(to right, ${divergingColors.negative} 0%, ${divergingColors.zero} ${(0 - overlayMin) / (overlayMax - overlayMin) * 100}%, ${divergingColors.positive} 100%)`
                        : `linear-gradient(to right, #f3f4f6, ${overlayColors[overlayType as keyof typeof overlayColors] || overlayColors.default})`,
                  }}
                />
                <span className="text-xs">High</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Min: {overlayMin}</span>
              <span>Max: {overlayMax}</span>
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">
            No overlay selected
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block w-4 h-4 rounded bg-[#6b7280] border border-slate-400" />
          <span className="text-xs">No Data</span>
        </div>
      </div>
      {/* Texas Cancer Compass branding */}
      <div className="absolute right-4 bottom-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 py-2 flex items-center border border-slate-200 dark:border-slate-700 text-lg font-semibold text-slate-700 dark:text-slate-200 opacity-80">
        Texas Cancer Map
      </div>
    </div>
  );
};
