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
  overlay_field: string;
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
    overlay_field: "",
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
    { key: "overlay_field", label: "Overlay Field", type: "number", step: "any" },
  ];
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  // Fetch sites for the selected county when dialog opens
  useEffect(() => {
    if (editDialogOpen && editCountyId) {
      setSitesLoading(true);
      supabase
        .from("environmental_sites")
        .select("*")
        .eq("county_id", editCountyId)
        .then(({ data, error }) => {
          setSitesLoading(false);
          if (error) setSiteError(error.message);
          else setSites(data || []);
        });
    } else {
      setSites([]);
    }
  }, [editDialogOpen, editCountyId]);

  // Add site
  const addSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.site_name.trim()) {
      setSiteError("Site name is required");
      setTimeout(() => setSiteError(""), 3000);
      return;
    }
    setSitesLoading(true);
    const { error, data } = await supabase.from("environmental_sites").insert([{ ...newSite, county_id: editCountyId }]).select();
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Counties</h2>
                  <Button size="sm" onClick={() => setEditCountyId(null)}>+ Add</Button>
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
                            setEditCountyId(county.id);
                            setEditCountyData({ ...emptyCounty, ...county });
                            setEditDialogOpen(true);
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
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">{selectedCounty.name}</h3>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditCountyId(selectedCounty.id); setEditCountyData({ ...emptyCounty, ...selectedCounty }); setEditDialogOpen(true); }}>Edit County</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCountyMutation.mutate(selectedCounty.id)}>Delete County</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div><span className="font-semibold">Population:</span> {selectedCounty.population}</div>
                        <div><span className="font-semibold">Incidence Rate:</span> {selectedCounty.incidence_rate}</div>
                        <div><span className="font-semibold">Mortality Rate:</span> {selectedCounty.mortality_rate}</div>
                        <div><span className="font-semibold">Poverty Rate:</span> {selectedCounty.poverty_rate}</div>
                        <div><span className="font-semibold">Healthcare Access:</span> {selectedCounty.healthcare_access}</div>
                        <div><span className="font-semibold">Pollution Level:</span> {selectedCounty.pollution_level}</div>
                      </div>
                    </div>
                    {/* Sites list */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-md font-bold">Sites in {selectedCounty.name}</h4>
                        <Button size="sm" onClick={() => setEditSiteId(null)}>+ Add Site</Button>
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
                                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setEditSiteId(site.id); setEditSiteData(site); }}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); deleteSite(site.id); }}>Delete</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Site details panel */}
                      {selectedSite && (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow p-4 mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-md font-bold">Site: {selectedSite.site_name}</h5>
                            <Button size="sm" variant="outline" onClick={() => setEditSiteId(selectedSite.id)}>Edit Site</Button>
                          </div>
                          <div className="flex flex-wrap gap-4 mb-2">
                            <div><span className="font-semibold">Type:</span> {selectedSite.type}</div>
                            <div><span className="font-semibold">Risk:</span> {selectedSite.risk_level}</div>
                            <div><span className="font-semibold">City:</span> {selectedSite.city}</div>
                            <div><span className="font-semibold">Lat:</span> {selectedSite.latitude}</div>
                            <div><span className="font-semibold">Lng:</span> {selectedSite.longitude}</div>
                          </div>
                          {/* Carcinogen linking UI can go here */}
                        </div>
                      )}
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
      </div>
    </div>
  );
};

export default AdminDashboard; 