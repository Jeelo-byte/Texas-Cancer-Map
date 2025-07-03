
import { useState } from "react";
import { County, DataOverlay } from "@/pages/Index";
import { useGeoData } from "@/hooks/useGeoData";
import { renderCountyPath, getCountyCentroid } from "@/utils/geoUtils";
import { getCountyData, getOverlayColor } from "@/utils/mapUtils";
import { MapOverlay } from "@/components/MapOverlay";

interface TexasMapProps {
  onCountyClick: (county: County) => void;
  selectedCounty: County | null;
  activeOverlay: DataOverlay;
}

export const TexasMap = ({ onCountyClick, selectedCounty, activeOverlay }: TexasMapProps) => {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { geoData, viewBox } = useGeoData();

  if (!geoData) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
        <div className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading Texas counties map...</div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>
      {/* Dark mode toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 z-30 p-2 rounded-lg ${
          isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
        } shadow-lg hover:shadow-xl transition-all`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className={`absolute inset-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
        <div className="w-full h-full relative">
          <svg viewBox={viewBox} className="w-full h-full">
            {geoData.features.map((feature) => {
              const countyName = feature.properties?.NAME;
              if (!countyName) return null;
              
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
                      ${isSelected ? "stroke-blue-500" : isDarkMode ? "stroke-slate-500" : "stroke-slate-400"}
                      ${isHovered ? (isDarkMode ? "stroke-slate-300" : "stroke-slate-600") : ""}
                      ${getOverlayColor(countyData, activeOverlay, isDarkMode)}
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

          <MapOverlay
            selectedCounty={selectedCounty}
            activeOverlay={activeOverlay}
            hoveredCounty={hoveredCounty}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};
