import React, { useMemo, useState } from "react";
import {
  Plus, Upload, MoreHorizontal, Search, SortAsc, LayoutGrid,
  List, SlidersHorizontal, Download, Rows3, X
} from "lucide-react";

/* ---- Top tabs (like the screenshot header) ---- */
const TOP_TABS = [
  "Production design elements",
  "Animals",
  "Scenes",
  "Sets",
  "Items",
  "Inventories",
  "Settings",
] as const;
type TopTab = typeof TOP_TABS[number];

/* ---- Sub-tabs (row below: All, Constructions, …) ---- */
type PropCategory = "all" | "constructions" | "setDressings" | "props" | "graphics" | "vehicles";

/* ---- Types ---- */
type PropItem = {
  id: number;
  category: Exclude<PropCategory, "all">;
  name: string;
  type?: string;            // e.g., Props
  firstShooting: string;    // YYYY-MM-DD
  shootingDays: number;
  scenes: number;
  image: string;
  note?: string;
};

/* ---- Mock data ---- */
const initialProps: PropItem[] = [
  {
    id: 1,
    category: "graphics",
    name: "Map",
    type: "Props",
    firstShooting: "2023-08-02",
    shootingDays: 4,
    scenes: 2,
    image: "https://images.pexels.com/photos/408503/pexels-photo-408503.jpeg",
  },
  {
    id: 2,
    category: "props",
    name: "Binoculars",
    type: "Props",
    firstShooting: "2023-08-03",
    shootingDays: 1,
    scenes: 1,
    image: "https://images.pexels.com/photos/390808/pexels-photo-390808.jpeg",
  },
  {
    id: 3,
    category: "props",
    name: "Stick",
    type: "Props",
    firstShooting: "2023-08-06",
    shootingDays: 0,
    scenes: 0,
    image: "https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg",
    note: "Is not used yet",
  },
  {
    id: 4,
    category: "setDressings",
    name: "Amulet",
    type: "Props",
    firstShooting: "2023-08-02",
    shootingDays: 5,
    scenes: 4,
    image: "https://images.pexels.com/photos/269633/pexels-photo-269633.jpeg",
  },
];

/* ---- Helpers ---- */
function fmtDate(d: string) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return d; }
}

/* ---- Component ---- */
const PropPage: React.FC = () => {
  const [topTab, setTopTab] = useState<TopTab>("Production design elements");
  const [subTab, setSubTab] = useState<PropCategory>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [propsData, setPropsData] = useState<PropItem[]>(initialProps);

  // filters
  const [minScenes, setMinScenes] = useState<number | "any">("any");
  const [afterDate, setAfterDate] = useState<string>("");

  // modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<PropItem, "id">>({
    category: "props",
    name: "",
    type: "Props",
    firstShooting: "",
    shootingDays: 0,
    scenes: 0,
    image: "",
    note: "",
  });

  const filtered = useMemo(() => {
    let rows = propsData;

    // sub-tab filter
    if (subTab !== "all") rows = rows.filter(r => r.category === subTab);

    // search
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.type && r.type.toLowerCase().includes(q))
      );
    }

    // min scenes
    if (minScenes !== "any") rows = rows.filter(r => r.scenes >= (minScenes as number));

    // first shooting after
    if (afterDate) {
      const a = new Date(afterDate).getTime();
      rows = rows.filter(r => new Date(r.firstShooting).getTime() >= a);
    }

    return rows;
  }, [propsData, subTab, query, minScenes, afterDate]);

  const openCreate = () => {
    setForm({
      category: subTab === "all" ? "props" : (subTab as Exclude<PropCategory, "all">),
      name: "",
      type: "Props",
      firstShooting: "",
      shootingDays: 0,
      scenes: 0,
      image: "",
      note: "",
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({
      ...p,
      [name]:
        name === "scenes" || name === "shootingDays" ? Number(value) :
        name === "category" ? (value as PropItem["category"]) :
        value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const nextId = (propsData.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    setPropsData(prev => [{ id: nextId, ...form }, ...prev]);
    setOpen(false);
  };

  return (
    <div className="w-full">
      {/* Top tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 text-xl font-semibold text-gray-700">
          {TOP_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTopTab(t)}
              className={`pb-3 mt-8 border-b-2 -mb-px ${
                topTab === t ? "border-gray-900 text-gray-900"
                              : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* crumb + title */}
          <div className="px-5 pt-4 text-sm text-gray-500">
            Production design ▸ {topTab}
          </div>
          <div className="px-5 pb-1 pt-1">
            <div className="text-2xl font-semibold text-gray-900">{topTab}</div>
          </div>

          {/* sub-tabs row */}
          <div className="px-5 pb-2 text-sm flex flex-wrap items-center gap-4">
            {[
              { key: "all", label: "All" },
              { key: "constructions", label: "Constructions" },
              { key: "setDressings", label: "Set dressings" },
              { key: "props", label: "Props" },
              { key: "graphics", label: "Graphics" },
              { key: "vehicles", label: "Vehicles" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSubTab(s.key as PropCategory)}
                className={`py-2 -mb-px border-b-2 ${
                  subTab === s.key ? "border-gray-900 text-gray-900"
                                   : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* actions + filters */}
          <div className="px-5 pb-3 flex flex-wrap items-center gap-3">
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2 rounded-md text-sm hover:bg-black">
              <Plus className="w-4 h-4" /> Create production design element
            </button>
            <button className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50">
              <Upload className="w-4 h-4" /> Import CSV
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-64 bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Search props…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Min scenes</span>
                </div>
                <select
                  value={minScenes}
                  onChange={(e) => setMinScenes(e.target.value === "any" ? "any" : Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="any">Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                </select>

                <input
                  type="date"
                  value={afterDate}
                  onChange={(e) => setAfterDate(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                  title="First shooting on/after"
                />
              </div>

              {/* view/sort/misc */}
              <button className="icon-btn" title="Sort"><SortAsc className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={`icon-btn ${view === "list" ? "ring-1 ring-gray-300" : ""}`} title="List view">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setView("grid")} className={`icon-btn ${view === "grid" ? "ring-1 ring-gray-300" : ""}`} title="Grid view">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="icon-btn" title="Tidy up grid"><Rows3 className="w-4 h-4" /></button>
              <button className="icon-btn" title="Export"><Download className="w-4 h-4" /></button>
            </div>

            <style>{`
              .icon-btn{ @apply p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-50; }
            `}</style>
          </div>

          {/* content */}
          {view === "grid" ? (
            <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <PropCard key={p.id} data={p} />)}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-gray-500 p-8 text-center">No results for this tab/filters.</div>
              )}
            </div>
          ) : (
            <div className="p-5">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">No results.</div>
                )}
                {filtered.map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-4 p-4 ${i !== filtered.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <img src={p.image} alt={p.name} className="h-14 w-20 rounded object-cover" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{p.name} <span className="text-gray-500 font-normal">| {p.type || "Item"}</span></div>
                      <div className="text-xs text-gray-500">
                        First shooting: {fmtDate(p.firstShooting)} · Days: {p.shootingDays} · Scenes: {p.scenes}
                      </div>
                      {p.note && <div className="text-xs text-gray-500">{p.note}</div>}
                    </div>
                    <button className="ml-auto p-2 rounded-md hover:bg-gray-50 text-gray-500">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* Create modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Create production design element</h3>
                <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="constructions">Constructions</option>
                    <option value="setDressings">Set dressings</option>
                    <option value="props">Props</option>
                    <option value="graphics">Graphics</option>
                    <option value="vehicles">Vehicles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <input
                    name="type"
                    value={form.type || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">First shooting day</label>
                  <input
                    type="date"
                    name="firstShooting"
                    value={form.firstShooting}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shooting days</label>
                  <input
                    type="number"
                    name="shootingDays"
                    value={form.shootingDays}
                    onChange={handleChange}
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Scenes</label>
                  <input
                    type="number"
                    name="scenes"
                    value={form.scenes}
                    onChange={handleChange}
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Image URL</label>
                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Note (optional)</label>
                  <input
                    name="note"
                    value={form.note || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---- Card ---- */
const PropCard: React.FC<{ data: PropItem }> = ({ data }) => {
  return (
    <div className="group rounded-lg bg-white border border-gray-200 hover:shadow-md transition">
      <div className="p-3">
        <img src={data.image} alt={data.name} className="h-28 w-full rounded object-cover mb-3" />
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{data.name}</div>
            <div className="text-xs text-gray-500">{data.type || "Item"}</div>
          </div>
          <button className="ml-auto p-1.5 rounded-md hover:bg-gray-50 text-gray-500">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-600 space-y-0.5">
          <div>First shooting: {fmtDate(data.firstShooting)}</div>
          <div>Shooting days: {data.shootingDays}</div>
          <div>Scenes: {data.scenes}</div>
          {data.note && <div className="text-gray-500">{data.note}</div>}
        </div>
      </div>
    </div>
  );
};

export default PropPage;
