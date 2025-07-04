
import { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TexasMapProps {
  activeOverlay: string | null;
  onCountyClick: (countyName: string) => void;
  realCounties: any[];
  darkMode?: boolean;
}

const overlayColors = {
  poverty: '#f87171',
  healthcare: '#34d399',
  pollution: '#60a5fa',
  mortality: '#a78bfa',
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

export const TexasMap = ({ activeOverlay, onCountyClick, realCounties, darkMode }: TexasMapProps) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [cancerData, setCancerData] = useState<Record<string, any>>({});
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    fetch('/Texas_County_Boundaries.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  useEffect(() => {
    if (!geoData || !realCounties) return;
    const geoIds = new Set(
      geoData.features.map((f: any) => f.properties.OBJECTID?.toString())
    );
    const dataIds = new Set(realCounties.map((c: any) => c.id));
    const missingInData = Array.from(geoIds).filter((id) => !dataIds.has(id));
    const missingInGeo = Array.from(dataIds).filter((id) => !geoIds.has(id));
    console.log('OBJECTIDs in GeoJSON but not in data.json:', missingInData);
    console.log('OBJECTIDs in data.json but not in GeoJSON:', missingInGeo);
  }, [geoData, realCounties]);

  // Find the real data for the hovered county by OBJECTID
  const hoveredCountyData = hoveredCountyId
    ? realCounties.find((c) => c.id === hoveredCountyId)
    : null;
  if (hoveredCountyId) {
    console.log('Hovered OBJECTID:', hoveredCountyId, 'Data:', hoveredCountyData);
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
        console.log('Clicked OBJECTID:', objectId);
        onCountyClick(objectId);
      },
    });
  };

  const getCountyStyle = (feature: any) => {
    const objectId = feature.properties.OBJECTID?.toString();
    const isHovered = hoveredCountyId && objectId && hoveredCountyId === objectId;
    if (isHovered) {
      return {
        fillColor: '#2563eb',
        weight: 3,
        color: '#2563eb',
        fillOpacity: 0.5,
      };
    }
    if (!activeOverlay) {
      return {
        fillColor: darkMode ? '#334155' : '#2563eb', // slate-700 for dark, blue-600 for light
        weight: 1,
        color: darkMode ? '#64748b' : '#fff', // slate-400 for dark, white for light
        fillOpacity: 0.2,
      };
    }
    // Use overlay color
    return {
      fillColor: overlayColors[activeOverlay as keyof typeof overlayColors] || (darkMode ? '#334155' : '#2563eb'),
      weight: 1,
      color: darkMode ? '#64748b' : '#fff',
      fillOpacity: 0.5,
    };
  };

  return (
    <div className="w-full h-full min-h-screen rounded-lg relative bg-background">
      <MapContainer
        center={[31.0, -99.0]}
        zoom={6}
        minZoom={5}
        maxBounds={[[25.5, -107.0], [36.7, -93.5]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: 'var(--background)' }}
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
          <div className="font-semibold">{hoveredCountyData ? hoveredCountyData.name + ' County' : 'County'}</div>
          <div>Incidence Rate: {hoveredCountyData ? hoveredCountyData.cancerIncidence : 'N/A'}</div>
          {hoveredCountyData && (
            <>
              <div>Avg Annual Deaths: {hoveredCountyData.averageAnnualDeaths ?? 'N/A'}</div>
              <div>Recent Trend: {hoveredCountyData.recentTrend ?? 'N/A'}%/yr</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
