import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TexasMapProps {
  activeOverlay: string | null;
  onCountyClick: (countyName: string) => void;
  realCounties: any[];
  darkMode?: boolean;
}

const overlayColors = {
  poverty: "#f87171",
  healthcare: "#34d399",
  pollution: "#60a5fa",
  mortality: "#a78bfa",
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

  // Helper to get min/max for overlays
  const overlayStats = {
    poverty: { min: 0, max: 100 },
    healthcare: { min: 0, max: 100 },
    pollution: { min: 0, max: 100 },
    mortality: { min: 0, max: 100 },
  };
  if (realCounties.length > 0) {
    overlayStats.poverty = {
      min: Math.min(...realCounties.map((c) => c.povertyRate)),
      max: Math.max(...realCounties.map((c) => c.povertyRate)),
    };
    overlayStats.healthcare = {
      min: Math.min(...realCounties.map((c) => c.healthcareAccess)),
      max: Math.max(...realCounties.map((c) => c.healthcareAccess)),
    };
    overlayStats.pollution = {
      min: Math.min(...realCounties.map((c) => c.pollutionLevel)),
      max: Math.max(...realCounties.map((c) => c.pollutionLevel)),
    };
    overlayStats.mortality = {
      min: Math.min(...realCounties.map((c) => c.cancerMortality)),
      max: Math.max(...realCounties.map((c) => c.cancerMortality)),
    };
  }

  // Helper to interpolate color (simple linear blend white -> overlay color)
  function interpolateColor(color: string, t: number) {
    // color is hex, e.g. #f87171
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    // Blend with white
    const R = Math.round(255 + (r - 255) * t);
    const G = Math.round(255 + (g - 255) * t);
    const B = Math.round(255 + (b - 255) * t);
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
    // Use overlay value from Supabase data
    const county = realCounties.find((c) => c.id === objectId);
    let value: number | null = null;
    let min = 0;
    let max = 100;
    if (activeOverlay === "poverty") {
      value = county?.povertyRate ?? null;
      min = overlayStats.poverty.min;
      max = overlayStats.poverty.max;
    } else if (activeOverlay === "healthcare") {
      value = county?.healthcareAccess ?? null;
      min = overlayStats.healthcare.min;
      max = overlayStats.healthcare.max;
    } else if (activeOverlay === "pollution") {
      value = county?.pollutionLevel ?? null;
      min = overlayStats.pollution.min;
      max = overlayStats.pollution.max;
    } else if (activeOverlay === "mortality") {
      value = county?.cancerMortality ?? null;
      min = overlayStats.mortality.min;
      max = overlayStats.mortality.max;
    } else if (activeOverlay === "carcinogen_count") {
      value = countyCarcinogenCounts[county?.id ?? ""] ?? 0;
      min = Math.min(...Object.values(countyCarcinogenCounts));
      max = Math.max(...Object.values(countyCarcinogenCounts));
    } else if (activeOverlay === "cancer_count") {
      value = countyCancerCounts[county?.id ?? ""] ?? 0;
      min = Math.min(...Object.values(countyCancerCounts));
      max = Math.max(...Object.values(countyCancerCounts));
    }
    // If county is missing from data, use dark gray
    if (!county) {
      return {
        fillColor: "#6b7280", // Tailwind gray-500, for missing data
        weight: 1,
        color: darkMode ? "#64748b" : "#fff",
        fillOpacity: 0.8,
      };
    }
    // If value is null/undefined/NaN/0, use light gray
    if (value === null || value === undefined || isNaN(value) || value === 0) {
      return {
        fillColor: "#d1d5db", // Tailwind gray-300, for null or zero overlay value
        weight: 1,
        color: darkMode ? "#64748b" : "#fff",
        fillOpacity: 0.8,
      };
    }
    // Normalize value to [0,1]
    let t = 0;
    if (max > min) {
      t = (value - min) / (max - min);
    }
    // For healthcare, invert the scale (higher is better)
    if (activeOverlay === "healthcare") {
      t = 1 - t;
    }
    // Clamp t
    t = Math.max(0, Math.min(1, t));
    const fillColor = interpolateColor(
      overlayColors[activeOverlay as keyof typeof overlayColors],
      t,
    );
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
      <div className="absolute left-4 bottom-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col gap-2 min-w-[180px] border border-slate-200 dark:border-slate-700">
        <div className="font-semibold text-sm mb-1">Legend</div>
        {activeOverlay ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs capitalize w-16">{activeOverlay}</span>
              <div
                className="flex-1 h-3 rounded bg-gradient-to-r"
                style={{
                  background: `linear-gradient(to right, #fff, ${overlayColors[activeOverlay as keyof typeof overlayColors]})`,
                }}
              />
              <span className="text-xs ml-2">Low</span>
              <span className="text-xs ml-2">High</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Min: {overlayStats[activeOverlay].min}</span>
              <span>Max: {overlayStats[activeOverlay].max}</span>
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
    </div>
  );
};
