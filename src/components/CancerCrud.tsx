import { useState, useMemo } from "react";
import { Cancer, Carcinogen, CarcinogenCancerLink } from "@/types/carcinogen";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CancerCrudProps {
  cancers: Cancer[];
  setCancers: (c: Cancer[]) => void;
  carcinogens: Carcinogen[];
  carcinogenCancerLinks: CarcinogenCancerLink[];
  setCarcinogenCancerLinks: (links: CarcinogenCancerLink[]) => void;
}

export function CancerCrud({ cancers, setCancers, carcinogens, carcinogenCancerLinks, setCarcinogenCancerLinks }: CancerCrudProps) {
  const empty: Omit<Cancer, "id"> = { name: "", description: "" };
  const [form, setForm] = useState<Omit<Cancer, "id">>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Cancer, "id">>(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState(false);

  const filteredCancers = useMemo(() => {
    return cancers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [cancers, search]);

  const selectedCancer = filteredCancers.find(c => c.id === selectedId) || null;

  // Add logic
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      setTimeout(() => setError(""), 2000);
      return;
    }
    const { data, error } = await supabase.from("cancers").insert([form]).select();
    if (error) {
      setError(error.message);
      setTimeout(() => setError(""), 2000);
    } else {
      setCancers([...cancers, ...(data || [])]);
      setForm(empty);
      setAddMode(false);
      setSelectedId(data[0]?.id || null);
      setSuccess("Added!");
      setTimeout(() => setSuccess(""), 1500);
    }
  };

  // Edit logic
  const handleEdit = async (id: string) => {
    if (!editForm.name.trim()) {
      setError("Name is required");
      setTimeout(() => setError(""), 2000);
      return;
    }
    const { error } = await supabase.from("cancers").update(editForm).eq("id", id);
    if (error) {
      setError(error.message);
      setTimeout(() => setError(""), 2000);
    } else {
      setCancers(cancers.map(c => c.id === id ? { ...c, ...editForm, id } : c));
      setEditId(null);
      setSelectedId(id);
      setSuccess("Saved!");
      setTimeout(() => setSuccess(""), 1500);
    }
  };

  // Delete logic
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cancers").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setTimeout(() => setError(""), 2000);
    } else {
      setCancers(cancers.filter(c => c.id !== id));
      setSelectedId(null);
      setSuccess("Deleted!");
      setTimeout(() => setSuccess(""), 1500);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left: Cancer list */}
      <div className="w-1/3 bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Cancers</h2>
          <Button size="sm" onClick={() => { setAddMode(true); setSelectedId(null); setForm(empty); }}>+ Add</Button>
        </div>
        <Input
          placeholder="Search cancers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredCancers.map(c => (
                <tr
                  key={c.id}
                  className={`border-b last:border-b-0 cursor-pointer ${selectedId === c.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                  onClick={() => { setSelectedId(c.id!); setAddMode(false); setEditId(null); }}
                >
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Right: Details panel */}
      <div className="w-2/3 flex flex-col gap-4">
        {addMode ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-2">Add Cancer</h3>
            <form className="flex flex-col gap-2" onSubmit={handleAdd}>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit">Add</Button>
                <Button type="button" variant="secondary" onClick={() => setAddMode(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        ) : !selectedCancer ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center text-muted-foreground">
            Select a cancer to view details
          </div>
        ) : editId === selectedCancer.id ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-2">Edit Cancer</h3>
            <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleEdit(selectedCancer.id!); }}>
              <Input
                placeholder="Name"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Description"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="flex gap-2 mt-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{selectedCancer.name}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditId(selectedCancer.id!); setEditForm({ name: selectedCancer.name, description: selectedCancer.description || "" }); }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedCancer.id!)}>Delete</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-2">
              <div><span className="font-semibold">Description:</span> {selectedCancer.description}</div>
            </div>
            {/* Multi-select for carcinogens */}
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">Linked Carcinogens</label>
              <select
                multiple
                className="border rounded px-2 py-2 text-sm w-full"
                value={
                  carcinogenCancerLinks
                    .filter(link => link.cancer_id === selectedCancer.id)
                    .map(link => link.carcinogen_id)
                }
                onChange={async (e) => {
                  const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  await supabase.from("carcinogen_cancer_link").delete().eq("cancer_id", selectedCancer.id);
                  if (selected.length > 0) {
                    await supabase.from("carcinogen_cancer_link").insert(
                      selected.map(carcinogen_id => ({ carcinogen_id, cancer_id: selectedCancer.id }))
                    );
                  }
                  const { data } = await supabase.from("carcinogen_cancer_link").select("*");
                  setCarcinogenCancerLinks(data || []);
                }}
              >
                {carcinogens.map(carcinogen => (
                  <option key={carcinogen.id} value={carcinogen.id}>{carcinogen.name}</option>
                ))}
              </select>
            </div>
            {/* List linked carcinogens */}
            <div>
              <span className="font-semibold">Linked Carcinogens:</span>
              <ul className="ml-4 list-disc">
                {carcinogenCancerLinks
                  .filter(link => link.cancer_id === selectedCancer.id)
                  .map(link => {
                    const carcinogen = carcinogens.find(ca => ca.id === link.carcinogen_id);
                    return carcinogen ? (
                      <li key={carcinogen.id}>{carcinogen.name} <span className="text-xs text-muted-foreground">{carcinogen.description}</span></li>
                    ) : null;
                  })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 