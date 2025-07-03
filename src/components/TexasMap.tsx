
import { useState, useEffect } from "react";
import { MapPin, Factory, Trash2, Zap } from "lucide-react";
import { County, DataOverlay } from "@/pages/Index";
import { mockCounties } from "@/data/mockData";

interface TexasMapProps {
  onCountyClick: (county: County) => void;
  selectedCounty: County | null;
  activeOverlay: DataOverlay;
}

export const TexasMap = ({ onCountyClick, selectedCounty, activeOverlay }: TexasMapProps) => {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  const getOverlayColor = (county: County, overlay: DataOverlay) => {
    if (!overlay) return "fill-slate-200 hover:fill-slate-300";
    
    let intensity = 0;
    switch (overlay) {
      case "poverty":
        intensity = county.povertyRate / 30; // Normalize to 0-1
        break;
      case "healthcare":
        intensity = (100 - county.healthcareAccess) / 100; // Invert for better visualization
        break;
      case "pollution":
        intensity = county.pollutionLevel / 100;
        break;
      case "mortality":
        intensity = county.cancerMortality / 200;
        break;
    }
    
    const opacity = Math.min(intensity, 1);
    if (overlay === "healthcare") {
      return `fill-green-400 hover:fill-green-500 fill-opacity-${Math.round(opacity * 80)}`;
    } else {
      return `fill-red-400 hover:fill-red-500 fill-opacity-${Math.round(opacity * 80)}`;
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

  // Convert real coordinates to SVG coordinates (simplified projection)
  const coordsToSVG = (lat: number, lng: number) => {
    // Texas bounds: roughly 25.8°N to 36.5°N, -106.6°W to -93.5°W
    const minLat = 25.8, maxLat = 36.5;
    const minLng = -106.6, maxLng = -93.5;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 600 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 400 + 50;
    
    return { x, y };
  };

  return (
    <div className="w-full h-full relative bg-blue-50">
      <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-full h-full relative">
          {/* SVG Texas Map */}
          <svg viewBox="0 0 700 500" className="w-full h-full">
            {/* Simplified Texas outline */}
            <path
              d="M 100 300 L 120 280 L 140 250 L 180 220 L 220 200 L 280 180 L 350 170 L 420 175 L 480 180 L 520 190 L 550 210 L 580 240 L 600 280 L 590 320 L 570 360 L 540 390 L 500 410 L 450 420 L 400 425 L 350 430 L 300 435 L 250 440 L 200 430 L 150 420 L 120 400 L 100 380 L 90 350 L 95 320 Z"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            
            {/* Counties as circles positioned on the map */}
            {mockCounties.map((county) => {
              const svgCoords = coordsToSVG(county.coordinates[1], county.coordinates[0]);
              const isSelected = selectedCounty?.id === county.id;
              const isHovered = hoveredCounty === county.id;
              
              return (
                <g key={county.id}>
                  {/* County circle */}
                  <circle
                    cx={svgCoords.x}
                    cy={svgCoords.y}
                    r={isSelected ? "16" : isHovered ? "14" : "12"}
                    className={`
                      cursor-pointer transition-all duration-300 stroke-2
                      ${isSelected ? "stroke-blue-500" : "stroke-slate-400"}
                      ${getOverlayColor(county, activeOverlay)}
                    `}
                    onClick={() => onCountyClick(county)}
                    onMouseEnter={() => setHoveredCounty(county.id)}
                    onMouseLeave={() => setHoveredCounty(null)}
                  />
                  
                  {/* County name label */}
                  <text
                    x={svgCoords.x}
                    y={svgCoords.y + 25}
                    textAnchor="middle"
                    className="text-xs font-medium fill-slate-700 pointer-events-none"
                  >
                    {county.name.replace(" County", "")}
                  </text>
                  
                  {/* Cancer sites indicators */}
                  {county.sites.map((site, index) => (
                    <g key={site.id}>
                      <circle
                        cx={svgCoords.x + (index * 8) - 8}
                        cy={svgCoords.y - 18}
                        r="4"
                        className={`
                          ${site.riskLevel === "high" ? "fill-red-500" :
                            site.riskLevel === "medium" ? "fill-yellow-500" :
                            "fill-green-500"}
                        `}
                      />
                    </g>
                  ))}
                  
                  {/* Site count badge */}
                  {county.sites.length > 0 && (
                    <circle
                      cx={svgCoords.x + 12}
                      cy={svgCoords.y - 12}
                      r="8"
                      className="fill-red-500"
                    />
                  )}
                  {county.sites.length > 0 && (
                    <text
                      x={svgCoords.x + 12}
                      y={svgCoords.y - 8}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white pointer-events-none"
                    >
                      {county.sites.length}
                    </text>
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
              {mockCounties.find(c => c.id === hoveredCounty)?.name}
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
