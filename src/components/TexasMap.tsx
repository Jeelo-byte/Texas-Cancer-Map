
import { useState, useEffect } from "react";
import { MapPin, Factory, Trash2, Zap } from "lucide-react";
import { County, DataOverlay } from "@/pages/Index";
import { mockCounties } from "@/data/mockData";

interface TexasMapProps {
  onCountyClick: (county: County) => void;
  selectedCounty: County | null;
  activeOverlay: DataOverlay;
}

interface GeoJSONFeature {
  type: string;
  properties: {
    NAME: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export const TexasMap = ({ onCountyClick, selectedCounty, activeOverlay }: TexasMapProps) => {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [viewBox, setViewBox] = useState<string>("0 0 1000 800");

  useEffect(() => {
    // Load the GeoJSON data
    fetch('/src/data/Texas_County_Boundaries.geojson')
      .then(response => response.json())
      .then((data: GeoJSONData) => {
        setGeoData(data);
        
        // Calculate bounding box for the map
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        data.features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            const coords = feature.geometry.coordinates as number[][][];
            coords[0].forEach((coord: number[]) => {
              const [lng, lat] = coord;
              minX = Math.min(minX, lng);
              maxX = Math.max(maxX, lng);
              minY = Math.min(minY, lat);
              maxY = Math.max(maxY, lat);
            });
          } else if (feature.geometry.type === 'MultiPolygon') {
            const coords = feature.geometry.coordinates as number[][][][];
            coords.forEach(polygon => {
              polygon[0].forEach((coord: number[]) => {
                const [lng, lat] = coord;
                minX = Math.min(minX, lng);
                maxX = Math.max(maxX, lng);
                minY = Math.min(minY, lat);
                maxY = Math.max(maxY, lat);
              });
            });
          }
        });
        
        // Convert to SVG coordinates (flip Y axis for SVG)
        const width = maxX - minX;
        const height = maxY - minY;
        const padding = width * 0.05; // 5% padding
        
        setViewBox(`${minX - padding} ${-maxY - padding} ${width + 2 * padding} ${height + 2 * padding}`);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  const getCountyData = (countyName: string): County | null => {
    return mockCounties.find(county => 
      county.name.toLowerCase().includes(countyName.toLowerCase()) ||
      countyName.toLowerCase().includes(county.name.toLowerCase().replace(" county", ""))
    ) || null;
  };

  const getOverlayColor = (county: County | null, overlay: DataOverlay) => {
    if (!overlay || !county) return "fill-slate-200 hover:fill-slate-300";
    
    let intensity = 0;
    switch (overlay) {
      case "poverty":
        intensity = county.povertyRate / 30;
        break;
      case "healthcare":
        intensity = (100 - county.healthcareAccess) / 100;
        break;
      case "pollution":
        intensity = county.pollutionLevel / 100;
        break;
      case "mortality":
        intensity = county.cancerMortality / 200;
        break;
    }
    
    const opacity = Math.min(Math.max(intensity, 0.1), 0.8);
    if (overlay === "healthcare") {
      return `fill-green-400 hover:fill-green-500 fill-opacity-${Math.round(opacity * 100)}`;
    } else {
      return `fill-red-400 hover:fill-red-500 fill-opacity-${Math.round(opacity * 100)}`;
    }
  };

  const getSiteIcon = (type: string) => {
    switch (type) {
      case "power_plant":
        return <Zap className="w-3 h-3" />;
      case "landfill":
        return <Trash2 className="w-3 h-3" />;
      case "chemical_plant":
      case "industrial":
        return <Factory className="w-3 h-3" />;
      default:
        return <MapPin className="w-3 h-3" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderCountyPath = (feature: GeoJSONFeature) => {
    if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) {
      return null;
    }

    let pathData = '';
    
    if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates as number[][][];
      pathData = coordsToPath(coords[0]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      const coords = feature.geometry.coordinates as number[][][][];
      pathData = coords
        .map(polygon => coordsToPath(polygon[0]))
        .join(' ');
    }

    return pathData;
  };

  const coordsToPath = (coordinates: number[][]) => {
    return coordinates
      .map((coord, index) => {
        const [lng, lat] = coord;
        // Flip Y coordinate for SVG (SVG Y axis is inverted)
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${lng} ${-lat}`;
      })
      .join(' ') + ' Z';
  };

  const getCountyCentroid = (feature: GeoJSONFeature): [number, number] => {
    if (!feature.geometry) return [0, 0];
    
    let coords: number[][];
    if (feature.geometry.type === 'Polygon') {
      const polygonCoords = feature.geometry.coordinates as number[][][];
      coords = polygonCoords[0];
    } else if (feature.geometry.type === 'MultiPolygon') {
      const multiPolygonCoords = feature.geometry.coordinates as number[][][][];
      coords = multiPolygonCoords[0][0];
    } else {
      return [0, 0];
    }
    
    const sumX = coords.reduce((sum, coord) => sum + coord[0], 0);
    const sumY = coords.reduce((sum, coord) => sum + coord[1], 0);
    
    return [sumX / coords.length, -sumY / coords.length]; // Flip Y for SVG
  };

  if (!geoData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-slate-600">Loading Texas counties map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-blue-50">
      <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-full h-full relative">
          <svg viewBox={viewBox} className="w-full h-full">
            {geoData.features.map((feature) => {
              const countyName = feature.properties.NAME;
              const countyData = getCountyData(countyName);
              const isSelected = selectedCounty?.name.includes(countyName) || countyName.includes(selectedCounty?.name.replace(" County", "") || "");
              const isHovered = hoveredCounty === countyName;
              const pathData = renderCountyPath(feature);
              
              if (!pathData) return null;

              return (
                <g key={countyName}>
                  {/* County polygon */}
                  <path
                    d={pathData}
                    className={`
                      cursor-pointer transition-all duration-300 stroke-2
                      ${isSelected ? "stroke-blue-500" : "stroke-slate-400"}
                      ${isHovered ? "stroke-slate-600" : ""}
                      ${getOverlayColor(countyData, activeOverlay)}
                    `}
                    onClick={() => countyData && onCountyClick(countyData)}
                    onMouseEnter={() => setHoveredCounty(countyName)}
                    onMouseLeave={() => setHoveredCounty(null)}
                  />
                  
                  {/* County sites and indicators */}
                  {countyData && (
                    <>
                      {/* Cancer sites count badge */}
                      {countyData.sites.length > 0 && (
                        <>
                          <circle
                            cx={getCountyCentroid(feature)[0]}
                            cy={getCountyCentroid(feature)[1]}
                            r="12"
                            className="fill-red-500 opacity-90"
                          />
                          <text
                            x={getCountyCentroid(feature)[0]}
                            y={getCountyCentroid(feature)[1] + 4}
                            textAnchor="middle"
                            className="text-xs font-bold fill-white pointer-events-none"
                          >
                            {countyData.sites.length}
                          </text>
                        </>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Cancer sites detail panel when county is selected */}
          {selectedCounty && selectedCounty.sites.length > 0 && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
              <h3 className="font-semibold text-slate-900 mb-2">
                {selectedCounty.name} - Environmental Sites
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCounty.sites.map((site) => (
                  <div 
                    key={site.id}
                    className="flex items-start space-x-2 p-2 bg-slate-50 rounded"
                  >
                    <div className={`p-1 rounded ${getRiskColor(site.riskLevel)}`}>
                      {getSiteIcon(site.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {site.name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {site.description}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getRiskColor(site.riskLevel)}`}>
                        {site.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hover tooltip */}
          {hoveredCounty && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg z-10">
              {hoveredCounty}
              <br />
              <span className="text-xs opacity-75">Click to explore</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {activeOverlay && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h4 className="font-semibold text-slate-900 mb-2 capitalize">
            {activeOverlay === "healthcare" ? "Healthcare Access" : activeOverlay} Levels
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600">Low</span>
            <div className={`w-8 h-3 rounded ${
              activeOverlay === "healthcare" ? "bg-gradient-to-r from-red-200 to-green-400" 
              : "bg-gradient-to-r from-red-200 to-red-600"
            }`}></div>
            <span className="text-xs text-slate-600">High</span>
          </div>
        </div>
      )}
    </div>
  );
};
