// CastPage.tsx
import React, { useMemo, useState } from "react";
import {
  Plus, Upload, MoreHorizontal, Search, SortAsc, LayoutGrid,
  List, CheckSquare, SlidersHorizontal, Download, Rows3, X
} from "lucide-react";

/* ---- Tabs / Categories ---- */
type Category =
  | "characters"
  | "extras"
  | "actors"
  | "otherTalents"
  | "agencies"
  | "dood"; // Day Out of Days (can show all or dedicated rows later)

const TABS: { key: Category; label: string }[] = [
  { key: "characters",   label: "Characters" },
  { key: "extras",       label: "Extras" },
  { key: "actors",       label: "Actors" },
  { key: "otherTalents", label: "Other Talents" },
  { key: "agencies",     label: "Agencies" },
  { key: "dood",         label: "Day Out of Days" },
];

/* ---- Types ---- */
type CastMember = {
  id: number;
  category: Category;
  name: string;
  actor?: string;                 // optional if name is the role
  firstShooting: string;          // YYYY-MM-DD
  shootingDays: number;
  image: string;
  tags?: string[];
  gallery?: string[];             // small face chips
};

/* ---- Mock Data (seeded with categories) ---- */
const initialCast: CastMember[] = [
  {
    id: 1, category: "characters",
    name: "James", actor: "John Doe Jr",
    firstShooting: "2023-08-01", shootingDays: 6,
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
    gallery: [
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
    ],
  },
  {
    id: 2, category: "characters",
    name: "Farah", actor: "Sarah Golightly",
    firstShooting: "2023-08-02", shootingDays: 2,
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    id: 3, category: "characters",
    name: "Farid", actor: "Mouhtana Rota",
    firstShooting: "2023-08-01", shootingDays: 6,
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
  },
  {
    id: 4, category: "extras",
    name: "Head Waiter",
    firstShooting: "2023-08-01", shootingDays: 2,
    image: "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg",
  },
  {
    id: 5, category: "characters",
    name: "Lady Hendersen",
    firstShooting: "2023-08-01", shootingDays: 1,
    image: "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg",
    gallery: [
      "https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg",
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    ],
  },
  {
    id: 6, category: "actors",
    name: "Sultan", actor: "Alejandro Bardem",
    firstShooting: "2023-08-01", shootingDays: 2,
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
  },
  {
    id: 7, category: "characters",
    name: "Guard", actor: "Steve Vernon",
    firstShooting: "2023-08-03", shootingDays: 1,
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
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
const CastPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>("characters");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cast, setCast] = useState<CastMember[]>(initialCast);

  // simple filters
  const [minDays, setMinDays] = useState<number | "any">("any");
  const [afterDate, setAfterDate] = useState<string>(""); // YYYY-MM-DD

  // modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<CastMember, "id">>({
    category: "characters",
    name: "",
    actor: "",
    firstShooting: "",
    shootingDays: 1,
    image: "",
    tags: [],
    gallery: [],
  });

  // apply tab -> search -> filters
  const filtered = useMemo(() => {
    let rows = cast;

    // Tab filter
    if (activeTab !== "dood") {
      rows = rows.filter(r => r.category === activeTab);
    }
    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.actor && c.actor.toLowerCase().includes(q))
      );
    }
    // Min shooting days
    if (minDays !== "any") {
      rows = rows.filter(c => c.shootingDays >= (minDays as number));
    }
    // After date
    if (afterDate) {
      const a = new Date(afterDate).getTime();
      rows = rows.filter(c => new Date(c.firstShooting).getTime() >= a);
    }
    return rows;
  }, [cast, activeTab, query, minDays, afterDate]);

  // open modal and default category to active tab
  const openCreate = () => {
    setForm({
      category: activeTab === "dood" ? "characters" : activeTab, // store under a real bucket
      name: "",
      actor: "",
      firstShooting: "",
      shootingDays: 1,
      image: "",
      tags: [],
      gallery: [],
    });
    setOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        name === "shootingDays" ? Number(value) :
        name === "category" ? (value as Category) :
        value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const nextId = (cast.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    setCast((prev) => [{ id: nextId, ...form }, ...prev]);
    setOpen(false);
  };

  return (
    <div className="w-full">
      {/* Top Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 text-xl font-semibold text-gray-700">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-3 mt-8 border-b-2 -mb-px ${
                activeTab === t.key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inner panel */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Crumb + Title */}
          <div className="px-5 pt-4 text-sm text-gray-500">
            Cast ▸ {TABS.find(t => t.key === activeTab)?.label}
          </div>
          <div className="px-5 pb-3 pt-1">
            <div className="text-2xl font-semibold text-gray-900">
              {TABS.find(t => t.key === activeTab)?.label}
            </div>
          </div>

          {/* Actions + Filters */}
          <div className="px-5 pb-3 flex flex-wrap items-center gap-3">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2 rounded-md text-sm hover:bg-black"
            >
              <Plus className="w-4 h-4" /> Create {TABS.find(t => t.key === activeTab)?.label.slice(0, -1) || "item"}
            </button>
            <button className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50">
              <Upload className="w-4 h-4" /> Import characters from screenplay
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-64 bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Search name or actor"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Min days</span>
                </div>
                <select
                  value={minDays}
                  onChange={(e) =>
                    setMinDays(e.target.value === "any" ? "any" : Number(e.target.value))
                  }
                  className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="any">Any</option>
                  <option value={1}>1+</option>
                  <option value={2}>2+</option>
                  <option value={3}>3+</option>
                  <option value={5}>5+</option>
                </select>

                <input
                  type="date"
                  value={afterDate}
                  onChange={(e) => setAfterDate(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                  title="First shooting on/after"
                />
              </div>

              {/* View / sort / misc */}
              <button className="icon-btn" title="Sort">
                <SortAsc className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`icon-btn ${view === "list" ? "ring-1 ring-gray-300" : ""}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                className={`icon-btn ${view === "grid" ? "ring-1 ring-gray-300" : ""}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="icon-btn" title="Tidy up grid">
                <Rows3 className="w-4 h-4" />
              </button>
              <button className="icon-btn" title="Export">
                <Download className="w-4 h-4" />
              </button>
            </div>

            <style>{`
              .icon-btn{
                @apply p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-50;
              }
            `}</style>
          </div>

          {/* Content */}
          {view === "grid" ? (
            <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CastCard key={c.id} data={c} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-gray-500 p-8 text-center">
                  No results for this tab/filters.
                </div>
              )}
            </div>
          ) : (
            <div className="p-5">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">No results.</div>
                )}
                {filtered.map((c, i) => (
                  <div
                    key={c.id}
                    className={`flex items-center gap-4 p-4 ${
                      i !== filtered.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <img src={c.image} alt={c.name} className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {c.name}
                        {c.actor && <span className="text-gray-500 font-normal"> | {c.actor}</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        First shooting day: {fmtDate(c.firstShooting)} · Shooting days: {c.shootingDays}
                      </div>
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

      {/* Create Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Create {TABS.find(t => t.key === (activeTab === "dood" ? "characters" : activeTab))?.label.slice(0, -1)}</h3>
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
                    {TABS.filter(t => t.key !== "dood").map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name / Role</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Actor (optional)</label>
                  <input
                    name="actor"
                    value={(form.actor as string) || ""}
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
                  <select
                    name="shootingDays"
                    value={form.shootingDays}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
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

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
                  >
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
const CastCard: React.FC<{ data: CastMember }> = ({ data }) => {
  return (
    <div className="group rounded-lg bg-white border border-gray-200 hover:shadow-md transition">
      <div className="flex gap-3 p-3">
        <img src={data.image} alt={data.name} className="h-24 w-24 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">{data.name}</div>
              {data.actor && <div className="text-xs text-gray-500 truncate">{data.actor}</div>}
            </div>
            <button className="ml-auto p-1.5 rounded-md hover:bg-gray-50 text-gray-500">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
            <div>First shooting day: {fmtDate(data.firstShooting)}</div>
            <div>Shooting days: {data.shootingDays}</div>
          </div>
          {data.gallery && data.gallery.length > 0 && (
            <div className="mt-2 flex -space-x-2">
              {data.gallery.slice(0, 5).map((src, i) => (
                <img key={i} src={src} className="h-6 w-6 rounded-full ring-2 ring-white object-cover" />
              ))}
              {data.gallery.length > 5 && (
                <div className="h-6 w-6 rounded-full bg-gray-100 text-[10px] flex items-center justify-center ring-2 ring-white text-gray-600">
                  +{data.gallery.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CastPage;
