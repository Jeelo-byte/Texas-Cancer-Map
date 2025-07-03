
import { useState } from "react";
import { TexasMap } from "@/components/TexasMap";
import { CountyDetailPanel } from "@/components/CountyDetailPanel";
import { DataOverlayToggle } from "@/components/DataOverlayToggle";
import { Header } from "@/components/Header";

export interface County {
  id: string;
  name: string;
  population: number;
  cancerIncidence: number;
  cancerMortality: number;
  povertyRate: number;
  healthcareAccess: number;
  pollutionLevel: number;
  deathRate: number;
  coordinates: [number, number];
  sites: CancerSite[];
}

export interface CancerSite {
  id: string;
  name: string;
  type: "power_plant" | "landfill" | "chemical_plant" | "mining" | "industrial";
  coordinates: [number, number];
  description: string;
  riskLevel: "low" | "medium" | "high";
}

export type DataOverlay = "poverty" | "healthcare" | "pollution" | "mortality" | null;

const Index = () => {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<DataOverlay>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleCountyClick = (county: County) => {
    setSelectedCounty(county);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCounty(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="relative h-[calc(100vh-4rem)]">
        <div className="absolute top-4 left-4 z-20">
          <DataOverlayToggle 
            activeOverlay={activeOverlay}
            onOverlayChange={setActiveOverlay}
          />
        </div>

        <TexasMap
          onCountyClick={handleCountyClick}
          selectedCounty={selectedCounty}
          activeOverlay={activeOverlay}
        />

        <CountyDetailPanel
          county={selectedCounty}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
};

export default Index;
