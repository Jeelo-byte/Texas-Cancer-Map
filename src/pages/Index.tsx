import { useState, useEffect } from "react";
import { TexasMap } from "@/components/TexasMap";
import { CountyDetailPanel } from "@/components/CountyDetailPanel";
import { DataOverlayToggle } from "@/components/DataOverlayToggle";
import { Toggle } from "@/components/ui/toggle";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sun, Moon, DollarSign, Heart, Droplets, Skull, Biohazard, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Carcinogen, Cancer, CarcinogenCancerLink, EnvironmentalSiteCarcinogen } from "@/types/carcinogen";

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

// Update DataOverlay type to allow dynamic string IDs
export type DataOverlay = string | null;

const metricOverlayMeta: Record<string, { label: string; icon: React.ElementType; color: string; description: string }> = {
  population: {
    label: "Population",
    icon: DollarSign,
    color: "text-yellow-600",
    description: "Population of each county",
  },
  incidence_rate: {
    label: "Incidence Rate",
    icon: Skull, // Changed from Virus to Skull
    color: "text-blue-600",
    description: "Cancer incidence rate per county",
  },
  mortality_rate: {
    label: "Mortality Rate",
    icon: Skull,
    color: "text-purple-600",
    description: "Cancer mortality rate per county",
  },
  avg_annual_deaths: {
    label: "Avg Annual Deaths",
    icon: Skull,
    color: "text-gray-600",
    description: "Average annual deaths per county",
  },
  recent_trend: {
    label: "Recent Trend",
    icon: Droplets,
    color: "text-cyan-600",
    description: "Recent trend in cancer rates",
  },
  poverty_rate: {
    label: "Poverty Rate",
    icon: DollarSign,
    color: "text-red-600",
    description: "Poverty rates across counties",
  },
  healthcare_access: {
    label: "Healthcare Access",
    icon: Heart,
    color: "text-green-600",
    description: "Access to healthcare services",
  },
  pollution_level: {
    label: "Pollution Level",
    icon: Droplets,
    color: "text-blue-600",
    description: "Environmental pollution levels",
  },
  overlay_field: {
    label: "Overlay Field",
    icon: Biohazard,
    color: "text-orange-600",
    description: "Custom overlay field",
  },
};

const Index = () => {
  const [selectedCountyId, setSelectedCountyId] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<DataOverlay>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [realCounties, setRealCounties] = useState<County[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  // Carcinogen & Cancer state
  const [carcinogens, setCarcinogens] = useState<Carcinogen[]>([]);
  const [cancers, setCancers] = useState<Cancer[]>([]);
  const [carcinogenCancerLinks, setCarcinogenCancerLinks] = useState<CarcinogenCancerLink[]>([]);
  const [siteCarcinogens, setSiteCarcinogens] = useState<EnvironmentalSiteCarcinogen[]>([]);
  const [showEnvSites, setShowEnvSites] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
      // Fetch all carcinogen/cancer/site links
      const { data: carcinogensData } = await supabase.from("carcinogens").select("*");
      const { data: cancersData } = await supabase.from("cancers").select("*");
      const { data: carcinogenCancerLinksData } = await supabase.from("carcinogen_cancer_link").select("*");
      const { data: siteCarcinogensData } = await supabase.from("environmental_site_carcinogen").select("*");

      // Build lookup maps
      const carcinogenMap = Object.fromEntries((carcinogensData || []).map((c: any) => [c.id, c]));
      const cancerMap = Object.fromEntries((cancersData || []).map((c: any) => [c.id, c]));
      // For each carcinogen, find its linked cancers
      const carcinogenToCancers: Record<string, any[]> = {};
      (carcinogenCancerLinksData || []).forEach((link: any) => {
        if (!carcinogenToCancers[link.carcinogen_id]) carcinogenToCancers[link.carcinogen_id] = [];
        if (cancerMap[link.cancer_id]) carcinogenToCancers[link.carcinogen_id].push(cancerMap[link.cancer_id]);
      });
      // For each site, find its carcinogens (with linked cancers)
      const siteToCarcinogens: Record<string, any[]> = {};
      (siteCarcinogensData || []).forEach((sc: any) => {
        if (!siteToCarcinogens[sc.site_id]) siteToCarcinogens[sc.site_id] = [];
        if (carcinogenMap[sc.carcinogen_id]) {
          const carcinogen = { ...carcinogenMap[sc.carcinogen_id] };
          carcinogen.linkedCancers = carcinogenToCancers[carcinogen.id] || [];
          siteToCarcinogens[sc.site_id].push(carcinogen);
        }
      });

      // Map sites to counties, now with carcinogens and linked cancers
      const counties: County[] = (countiesData || []).map((county: any) => {
        const countySites = (sitesData || []).filter(
          (site: any) => site.county_id === county.id,
        );
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
            carcinogens: siteToCarcinogens[site.id] || [],
          })),
        };
      });
      setRealCounties(counties);
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Fetch carcinogen/cancer data
    supabase.from("carcinogens").select("*").then(({ data, error }) => {
      if (!error && data) setCarcinogens(data);
    });
    supabase.from("cancers").select("*").then(({ data, error }) => {
      if (!error && data) setCancers(data);
    });
    supabase.from("carcinogen_cancer_link").select("*").then(({ data, error }) => {
      if (!error && data) setCarcinogenCancerLinks(data);
    });
    supabase.from("environmental_site_carcinogen").select("*").then(({ data, error }) => {
      if (!error && data) setSiteCarcinogens(data);
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
  console.log(
    "Selected:",
    selectedCountyId,
    "Available:",
    realCounties.map((c) => c.id),
  );

  // Calculate max values for progress bars
  const maxCancerIncidence = realCounties.length > 0 ? Math.max(...realCounties.map(c => c.cancerIncidence)) : 1;
  const maxCancerMortality = realCounties.length > 0 ? Math.max(...realCounties.map(c => c.cancerMortality)) : 1;
  const maxPovertyRate = realCounties.length > 0 ? Math.max(...realCounties.map(c => c.povertyRate)) : 1;
  const maxHealthcareAccess = realCounties.length > 0 ? Math.max(...realCounties.map(c => c.healthcareAccess)) : 1;
  const maxPollutionLevel = realCounties.length > 0 ? Math.max(...realCounties.map(c => c.pollutionLevel)) : 1;

  // Build overlays array dynamically
  const metricKeys = Object.keys(metricOverlayMeta).filter((key) => key !== "overlay_field");
  const metricOverlays = metricKeys.map((key) => ({
    id: key,
    label: metricOverlayMeta[key].label,
    icon: metricOverlayMeta[key].icon,
    color: metricOverlayMeta[key].color,
    description: metricOverlayMeta[key].description,
  }));

  const carcinogenOverlays = carcinogens.map((carc) => ({
    id: `carcinogen_${carc.id}`,
    label: carc.name,
    icon: Biohazard,
    color: "text-orange-600",
    description: `Presence/count of carcinogen: ${carc.name}`,
  }));

  const cancerOverlays = cancers.map((cancer) => ({
    id: `cancer_${cancer.id}`,
    label: cancer.name,
    icon: Skull, // Changed from Virus to Skull
    color: "text-pink-600",
    description: `Presence/count of cancer: ${cancer.name}`,
  }));

  const overlays = [
    ...metricOverlays,
    ...carcinogenOverlays,
    ...cancerOverlays,
  ];

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col relative">
      <Header />
      <div className="absolute right-4 top-[4.5rem] z-30">
        <Button
          className="border border-slate-300 dark:border-slate-700 shadow bg-background text-foreground hover:bg-secondary transition"
          size="icon"
          variant="ghost"
          onClick={() => setDarkMode((d) => !d)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </div>

      <div className="relative flex-1 h-full">
        <div
          style={{ zIndex: 2000 }}
          className="absolute top-4 left-4 flex flex-col gap-3"
        >
          <DataOverlayToggle
            activeOverlay={activeOverlay}
            onOverlayChange={setActiveOverlay}
            overlays={overlays}
          />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-1 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-medium flex items-center gap-2 cursor-pointer">
              <Toggle
                key={showEnvSites ? 'on' : 'off'}
                pressed={showEnvSites}
                onPressedChange={v => {
                  console.debug('Show Environmental Sites toggled:', v);
                  setShowEnvSites(v);
                }}
                className="border border-slate-400 dark:border-slate-600 rounded w-5 h-5 flex items-center justify-center transition-colors bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 mr-1 data-[state=on]:bg-blue-500 data-[state=on]:dark:bg-blue-400 data-[state=on]:border-blue-600 data-[state=on]:dark:border-blue-300"
              >
                {showEnvSites && <Check className="w-4 h-4 text-black dark:text-white" />}
              </Toggle>
              Show Environmental Sites
            </label>
          </div>
        </div>
        {/* Flex row for map and sidebar */}
        <div className="flex h-full w-full">
          {/* Map section */}
          <div className="flex-1 h-full min-w-0">
            <TexasMap
              activeOverlay={activeOverlay}
              onCountyClick={handleCountyClick}
              realCounties={realCounties}
              darkMode={darkMode}
              legendBottomClass="bottom-4"
              overlays={overlays}
              showEnvSites={showEnvSites}
            />
          </div>
          {/* Sidebar (desktop only, animates width and opacity) */}
          <div
            style={{
              background: "#fff !important",
              backgroundColor: "#fff !important",
              zIndex: 1000,
            }}
            className={`
              fixed lg:absolute top-0 right-0 h-full w-full lg:w-96
              border border-slate-200/80 dark:border-slate-700/80 shadow-2xl
              transform transition-transform duration-300
              ${isPanelOpen ? "translate-x-0" : "translate-x-full"}
              overflow-y-auto
            `}
          >
            <CountyDetailPanel
              county={
                selectedCountyId
                  ? realCounties.find((c) => c.id === selectedCountyId) || null
                  : null
              }
              isOpen={isPanelOpen}
              onClose={handleClosePanel}
              maxCancerIncidence={maxCancerIncidence}
              maxCancerMortality={maxCancerMortality}
              maxPovertyRate={maxPovertyRate}
              maxHealthcareAccess={maxHealthcareAccess}
              maxPollutionLevel={maxPollutionLevel}
              carcinogens={carcinogens}
              cancers={cancers}
              carcinogenCancerLinks={carcinogenCancerLinks}
              siteCarcinogens={siteCarcinogens}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
