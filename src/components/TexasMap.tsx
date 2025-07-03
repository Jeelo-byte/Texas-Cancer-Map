
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
        intensity = county.cancerMortality / 50;
        break;
    }
    
    const opacity = Math.min(intensity, 1);
    if (overlay === "healthcare") {
      return `fill-green-400 hover:fill-green-500`;
    } else {
      return `fill-red-400 hover:fill-red-500`;
    }
  };

  const getSiteIcon = (type: string) => {
    switch (type) {
      case "power_plant":
        return <Zap className="w-4 h-4" />;
      case "landfill":
        return <Trash2 className="w-4 h-4" />;
      case "chemical_plant":
      case "industrial":
        return <Factory className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
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

  return (
    <div className="w-full h-full relative bg-blue-50">
      {/* Simplified Texas outline with county representations */}
      <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-full h-full relative">
          {/* Grid-based county representation */}
          <div className="grid grid-cols-8 gap-1 p-4 h-full">
            {mockCounties.map((county) => (
              <div
                key={county.id}
                className={`
                  relative rounded cursor-pointer transition-all duration-300 border-2
                  ${selectedCounty?.id === county.id 
                    ? "border-blue-500 scale-105 z-10" 
                    : "border-transparent"
                  }
                  ${getOverlayColor(county, activeOverlay)}
                  ${hoveredCounty === county.id ? "scale-105 z-10" : ""}
                `}
                onClick={() => onCountyClick(county)}
                onMouseEnter={() => setHoveredCounty(county.id)}
                onMouseLeave={() => setHoveredCounty(null)}
                title={county.name}
              >
                {/* County name label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-700 text-center px-1">
                    {county.name.replace(" County", "")}
                  </span>
                </div>

                {/* Cancer sites indicators */}
                {county.sites.length > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {county.sites.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cancer sites overlay when county is selected */}
          {selectedCounty && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
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
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg">
              {mockCounties.find(c => c.id === hoveredCounty)?.name}
              <br />
              <span className="text-xs opacity-75">Click to explore</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {activeOverlay && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
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
