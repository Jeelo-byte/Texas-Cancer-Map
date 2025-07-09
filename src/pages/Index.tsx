
import { useState, useEffect } from "react";
import { TexasMap } from "@/components/TexasMap";
import { CountyDetailPanel } from "@/components/CountyDetailPanel";
import { DataOverlayToggle } from "@/components/DataOverlayToggle";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export interface County {
  id: string; // OBJECTID as string (for map matching)
  uuid: string; // Supabase UUID
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
    // Fetch counties and their environmental sites from Supabase
    const fetchData = async () => {
      // Fetch all counties
      const { data: countiesData, error: countiesError } = await supabase
        .from("counties")
        .select("*");
      if (countiesError) {
        console.error("Error fetching counties:", countiesError);
        return;
      }
      // Fetch all environmental sites
      const { data: sitesData, error: sitesError } = await supabase
        .from("environmental_sites")
        .select("*");
      if (sitesError) {
        console.error("Error fetching environmental sites:", sitesError);
        return;
      }
      // Map sites to counties
      const counties: County[] = (countiesData || []).map((county: any) => {
        const countySites = (sitesData || []).filter((site: any) => site.county_id === county.id);
        return {
          id: county.objectid?.toString() ?? county.id, // Use objectid for map matching
          uuid: county.id, // Store Supabase UUID
          name: county.name,
          population: county.population ?? 0,
          cancerIncidence: county.incidence_rate ?? 0,
          cancerMortality: county.mortality_rate ?? 0,
          povertyRate: county.poverty_rate ?? 0,
          healthcareAccess: county.healthcare_access ?? 0,
          pollutionLevel: county.pollution_level ?? 0,
          deathRate: county.mortality_rate ?? 0,
          averageAnnualDeaths: county.avg_annual_deaths ?? 0,
          recentTrend: county.recent_trend ?? 0,
          coordinates: [0, 0],
          sites: countySites.map((site: any) => ({
            id: site.id,
            name: site.site_name || site.name || "",
            type: site.type || "industrial",
            coordinates: [site.longitude ?? 0, site.latitude ?? 0],
            description: site.city || "",
            riskLevel: site.risk_level || "medium",
          })),
        };
      });
      setRealCounties(counties);
    };
    fetchData();
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
        <div
          style={{
            zIndex: 2000,
          }}
          className="absolute top-4 left-4"
        >
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
