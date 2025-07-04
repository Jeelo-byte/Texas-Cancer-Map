
import { useState, useEffect } from "react";
import { TexasMap } from "@/components/TexasMap";
import { CountyDetailPanel } from "@/components/CountyDetailPanel";
import { DataOverlayToggle } from "@/components/DataOverlayToggle";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export interface County {
  id: string; // OBJECTID as string
  name: string;
  population: number;
  cancerIncidence: number;
  cancerMortality: number;
  povertyRate: number;
  healthcareAccess: number;
  pollutionLevel: number;
  deathRate: number;
  averageAnnualDeaths: number;
  recentTrend: number;
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
  const [selectedCountyId, setSelectedCountyId] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<DataOverlay>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [realCounties, setRealCounties] = useState<County[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Load all county data from data.json
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => {
        // Map to County[] using all available stats
        const counties: County[] = data.map((row: any) => ({
          id: row.OBJECTID?.toString() ?? row.id?.toString() ?? '',
          name: row.CNTY_NM || row.name || '',
          population: row.population || 0,
          cancerIncidence: row.AgeAdjustedDeathRate || row.cancerIncidence || 0,
          cancerMortality: row.cancerMortality || 0,
          povertyRate: row.povertyRate || 0,
          healthcareAccess: row.healthcareAccess || 0,
          pollutionLevel: row.pollutionLevel || 0,
          deathRate: row.deathRate || 0,
          averageAnnualDeaths: row.AverageAnnualDeaths || 0,
          recentTrend: row.RecentTrend_PercentPerYear || 0,
          coordinates: row.coordinates || [0, 0],
          sites: row.sites || [],
        }));
        setRealCounties(counties);
      });
  }, []);

  const handleCountyClick = (countyId: string) => {
    setSelectedCountyId(countyId);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCountyId(null);
  };

  // Debug log for matching
  console.log('Selected:', selectedCountyId, 'Available:', realCounties.map(c => c.id));

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <Button
        className="absolute top-4 right-4 z-30 border border-slate-300 dark:border-slate-700 shadow bg-background text-foreground hover:bg-secondary transition"
        size="icon"
        variant="ghost"
        onClick={() => setDarkMode((d) => !d)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </Button>
      
      <div className="relative flex-1 h-full">
        <div className="absolute top-4 left-4 z-20">
          <DataOverlayToggle 
            activeOverlay={activeOverlay}
            onOverlayChange={setActiveOverlay}
          />
        </div>

        <TexasMap
          activeOverlay={activeOverlay}
          onCountyClick={handleCountyClick}
          realCounties={realCounties}
          darkMode={darkMode}
        />

        <CountyDetailPanel
          county={
            selectedCountyId
              ? realCounties.find((c) => c.id === selectedCountyId) || null
              : null
          }
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
};

export default Index;
