import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Carcinogen, Cancer, CarcinogenCancerLink, EnvironmentalSiteCarcinogen } from "@/types/carcinogen";
// TODO: Fix import below. File '@/components/CarcinogenCrud' not found. Commenting out for now.
// import { CarcinogenCrud } from "@/components/CarcinogenCrud";
import { CancerCrud } from "@/components/CancerCrud";
import { CarcinogenCrud } from "@/components/CarcinogenCrud";
import { Sun, Moon } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const TABS = ["Analytics", "Counties", "Carcinogens", "Cancers"];

// Add types for County and Site

type County = {
  id?: string;
  name: string;
  population: string;
  incidence_rate: string;
  mortality_rate: string;
  avg_annual_deaths: string;
  recent_trend: string;
  poverty_rate: string;
  healthcare_access: string;
  pollution_level: string;
};

type Site = {
  id?: string;
  county_id?: string;
  site_name: string;
  city: string;
  latitude: string;
  longitude: string;
  type: string;
  risk_level: string;
};

const MAIN_TABS = ["Counties", "Carcinogens", "Cancers"];

const AdminDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Analytics");
  const [mainTab, setMainTab] = useState("Counties");

  // --- Analytics ---
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["page_views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // --- Counties ---
  const { data: counties, isLoading: countiesLoading } = useQuery({
    queryKey: ["counties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counties")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    }
  });

  // Fix: add types for counties and sites for type safety
  const emptyCounty = {
    name: "",
    population: "",
    incidence_rate: "",
    mortality_rate: "",
    avg_annual_deaths: "",
    recent_trend: "",
    poverty_rate: "",
    healthcare_access: "",
    pollution_level: "",
  };
  const emptySite = {
    site_name: "",
    city: "",
    latitude: "",
    longitude: "",
    type: "",
    risk_level: "",
  };
  const [newCounty, setNewCounty] = useState<County>({ ...emptyCounty });
  const [editCountyId, setEditCountyId] = useState(null);
  const [editCountyData, setEditCountyData] = useState<County>({ ...emptyCounty });
  const [countyError, setCountyError] = useState("");
  const [countySuccess, setCountySuccess] = useState("");
  const [newSite, setNewSite] = useState<Site>({ ...emptySite });
  const [editSiteId, setEditSiteId] = useState(null);
  const [editSiteData, setEditSiteData] = useState<Site>({ ...emptySite });

  // Add all editable fields for counties
  const countyFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "population", label: "Population", type: "number" },
    { key: "incidence_rate", label: "Incidence Rate", type: "number", step: "any" },
    { key: "mortality_rate", label: "Mortality Rate", type: "number", step: "any" },
    { key: "avg_annual_deaths", label: "Avg Annual Deaths", type: "number" },
    { key: "recent_trend", label: "Recent Trend", type: "number", step: "any" },
    { key: "poverty_rate", label: "Poverty Rate", type: "number", step: "any" },
    { key: "healthcare_access", label: "Healthcare Access", type: "number", step: "any" },
    { key: "pollution_level", label: "Pollution Level", type: "number", step: "any" },
  ];
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // Dialog mode: 'add-county', 'edit-county', 'add-site', 'edit-site'
  const [dialogMode, setDialogMode] = useState<'add-county' | 'edit-county' | 'add-site' | 'edit-site' | null>(null);

  const addCountyMutation = useMutation<void, Error, County>({
    mutationFn: async (county: County) => {
      if (!county.name.trim()) throw new Error("County name is required");
      if (county.population && isNaN(Number(county.population))) throw new Error("Population must be a number");
      const { error } = await supabase.from("counties").insert([county]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      setCountySuccess("County added successfully!");
      setTimeout(() => setCountySuccess(""), 2000);
    },
    onError: (err) => {
      setCountyError(err.message);
      setTimeout(() => setCountyError(""), 3000);
    },
  });

  const updateCountyMutation = useMutation<void, Error, County>({
    mutationFn: async (county: County) => {
      if (!county.name.trim()) throw new Error("County name is required");
      if (county.population && isNaN(Number(county.population))) throw new Error("Population must be a number");
      const { id, ...rest } = county;
      const { error } = await supabase
        .from("counties")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      setCountySuccess("County updated successfully!");
      setTimeout(() => setCountySuccess(""), 2000);
    },
    onError: (err) => {
      setCountyError(err.message);
      setTimeout(() => setCountyError(""), 3000);
    },
  });

  const deleteCountyMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("counties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      setCountySuccess("County deleted successfully!");
      setTimeout(() => setCountySuccess(""), 2000);
    },
    onError: (err) => {
      setCountyError(err.message);
      setTimeout(() => setCountyError(""), 3000);
    },
  });

  // Environmental Sites fields
  const siteFields = [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "latitude", label: "Latitude", type: "number", step: "any" },
    { key: "longitude", label: "Longitude", type: "number", step: "any" },
    { key: "type", label: "Type", type: "text" },
    { key: "risk_level", label: "Risk Level", type: "text" },
  ];
  const [sites, setSites] = useState<Site[]>([]); // all sites for the county
  const [sitesLoading, setSitesLoading] = useState(false);
  const [siteError, setSiteError] = useState("");
  const [siteSuccess, setSiteSuccess] = useState("");

  // Add dropdown options for type and risk_level
  const siteTypeOptions = [
    { value: "power_plant", label: "Power Plant" },
    { value: "landfill", label: "Landfill" },
    { value: "chemical_plant", label: "Chemical Plant" },
    { value: "mining", label: "Mining" },
    { value: "industrial", label: "Industrial" },
  ];
  const riskLevelOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];



  // Add site
  const addSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.site_name.trim()) {
      setSiteError("Site name is required");
      setTimeout(() => setSiteError(""), 3000);
      return;
    }
    if (!selectedCountyId) {
      setSiteError("Please select a county first");
      setTimeout(() => setSiteError(""), 3000);
      return;
    }
    setSitesLoading(true);
    const { error, data } = await supabase.from("environmental_sites").insert([{ ...newSite, county_id: selectedCountyId }]).select();
    setSitesLoading(false);
    if (error) {
      setSiteError(error.message);
      setTimeout(() => setSiteError(""), 3000);
    } else {
      setSites([...sites, ...(data || [])]);
      setNewSite({ ...emptySite });
      setSiteSuccess("Site added!");
      setTimeout(() => setSiteSuccess(""), 2000);
    }
  };

  // Edit site
  const saveEditSite = async (id: string) => {
    if (!editSiteData.site_name.trim()) {
      setSiteError("Site name is required");
      setTimeout(() => setSiteError(""), 3000);
      return;
    }
    setSitesLoading(true);
    const { error } = await supabase.from("environmental_sites").update(editSiteData).eq("id", id);
    setSitesLoading(false);
    if (error) {
      setSiteError(error.message);
      setTimeout(() => setSiteError(""), 3000);
    } else {
      setSites(sites.map(s => (s.id === id ? { ...s, ...editSiteData } : s)));
      setEditSiteId(null);
      setSiteSuccess("Site updated!");
      setTimeout(() => setSiteSuccess(""), 2000);
    }
  };

  // Delete site
  const deleteSite = async (id: string) => {
    setSitesLoading(true);
    const { error } = await supabase.from("environmental_sites").delete().eq("id", id);
    setSitesLoading(false);
    if (error) {
      setSiteError(error.message);
      setTimeout(() => setSiteError(""), 3000);
    } else {
      setSites(sites.filter(s => s.id !== id));
      setSiteSuccess("Site deleted!");
      setTimeout(() => setSiteSuccess(""), 2000);
    }
  };

  // Carcinogen & Cancer state
  const [carcinogens, setCarcinogens] = useState<Carcinogen[]>([]);
  const [cancers, setCancers] = useState<Cancer[]>([]);
  const [carcinogenCancerLinks, setCarcinogenCancerLinks] = useState<CarcinogenCancerLink[]>([]);
  const [siteCarcinogens, setSiteCarcinogens] = useState<EnvironmentalSiteCarcinogen[]>([]);
  // Fetch Carcinogens
  useEffect(() => {
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

  // Dynamic site types
  const [siteTypes, setSiteTypes] = useState<{ id: string; name: string }[]>([]);
  const [siteTypesLoading, setSiteTypesLoading] = useState(false);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");
  const [addTypeError, setAddTypeError] = useState("");

  // Fetch site types from Supabase when dialog opens for add/edit site
  useEffect(() => {
    if ((dialogMode === 'add-site' || dialogMode === 'edit-site') && editDialogOpen) {
      setSiteTypesLoading(true);
      supabase.from('site_types').select('*').order('name').then(({ data, error }) => {
        setSiteTypesLoading(false);
        if (!error && data) setSiteTypes(data);
      });
    }
  }, [dialogMode, editDialogOpen]);

  // Add new site type
  const handleAddNewType = async () => {
    if (!newTypeInput.trim()) {
      setAddTypeError('Type name required');
      setTimeout(() => setAddTypeError(''), 2000);
      return;
    }
    setSiteTypesLoading(true);
    const { data, error } = await supabase.from('site_types').insert([{ name: newTypeInput.trim() }]).select();
    setSiteTypesLoading(false);
    if (error) {
      setAddTypeError(error.message);
      setTimeout(() => setAddTypeError(''), 2000);
    } else if (data && data[0]) {
      setSiteTypes(types => [...types, data[0]]);
      setShowNewTypeInput(false);
      setNewTypeInput("");
      // Select the new type in the form
      if (dialogMode === 'edit-site') {
        setEditSiteData(d => ({ ...d, type: data[0].name }));
      } else {
        setNewSite(d => ({ ...d, type: data[0].name }));
      }
    }
  };

  // Function to automatically assign county IDs based on coordinates
  const assignCountyIdsToSites = async () => {
    try {
      // Fetch all sites without county_id
      const { data: sitesWithoutCounty, error: sitesError } = await supabase
        .from("environmental_sites")
        .select("*")
        .is("county_id", null);
      
      if (sitesError) {
        console.error("Error fetching sites without county:", sitesError);
        return;
      }

      if (!sitesWithoutCounty || sitesWithoutCounty.length === 0) {
        console.log("No sites found without county assignment");
        return;
      }

      console.log(`Found ${sitesWithoutCounty.length} sites without county assignment`);

      // Fetch all counties
      const { data: countiesData, error: countiesError } = await supabase
        .from("counties")
        .select("*");
      
      if (countiesError) {
        console.error("Error fetching counties:", countiesError);
        return;
      }

      // Create a mapping of county names to county IDs
      const countyNameToId = {};
      countiesData.forEach(county => {
        countyNameToId[county.name.toLowerCase()] = county.id;
      });

      // For each site without a county, try to assign based on coordinates
      let updatedCount = 0;
      for (const site of sitesWithoutCounty) {
        if (!site.latitude || !site.longitude) {
          console.log(`Site ${site.site_name} missing coordinates, skipping`);
          continue;
        }

        // Find the closest county based on coordinates
        let closestCounty = null;
        let minDistance = Infinity;

        for (const county of countiesData) {
          // Calculate distance (simplified)
          const distance = Math.sqrt(
            Math.pow(site.latitude - (county.latitude || 0), 2) + 
            Math.pow(site.longitude - (county.longitude || 0), 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestCounty = county;
          }
        }

        if (closestCounty) {
          // Update the site with the county ID
          const { error: updateError } = await supabase
            .from("environmental_sites")
            .update({ county_id: closestCounty.id })
            .eq("id", site.id);
          
          if (updateError) {
            console.error(`Error updating site ${site.site_name}:`, updateError);
          } else {
            updatedCount++;
            console.log(`Assigned site ${site.site_name} to county ${closestCounty.name}`);
          }
        }
      }

      console.log(`Successfully assigned ${updatedCount} sites to counties`);
      
      // Refresh the sites list if we're currently viewing a county
      if (selectedCountyId) {
        const { data: updatedSites, error } = await supabase
          .from("environmental_sites")
          .select("*")
          .eq("county_id", selectedCountyId);
        
        if (!error && updatedSites) {
          setSites(updatedSites);
        }
      }

    } catch (error) {
      console.error("Error in assignCountyIdsToSites:", error);
    }
  };

  // Function to manually assign a site to a specific county
  const assignSiteToCounty = async (siteId: string, countyId: string) => {
    try {
      const { error } = await supabase
        .from("environmental_sites")
        .update({ county_id: countyId })
        .eq("id", siteId);
      
      if (error) {
        console.error("Error assigning site to county:", error);
        return false;
      } else {
        console.log("Successfully assigned site to county");
        return true;
      }
    } catch (error) {
      console.error("Error in assignSiteToCounty:", error);
      return false;
    }
  };

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode in localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_dark_mode') === 'true';
    }
    return false;
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  // State for selected county and site
  const [selectedCountyId, setSelectedCountyId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [countySearch, setCountySearch] = useState("");

  // Fetch sites for the selected county
  useEffect(() => {
    if (selectedCountyId) {
      setSitesLoading(true);
      supabase
        .from("environmental_sites")
        .select("*")
        .eq("county_id", selectedCountyId)
        .then(({ data, error }) => {
          setSitesLoading(false);
          if (error) setSiteError(error.message);
          else setSites(data || []);
        });
    } else {
      setSites([]);
    }
  }, [selectedCountyId]);

  // Filtered counties for search
  const filteredCounties = useMemo(() => {
    if (!counties) return [];
    return counties.filter((c: any) =>
      c.name.toLowerCase().includes(countySearch.toLowerCase())
    );
  }, [counties, countySearch]);

  // Selected county and site objects
  const selectedCounty = filteredCounties.find((c: any) => c.id === selectedCountyId) || null;
  const selectedSite = selectedCounty && sites.find((s: any) => s.id === selectedSiteId) || null;
  


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      {/* Dark mode toggle button under header, top right */}
      <div className="relative">
        <div className="absolute right-4 top-2 z-30">
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
      </div>
      <div className="flex-1 flex flex-col items-center py-8 px-2">
        <div className="w-full max-w-6xl">
          {/* Tab bar */}
          <div className="flex gap-2 mb-6">
            {MAIN_TABS.map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 rounded font-medium border transition-colors ${mainTab === tab ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-foreground border-slate-200 dark:border-slate-700'}`}
                onClick={() => setMainTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Main content area: show tab content */}
          {mainTab === "Counties" && (
            <div className="flex flex-row gap-6">
              {/* Left column: County list */}
              <div className="w-1/3 bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
                {/* Counties header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Counties</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={assignCountyIdsToSites}>Auto Assign Counties</Button>
                    <Button size="sm" onClick={() => { setEditCountyId(null); setEditCountyData({ ...emptyCounty }); setDialogMode('add-county'); setEditDialogOpen(true); }}>+ Add</Button>
                  </div>
                </div>
                <Input
                  placeholder="Search counties..."
                  value={countySearch}
                  onChange={e => setCountySearch(e.target.value)}
                  className="mb-3"
                />
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Population</th>
                        {/* Remove Actions column header */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCounties.map((county: any) => (
                        <tr
                          key={county.id}
                          className={`border-b last:border-b-0 cursor-pointer ${selectedCountyId === county.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                          onClick={() => {
                            setSelectedCountyId(county.id);
                            setSelectedSiteId(null);
                            // Do NOT open the dialog or set dialogMode here
                          }}
                        >
                          <td className="px-3 py-2 font-medium">{county.name}</td>
                          <td className="px-3 py-2">{county.population}</td>
                          {/* Remove actions column from sidebar */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right column: County details and sites */}
              <div className="w-2/3 flex flex-col gap-4">
                {!selectedCounty ? (
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center text-muted-foreground">
                    Select a county to view details
                  </div>
                ) : (
                  <>
                    {/* County info card */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold">{selectedCounty.name}</h3>
                        <Button size="sm" variant="outline" onClick={() => { setEditCountyId(selectedCounty.id); setEditCountyData({ ...emptyCounty, ...selectedCounty }); setDialogMode('edit-county'); setEditDialogOpen(true); }}>Edit County</Button>
                      </div>
                      <div className="border-b border-slate-200 dark:border-slate-700 mb-3"></div>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex">
                          <dt className="text-muted-foreground w-32">Population:</dt>
                          <dd className="font-semibold">{selectedCounty.population || "—"}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-muted-foreground w-32">Incidence Rate:</dt>
                          <dd className="font-semibold">{selectedCounty.incidence_rate || "—"}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-muted-foreground w-32">Mortality Rate:</dt>
                          <dd className="font-semibold">{selectedCounty.mortality_rate || "—"}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-muted-foreground w-32">Poverty Rate:</dt>
                          <dd className="font-semibold">{selectedCounty.poverty_rate || "—"}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-muted-foreground w-32">Healthcare Access:</dt>
                          <dd className="font-semibold">{selectedCounty.healthcare_access || "—"}</dd>
                        </div>
                        <div className="flex">
                          <dt className="text-muted-foreground w-32">Pollution Level:</dt>
                          <dd className="font-semibold">{selectedCounty.pollution_level || "—"}</dd>
                        </div>
                      </dl>
                    </div>
                    {/* Sites list */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                      {/* Sites list header */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-md font-bold">Sites in {selectedCounty.name}</h4>
                        <Button size="sm" onClick={() => { setEditSiteId(null); setNewSite({ ...emptySite }); setEditSiteData({ ...emptySite }); setDialogMode('add-site'); setEditDialogOpen(true); }}>+ Add Site</Button>
                      </div>
                      <table className="w-full text-sm border rounded-lg overflow-hidden mb-2">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Name</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Risk</th>
                            <th className="px-3 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sites.filter(s => s.county_id === selectedCounty.id).map(site => (
                            <tr
                              key={site.id}
                              className={`border-b last:border-b-0 cursor-pointer ${selectedSiteId === site.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                              onClick={() => setSelectedSiteId(site.id)}
                            >
                              <td className="px-3 py-2 font-medium">{site.site_name}</td>
                              <td className="px-3 py-2">{site.type}</td>
                              <td className="px-3 py-2">{site.risk_level}</td>
                              <td className="px-3 py-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setEditSiteId(site.id); setEditSiteData(site); setDialogMode('edit-site'); setEditDialogOpen(true); }}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); deleteSite(site.id); }}>Delete</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {mainTab === "Carcinogens" && (
            <CarcinogenCrud
              carcinogens={carcinogens}
              setCarcinogens={setCarcinogens}
              cancers={cancers}
              carcinogenCancerLinks={carcinogenCancerLinks}
              setCarcinogenCancerLinks={setCarcinogenCancerLinks}
            />
          )}
          {mainTab === "Cancers" && (
            <CancerCrud
              cancers={cancers}
              setCancers={setCancers}
              carcinogens={carcinogens}
              carcinogenCancerLinks={carcinogenCancerLinks}
              setCarcinogenCancerLinks={setCarcinogenCancerLinks}
            />
          )}
        </div>
        {/* Dialog for Add/Edit County or Site */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            {dialogMode === 'add-site' || dialogMode === 'edit-site' ? (
              <>
                <DialogHeader>
                  <DialogTitle>{dialogMode === 'edit-site' ? 'Edit Site' : 'Add Site'}</DialogTitle>
                </DialogHeader>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={dialogMode === 'edit-site' ? (e) => { e.preventDefault(); saveEditSite(editSiteId); } : addSite}
                >
                  {siteFields.map(field => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{field.label}</label>
                      {field.key === 'type' ? (
                        <>
                          <Select
                            value={dialogMode === 'edit-site' ? editSiteData.type : newSite.type}
                            onValueChange={val => {
                              if (val === '__add_new__') {
                                setShowNewTypeInput(true);
                              } else {
                                setShowNewTypeInput(false);
                                if (dialogMode === 'edit-site') {
                                  setEditSiteData(d => ({ ...d, type: val }));
                                } else {
                                  setNewSite(d => ({ ...d, type: val }));
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700 text-foreground dark:text-white">
                              {siteTypes.map(opt => (
                                <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>
                              ))}
                              <SelectItem value="__add_new__">+ Add new type...</SelectItem>
                            </SelectContent>
                          </Select>
                          {showNewTypeInput && (
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder="New type name"
                                value={newTypeInput}
                                onChange={e => setNewTypeInput(e.target.value)}
                                autoFocus
                              />
                              <Button type="button" size="sm" onClick={handleAddNewType} disabled={siteTypesLoading}>Add</Button>
                              <Button type="button" size="sm" variant="secondary" onClick={() => { setShowNewTypeInput(false); setNewTypeInput(""); }}>Cancel</Button>
                            </div>
                          )}
                          {addTypeError && <div className="text-red-500 text-xs mt-1">{addTypeError}</div>}
                        </>
                      ) : field.key === 'risk_level' ? (
                        <Select
                          value={dialogMode === 'edit-site' ? editSiteData.risk_level : newSite.risk_level}
                          onValueChange={val => {
                            if (dialogMode === 'edit-site') {
                              setEditSiteData(d => ({ ...d, risk_level: val }));
                            } else {
                              setNewSite(d => ({ ...d, risk_level: val }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select risk" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border dark:border-slate-700 text-foreground dark:text-white">
                            {riskLevelOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          step={field.step}
                          value={dialogMode === 'edit-site' ? editSiteData[field.key] : newSite[field.key]}
                          onChange={e => dialogMode === 'edit-site'
                            ? setEditSiteData(d => ({ ...d, [field.key]: e.target.value }))
                            : setNewSite(d => ({ ...d, [field.key]: e.target.value }))}
                          required={field.key === 'site_name'}
                        />
                      )}
                    </div>
                  ))}
                  {siteError && <div className="text-red-500 text-sm">{siteError}</div>}
                  {siteSuccess && <div className="text-green-600 text-sm">{siteSuccess}</div>}
                  <DialogFooter className="mt-2 flex gap-2">
                    <Button type="submit" disabled={sitesLoading}>{dialogMode === 'edit-site' ? 'Save' : 'Add'}</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" onClick={() => { setEditSiteId(null); setNewSite({ ...emptySite }); setEditSiteData({ ...emptySite }); setSiteError(''); setSiteSuccess(''); setDialogMode(null); }}>Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>{dialogMode === 'edit-county' ? 'Edit County' : 'Add County'}</DialogTitle>
                </DialogHeader>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={e => {
                    e.preventDefault();
                    if (dialogMode === 'edit-county') {
                      updateCountyMutation.mutate({ ...editCountyData, id: editCountyId });
                    } else {
                      addCountyMutation.mutate(newCounty);
                    }
                  }}
                >
                  {countyFields.map(field => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{field.label}</label>
                      <Input
                        type={field.type}
                        step={field.step}
                        value={dialogMode === 'edit-county' ? editCountyData[field.key] : newCounty[field.key]}
                        onChange={e => dialogMode === 'edit-county'
                          ? setEditCountyData(d => ({ ...d, [field.key]: e.target.value }))
                          : setNewCounty(d => ({ ...d, [field.key]: e.target.value }))}
                        required={field.key === 'name'}
                      />
                    </div>
                  ))}
                  {countyError && <div className="text-red-500 text-sm">{countyError}</div>}
                  {countySuccess && <div className="text-green-600 text-sm">{countySuccess}</div>}
                  <DialogFooter className="mt-2 flex gap-2">
                    <Button type="submit" disabled={addCountyMutation.isPending || updateCountyMutation.isPending}>{dialogMode === 'edit-county' ? 'Save' : 'Add'}</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" onClick={() => { setEditCountyId(null); setEditCountyData({ ...emptyCounty }); setNewCounty({ ...emptyCounty }); setCountyError(''); setCountySuccess(''); setDialogMode(null); }}>Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
        {/* End Dialog */}
      </div>
    </div>
  );
};

export default AdminDashboard; 