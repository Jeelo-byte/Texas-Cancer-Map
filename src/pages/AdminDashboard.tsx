import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Carcinogen, Cancer, CarcinogenCancerLink, EnvironmentalSiteCarcinogen } from "@/types/carcinogen";
import { CancerCrud } from "@/components/CancerCrud";
import { CarcinogenCrud } from "@/components/CarcinogenCrud";
import { Sun, Moon, Plus, Edit2, Trash2, Database, UserPlus, AlertTriangle, CheckCircle } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { CSVUploader } from "@/components/CSVUploader";
import { DynamicTableEditor } from "@/components/DynamicTableEditor";

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

const AdminDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const emptyCounty = {
    name: "", population: "", incidence_rate: "", mortality_rate: "",
    avg_annual_deaths: "", recent_trend: "", poverty_rate: "",
    healthcare_access: "", pollution_level: "",
  };
  const emptySite = {
    site_name: "", city: "", latitude: "", longitude: "", type: "", risk_level: "",
  };
  
  const [newCounty, setNewCounty] = useState<County>({ ...emptyCounty });
  const [editCountyId, setEditCountyId] = useState(null);
  const [editCountyData, setEditCountyData] = useState<County>({ ...emptyCounty });
  const [countyError, setCountyError] = useState("");
  const [countySuccess, setCountySuccess] = useState("");
  const [newSite, setNewSite] = useState<Site>({ ...emptySite });
  const [editSiteId, setEditSiteId] = useState(null);
  const [editSiteData, setEditSiteData] = useState<Site>({ ...emptySite });

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
  const [dialogMode, setDialogMode] = useState<'add-county' | 'edit-county' | 'add-site' | 'edit-site' | null>(null);

  // New User State
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [addUserSuccess, setAddUserSuccess] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError("");
    setAddUserSuccess("");
    
    // Note: using signUp from the client might alter the current session 
    // depending on Supabase project settings.
    const { data, error } = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
    });
    
    setAddUserLoading(false);
    
    if (error) {
      setAddUserError(error.message);
    } else {
      setAddUserSuccess("User created successfully!");
      setNewUserEmail("");
      setNewUserPassword("");
      setTimeout(() => {
        setAddUserOpen(false);
        setAddUserSuccess("");
      }, 2000);
    }
  };

  const addCountyMutation = useMutation<void, Error, County>({
    mutationFn: async (county: County) => {
      if (!county.name.trim()) throw new Error("County name is required");
      const { error } = await supabase.from("counties").insert([county]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      setCountySuccess("County added successfully!");
      setEditDialogOpen(false);
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
      const { id, ...rest } = county;
      const { error } = await supabase.from("counties").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      setCountySuccess("County updated successfully!");
      setEditDialogOpen(false);
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
      setSelectedCountyId(null);
    }
  });

  // Sites
  const siteFields = [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "latitude", label: "Latitude", type: "number", step: "any" },
    { key: "longitude", label: "Longitude", type: "number", step: "any" },
    { key: "type", label: "Type", type: "text" },
    { key: "risk_level", label: "Risk Level", type: "text" },
  ];
  
  const [sites, setSites] = useState<Site[]>([]); 
  const [sitesLoading, setSitesLoading] = useState(false);
  const [siteError, setSiteError] = useState("");
  const [siteSuccess, setSiteSuccess] = useState("");

  const riskLevelOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const addSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.site_name.trim()) return setSiteError("Site name is required");
    if (!selectedCountyId) return setSiteError("Please select a county first");
    
    setSitesLoading(true);
    const { error, data } = await supabase.from("environmental_sites").insert([{ ...newSite, county_id: selectedCountyId }]).select();
    setSitesLoading(false);
    if (error) {
      setSiteError(error.message);
    } else {
      setSites([...sites, ...(data || [])]);
      setEditDialogOpen(false);
    }
  };

  const saveEditSite = async (id: string) => {
    if (!editSiteData.site_name.trim()) return setSiteError("Site name is required");
    
    setSitesLoading(true);
    const { error } = await supabase.from("environmental_sites").update(editSiteData).eq("id", id);
    setSitesLoading(false);
    if (error) {
      setSiteError(error.message);
    } else {
      setSites(sites.map(s => (s.id === id ? { ...s, ...editSiteData } : s)));
      setEditDialogOpen(false);
    }
  };

  const deleteSite = async (id: string) => {
    setSitesLoading(true);
    const { error } = await supabase.from("environmental_sites").delete().eq("id", id);
    setSitesLoading(false);
    if (!error) {
      setSites(sites.filter(s => s.id !== id));
    }
  };

  // Carcinogen & Cancer state
  const [carcinogens, setCarcinogens] = useState<Carcinogen[]>([]);
  const [cancers, setCancers] = useState<Cancer[]>([]);
  const [carcinogenCancerLinks, setCarcinogenCancerLinks] = useState<CarcinogenCancerLink[]>([]);
  
  useEffect(() => {
    supabase.from("carcinogens").select("*").then(({ data, error }) => { if (!error && data) setCarcinogens(data); });
    supabase.from("cancers").select("*").then(({ data, error }) => { if (!error && data) setCancers(data); });
    supabase.from("carcinogen_cancer_link").select("*").then(({ data, error }) => { if (!error && data) setCarcinogenCancerLinks(data); });
  }, []);

  const [siteTypes, setSiteTypes] = useState<{ id: string; name: string }[]>([]);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");

  useEffect(() => {
    if ((dialogMode === 'add-site' || dialogMode === 'edit-site') && editDialogOpen) {
      supabase.from('site_types').select('*').order('name').then(({ data, error }) => {
        if (!error && data) setSiteTypes(data);
      });
    }
  }, [dialogMode, editDialogOpen]);

  const handleAddNewType = async () => {
    if (!newTypeInput.trim()) return;
    const { data, error } = await supabase.from('site_types').insert([{ name: newTypeInput.trim() }]).select();
    if (!error && data && data[0]) {
      setSiteTypes(types => [...types, data[0]]);
      setShowNewTypeInput(false);
      setNewTypeInput("");
      if (dialogMode === 'edit-site') setEditSiteData(d => ({ ...d, type: data[0].id }));
      else setNewSite(d => ({ ...d, type: data[0].id }));
    }
  };

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('admin_dark_mode') === 'true';
    return false;
  });
  
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('admin_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const [selectedCountyId, setSelectedCountyId] = useState<string | null>(null);
  const [countySearch, setCountySearch] = useState("");

  useEffect(() => {
    if (selectedCountyId) {
      setSitesLoading(true);
      supabase.from("environmental_sites").select("*").eq("county_id", selectedCountyId).then(({ data }) => {
        setSitesLoading(false);
        setSites(data || []);
      });
    } else {
      setSites([]);
    }
  }, [selectedCountyId]);

  const filteredCounties = useMemo(() => {
    if (!counties) return [];
    return counties.filter((c: any) => c.name?.toLowerCase().includes(countySearch?.toLowerCase() || ''));
  }, [counties, countySearch]);

  const selectedCounty = filteredCounties.find((c: any) => c.id === selectedCountyId) || null;

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <div className="absolute right-4 top-2 z-30">
        <Button
          className="border border-slate-300 dark:border-slate-700 shadow bg-background text-foreground hover:bg-secondary transition"
          size="icon"
          variant="ghost"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex-1 max-w-[1400px] w-full mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage counties, environmental sites, carcinogens, and cancers.</p>
          </div>
          <Button onClick={() => setAddUserOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Admin
          </Button>
        </div>

        <Tabs defaultValue="counties" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800 border">
            <TabsTrigger value="counties">Counties & Sites</TabsTrigger>
            <TabsTrigger value="spreadsheet" className="flex items-center gap-1"><Database className="w-4 h-4"/> Spreadsheet View</TabsTrigger>
            <TabsTrigger value="carcinogens">Carcinogens</TabsTrigger>
            <TabsTrigger value="cancers">Cancers</TabsTrigger>
            <TabsTrigger value="import">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="counties" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Counties List */}
              <Card className="md:col-span-4 h-[calc(100vh-250px)] flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Counties</CardTitle>
                    <Button size="sm" onClick={() => { setEditCountyId(null); setEditCountyData({ ...emptyCounty }); setDialogMode('add-county'); setEditDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <Input 
                    placeholder="Search counties..." 
                    value={countySearch} 
                    onChange={e => setCountySearch(e.target.value)} 
                    className="mt-2"
                  />
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto flex-1">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Pop.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCounties.map((county: any) => (
                        <TableRow 
                          key={county.id} 
                          className={`cursor-pointer ${selectedCountyId === county.id ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                          onClick={() => setSelectedCountyId(county.id)}
                        >
                          <TableCell className="font-medium">{county.name}</TableCell>
                          <TableCell className="text-right">{county.population?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Right Column: County Details & Sites */}
              <div className="md:col-span-8 flex flex-col gap-6">
                {!selectedCounty ? (
                  <Card className="h-full flex items-center justify-center text-muted-foreground border-dashed">
                    Select a county to view details and environmental sites.
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>{selectedCounty.name} County</CardTitle>
                          <CardDescription>Population: {selectedCounty.population?.toLocaleString() || "N/A"}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditCountyId(selectedCounty.id); setEditCountyData({ ...emptyCounty, ...selectedCounty }); setDialogMode('edit-county'); setEditDialogOpen(true); }}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCountyMutation.mutate(selectedCounty.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><span className="text-muted-foreground block">Incidence Rate</span><span className="font-semibold">{selectedCounty.incidence_rate || "—"}</span></div>
                          <div><span className="text-muted-foreground block">Mortality Rate</span><span className="font-semibold">{selectedCounty.mortality_rate || "—"}</span></div>
                          <div><span className="text-muted-foreground block">Poverty Rate</span><span className="font-semibold">{selectedCounty.poverty_rate || "—"}%</span></div>
                          <div><span className="text-muted-foreground block">Pollution Level</span><span className="font-semibold">{selectedCounty.pollution_level || "—"}</span></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="flex-1">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle>Environmental Sites ({sites.length})</CardTitle>
                        <Button size="sm" onClick={() => { setEditSiteId(null); setNewSite({ ...emptySite }); setEditSiteData({ ...emptySite }); setDialogMode('add-site'); setEditDialogOpen(true); }}>
                          <Plus className="w-4 h-4 mr-1" /> Add Site
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Site Name</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>Risk Level</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sites.length === 0 && (
                              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No sites recorded for this county.</TableCell></TableRow>
                            )}
                            {sites.map(site => (
                              <TableRow key={site.id}>
                                <TableCell className="font-medium">{site.site_name}</TableCell>
                                <TableCell>{site.city}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 text-xs rounded-full ${site.risk_level === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : site.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                    {site.risk_level?.toUpperCase()}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => { setEditSiteId(site.id); setEditSiteData(site); setDialogMode('edit-site'); setEditDialogOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteSite(site.id)}><Trash2 className="w-4 h-4" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spreadsheet" className="mt-6">
            <DynamicTableEditor />
          </TabsContent>

          <TabsContent value="carcinogens">
            <CarcinogenCrud carcinogens={carcinogens} setCarcinogens={setCarcinogens} cancers={cancers} carcinogenCancerLinks={carcinogenCancerLinks} setCarcinogenCancerLinks={setCarcinogenCancerLinks} />
          </TabsContent>

          <TabsContent value="cancers">
            <CancerCrud cancers={cancers} setCancers={setCancers} carcinogens={carcinogens} carcinogenCancerLinks={carcinogenCancerLinks} setCarcinogenCancerLinks={setCarcinogenCancerLinks} />
          </TabsContent>

          <TabsContent value="import" className="flex justify-center mt-8">
            <div className="w-full max-w-4xl">
              <CSVUploader onSuccess={() => queryClient.invalidateQueries({ queryKey: ["counties"] })} />
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'edit-site' ? 'Edit Site' : dialogMode === 'add-site' ? 'Add Site' : dialogMode === 'edit-county' ? 'Edit County' : 'Add County'}</DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4 py-4" onSubmit={dialogMode?.includes('site') ? (dialogMode === 'edit-site' ? (e) => { e.preventDefault(); saveEditSite(editSiteId); } : addSite) : (e) => { e.preventDefault(); if (dialogMode === 'edit-county') updateCountyMutation.mutate({ ...editCountyData, id: editCountyId }); else addCountyMutation.mutate(newCounty); }}>
              <div className="grid grid-cols-2 gap-4">
                {(dialogMode?.includes('site') ? siteFields : countyFields).map(field => (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.key === 'type' ? (
                      <Select value={dialogMode === 'edit-site' ? editSiteData.type : newSite.type} onValueChange={val => { if (val === '__add_new__') setShowNewTypeInput(true); else { setShowNewTypeInput(false); if (dialogMode === 'edit-site') setEditSiteData(d => ({ ...d, type: val })); else setNewSite(d => ({ ...d, type: val })); } }}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {siteTypes.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                          <SelectItem value="__add_new__">+ Add new type...</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : field.key === 'risk_level' ? (
                      <Select value={dialogMode === 'edit-site' ? editSiteData.risk_level : newSite.risk_level} onValueChange={val => { if (dialogMode === 'edit-site') setEditSiteData(d => ({ ...d, risk_level: val })); else setNewSite(d => ({ ...d, risk_level: val })); }}>
                        <SelectTrigger><SelectValue placeholder="Select risk" /></SelectTrigger>
                        <SelectContent>{riskLevelOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (
                      <Input type={field.type} step={field.step} value={dialogMode?.includes('edit') ? (dialogMode === 'edit-county' ? editCountyData[field.key] : editSiteData[field.key]) : (dialogMode === 'add-county' ? newCounty[field.key] : newSite[field.key])} onChange={e => { const val = e.target.value; if (dialogMode === 'edit-county') setEditCountyData(d => ({ ...d, [field.key]: val })); else if (dialogMode === 'edit-site') setEditSiteData(d => ({ ...d, [field.key]: val })); else if (dialogMode === 'add-county') setNewCounty(d => ({ ...d, [field.key]: val })); else setNewSite(d => ({ ...d, [field.key]: val })); }} required={field.key === 'name' || field.key === 'site_name'} />
                    )}
                  </div>
                ))}
              </div>
              
              {showNewTypeInput && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">New Type Name</label>
                    <Input value={newTypeInput} onChange={e => setNewTypeInput(e.target.value)} />
                  </div>
                  <Button type="button" onClick={handleAddNewType}>Add Type</Button>
                </div>
              )}

              {siteError && <div className="text-red-500 text-sm">{siteError}</div>}
              {countyError && <div className="text-red-500 text-sm">{countyError}</div>}

              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={sitesLoading || addCountyMutation.isPending || updateCountyMutation.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
              <DialogDescription>
                Create a new administrator account. Note: Depending on your Supabase settings, this may log you out, or the new user may need to verify their email.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email" 
                  required 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password" 
                  required 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Secure password"
                />
              </div>

              {addUserError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {addUserError}
                </div>
              )}
              {addUserSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {addUserSuccess}
                </div>
              )}

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={addUserLoading}>
                  {addUserLoading ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;