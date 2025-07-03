
import { MapPin, Factory, Trash2, Zap } from "lucide-react";
import { County, DataOverlay } from "@/pages/Index";
import { getRiskColor } from "@/utils/mapUtils";

interface MapOverlayProps {
  selectedCounty: County | null;
  activeOverlay: DataOverlay;
  hoveredCounty: string | null;
  isDarkMode: boolean;
}

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

export const MapOverlay = ({ selectedCounty, activeOverlay, hoveredCounty, isDarkMode }: MapOverlayProps) => {
  return (
    <>
      {/* Cancer sites detail panel when county is selected */}
      {selectedCounty && selectedCounty.sites.length > 0 && (
        <div className={`absolute top-4 right-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg p-4 max-w-xs z-10`}>
          <h3 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} mb-2`}>
            {selectedCounty.name} - Environmental Sites
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedCounty.sites.map((site) => (
              <div 
                key={site.id}
                className={`flex items-start space-x-2 p-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded`}
              >
                <div className={`p-1 rounded ${getRiskColor(site.riskLevel)}`}>
                  {getSiteIcon(site.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {site.name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
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
        <div className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-slate-800' : 'bg-black bg-opacity-90'} ${isDarkMode ? 'text-slate-100' : 'text-white'} p-3 rounded-lg z-10`}>
          {hoveredCounty}
          <br />
          <span className="text-xs opacity-75">Click to explore</span>
        </div>
      )}

      {/* Legend */}
      {activeOverlay && (
        <div className={`absolute bottom-4 right-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg p-4 z-10`}>
          <h4 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} mb-2 capitalize`}>
            {activeOverlay === "healthcare" ? "Healthcare Access" : activeOverlay} Levels
          </h4>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Low</span>
            <div className={`w-8 h-3 rounded ${
              activeOverlay === "healthcare" ? "bg-gradient-to-r from-red-200 to-green-400" 
              : "bg-gradient-to-r from-red-200 to-red-600"
            }`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>High</span>
          </div>
        </div>
      )}
    </>
  );
};
