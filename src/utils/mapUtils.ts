
import { County, DataOverlay } from "@/pages/Index";
import { mockCounties } from "@/data/mockData";

export const getCountyData = (countyName: string): County | null => {
  if (!countyName) {
    console.warn('County name is undefined or empty');
    return null;
  }
  
  return mockCounties.find(county => 
    county.name.toLowerCase().includes(countyName.toLowerCase()) ||
    countyName.toLowerCase().includes(county.name.toLowerCase().replace(" county", ""))
  ) || null;
};

export const getOverlayColor = (county: County | null, overlay: DataOverlay, isDarkMode: boolean): string => {
  if (!overlay || !county) {
    return isDarkMode 
      ? "fill-slate-700 hover:fill-slate-600" 
      : "fill-slate-200 hover:fill-slate-300";
  }
  
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

export const getRiskColor = (riskLevel: string): string => {
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
