import { useState, useMemo } from "react";
import { Carcinogen, Cancer, CarcinogenCancerLink } from "@/types/carcinogen";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CarcinogenCrudProps {
  carcinogens: Carcinogen[];
  setCarcinogens: (c: Carcinogen[]) => void;
  cancers: Cancer[];
  carcinogenCancerLinks: CarcinogenCancerLink[];
  setCarcinogenCancerLinks: (links: CarcinogenCancerLink[]) => void;
}

export function CarcinogenCrud({ carcinogens, setCarcinogens, cancers, carcinogenCancerLinks, setCarcinogenCancerLinks }: CarcinogenCrudProps) {
  const empty: Omit<Carcinogen, "id"> = { name: "", description: "", type: "", effects: "" };
  const [form, setForm] = useState<Omit<Carcinogen, "id">>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Carcinogen, "id">>(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState(false);

  const filteredCarcinogens = useMemo(() => {
    return carcinogens.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [carcinogens, search]);

  const selectedCarcinogen = filteredCarcinogens.find(c => c.id === selectedId) || null;

  // Add logic
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      setTimeout(() => setError(""), 2000);
      return;
    }
    const { data, error } = await supabase.from("carcinogens").insert([form]).select();
    if (error) {
      setError(error.message);
      setTimeout(() => setError(""), 2000);
    } else {
      setCarcinogens([...carcinogens, ...(data || [])]);
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
    const { error } = await supabase.from("carcinogens").update(editForm).eq("id", id);
    if (error) {
      setError(error.message);
      setTimeout(() => setError(""), 2000);
    } else {
      setCarcinogens(carcinogens.map(c => c.id === id ? { ...c, ...editForm, id } : c));
      setEditId(null);
      setSelectedId(id);
      setSuccess("Saved!");
      setTimeout(() => setSuccess(""), 1500);
    }
  };

  // Delete logic
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("carcinogens").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setTimeout(() => setError(""), 2000);
    } else {
      setCarcinogens(carcinogens.filter(c => c.id !== id));
      setSelectedId(null);
      setSuccess("Deleted!");
      setTimeout(() => setSuccess(""), 1500);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left: Carcinogen list */}
      <div className="w-1/3 bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Carcinogens</h2>
          <Button size="sm" onClick={() => { setAddMode(true); setSelectedId(null); setForm(empty); }}>+ Add</Button>
        </div>
        <Input
          placeholder="Search carcinogens..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarcinogens.map(c => (
                <tr
                  key={c.id}
                  className={`border-b last:border-b-0 cursor-pointer ${selectedId === c.id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                  onClick={() => { setSelectedId(c.id!); setAddMode(false); setEditId(null); }}
                >
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">{c.type}</td>
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
            <h3 className="text-lg font-bold mb-2">Add Carcinogen</h3>
            <form className="flex flex-col gap-2" onSubmit={handleAdd}>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Type (e.g. chemical)"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              />
              <Input
                placeholder="Effects"
                value={form.effects}
                onChange={e => setForm(f => ({ ...f, effects: e.target.value }))}
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
        ) : !selectedCarcinogen ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center text-muted-foreground">
            Select a carcinogen to view details
          </div>
        ) : editId === selectedCarcinogen.id ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-2">Edit Carcinogen</h3>
            <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleEdit(selectedCarcinogen.id!); }}>
              <Input
                placeholder="Name"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Type (e.g. chemical)"
                value={editForm.type}
                onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
              />
              <Input
                placeholder="Effects"
                value={editForm.effects}
                onChange={e => setEditForm(f => ({ ...f, effects: e.target.value }))}
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
              <h3 className="text-lg font-bold">{selectedCarcinogen.name}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditId(selectedCarcinogen.id!); setEditForm({ name: selectedCarcinogen.name, type: selectedCarcinogen.type || "", effects: selectedCarcinogen.effects || "", description: selectedCarcinogen.description || "" }); }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedCarcinogen.id!)}>Delete</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-2">
              <div><span className="font-semibold">Type:</span> {selectedCarcinogen.type}</div>
              <div><span className="font-semibold">Effects:</span> {selectedCarcinogen.effects}</div>
              <div><span className="font-semibold">Description:</span> {selectedCarcinogen.description}</div>
            </div>
            {/* Multi-select for cancers */}
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">Linked Cancers</label>
              <select
                multiple
                className="border rounded px-2 py-2 text-sm w-full"
                value={
                  carcinogenCancerLinks
                    .filter(link => link.carcinogen_id === selectedCarcinogen.id)
                    .map(link => link.cancer_id)
                }
                onChange={async (e) => {
                  const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  await supabase.from("carcinogen_cancer_link").delete().eq("carcinogen_id", selectedCarcinogen.id);
                  if (selected.length > 0) {
                    await supabase.from("carcinogen_cancer_link").insert(
                      selected.map(cancer_id => ({ carcinogen_id: selectedCarcinogen.id, cancer_id }))
                    );
                  }
                  const { data } = await supabase.from("carcinogen_cancer_link").select("*");
                  setCarcinogenCancerLinks(data || []);
                }}
              >
                {cancers.map(cancer => (
                  <option key={cancer.id} value={cancer.id}>{cancer.name}</option>
                ))}
              </select>
            </div>
            {/* List linked cancers */}
            <div>
              <span className="font-semibold">Linked Cancers:</span>
              <ul className="ml-4 list-disc">
                {carcinogenCancerLinks
                  .filter(link => link.carcinogen_id === selectedCarcinogen.id)
                  .map(link => {
                    const cancer = cancers.find(ca => ca.id === link.cancer_id);
                    return cancer ? (
                      <li key={cancer.id}>{cancer.name} <span className="text-xs text-muted-foreground">{cancer.description}</span></li>
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