import React, { useMemo, useState } from "react";
import {
  Shirt,
  Plus,
  Search as SearchIcon,
  Filter,
  Tag,
  User,
  Calendar,
  X,
  CheckSquare,
  Square,
  SortAsc,
  List,
  LayoutGrid,
  Download,
  MoreHorizontal,
} from "lucide-react";

/* ---------------- Types ---------------- */
type Costume = {
  id: number;
  character: string;
  scene: string;
  outfit: string;
  description: string;
  size: string;
  status: "Ready" | "In Progress" | "Approved" | "Needs Fitting" | string;
  fittingDate: string;
  designer: string;
  notes?: string;
  image: string;
};

/* --------------- Component -------------- */
const CostumeDesign: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState("all");

  const characters = [
    "All Characters",
    "Rahul Kumar",
    "Radha Shanthi",
    "Sai Simba",
    "Supporting Cast",
  ];

  const [costumes, setCostumes] = useState<Costume[]>([
    {
      id: 1000,
      character: "Character 3 Farid",
      scene: "Scene 18-20",
      outfit: "Farid 1",
      description: "Muted textures, layered casuals",
      size: "L",
      status: "Ready",
      fittingDate: "2024-04-15",
      designer: "Priya Costume Design",
      notes: "Slight alteration needed on sleeves",
      image:
        "https://images.pexels.com/photos/130464/pexels-photo-130464.jpeg",
    },
    {
      id: 1001,
      character: "Character 1 James",
      scene: "Scene 18-20",
      outfit: "James 1",
      description: "Outfit grid, shirt + tie",
      size: "M",
      status: "Approved",
      fittingDate: "2024-04-12",
      designer: "Urban Style House",
      notes: "Perfect fit, ready for shoot",
      image:
        "https://images.pexels.com/photos/1532771/pexels-photo-1532771.jpeg",
    },
    {
      id: 1002,
      character: "Character 2 Farah",
      scene: "Scene 18-25",
      outfit: "Farah 1",
      description: "Soft knit + red accents",
      size: "M",
      status: "In Progress",
      fittingDate: "2024-04-18",
      designer: "Meera Textiles",
      notes: "Final touch-ups in progress",
      image:
        "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
    },
    {
      id: 1003,
      character: "Character 4 Head Waiter",
      scene: "Scene 35-40",
      outfit: "Waiter",
      description: "White shirt, black apron",
      size: "L",
      status: "Needs Fitting",
      fittingDate: "2024-04-20",
      designer: "Traditional Crafts",
      notes: "Waiting for character approval",
      image:
        "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
    },
    {
      id: 1004,
      character: "Character 7 Guard",
      scene: "Scene 23-30",
      outfit: "Guard",
      description: "Hi-viz vest",
      size: "L",
      status: "Ready",
      fittingDate: "2024-04-10",
      designer: "Priya Costume Design",
      image:
        "https://images.pexels.com/photos/89432/pexels-photo-89432.jpeg",
    },
  ]);

  /* ---------- UI State ---------- */
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [multi, setMulti] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "outfit" | "id" | "character" | "status"
  >("outfit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // modal form
  const [form, setForm] = useState<Omit<Costume, "id">>({
    character: "Rahul Kumar",
    scene: "",
    outfit: "",
    description: "",
    size: "M",
    status: "In Progress",
    fittingDate: "",
    designer: "",
    notes: "",
    image: "",
  });

  /* ---------- Helpers ---------- */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Needs Fitting":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const exportCSV = () => {
    const rows = (selectedIds.length
      ? filteredCostumes.filter((c) => selectedIds.includes(c.id))
      : filteredCostumes
    ).map((c) => ({
      ID: c.id,
      Outfit: c.outfit,
      Character: c.character,
      Scene: c.scene,
      Size: c.size,
      Status: c.status,
      FittingDate: c.fittingDate,
      Designer: c.designer,
      Notes: c.notes ?? "",
      Image: c.image,
    }));

    if (rows.length === 0) return;

    const header = Object.keys(rows[0]).join(",");
    const body = rows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "costumes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Filtering + Sorting ---------- */
  const filteredCostumes = useMemo(() => {
    let rows =
      selectedCharacter === "all" || selectedCharacter === "All Characters"
        ? costumes
        : costumes.filter((c) => c.character.includes(selectedCharacter));

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.outfit.toLowerCase().includes(q) ||
          c.character.toLowerCase().includes(q) ||
          c.scene.toLowerCase().includes(q) ||
          String(c.id).includes(q)
      );
    }

    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av =
        sortBy === "id" ? a.id : (a as any)[sortBy]?.toString()?.toLowerCase();
      const bv =
        sortBy === "id" ? b.id : (b as any)[sortBy]?.toString()?.toLowerCase();

      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return rows;
  }, [costumes, selectedCharacter, query, sortBy, sortDir]);

  /* ---------- Handlers ---------- */
  const handleOpen = () => {
    setForm({
      character: "Rahul Kumar",
      scene: "",
      outfit: "",
      description: "",
      size: "M",
      status: "In Progress",
      fittingDate: "",
      designer: "",
      notes: "",
      image: "",
    });
    setOpen(true);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.outfit || !form.character) return;

    const nextId = (costumes.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    const fallbackImage =
      "https://images.pexels.com/photos/373966/pexels-photo-373966.jpeg";

    const newCostume: Costume = {
      id: nextId,
      character: form.character,
      scene: form.scene || "Scene TBD",
      outfit: form.outfit,
      description: form.description || "—",
      size: form.size || "M",
      status: form.status || "In Progress",
      fittingDate: form.fittingDate || "",
      designer: form.designer || "—",
      notes: form.notes,
      image: form.image || fallbackImage,
    };

    setCostumes((prev) => [newCostume, ...prev]);
    setOpen(false);
  };

  const cycleSort = () => {
    // Example: outfit → id → character → status → outfit …
    const order: typeof sortBy[] = ["outfit", "id", "character", "status"];
    const next = order[(order.indexOf(sortBy) + 1) % order.length];
    setSortBy(next);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6">
      {/* Toolbar: title + create */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">Character outfits</div>
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Create character outfit
        </button>
      </div>

      {/* Actions row like screenshot (icons with tiny labels) */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72 rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {/* Character filter dropdown (kept from your original) */}
        <select
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          {characters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Right-side icon buttons */}
        <div className="ml-auto flex items-center gap-2">
          {/* Select multiple */}
          <button
            onClick={() => {
              setMulti((m) => !m);
              clearSelection();
            }}
            className={`icon-btn ${multi ? "ring-1 ring-gray-300" : ""}`}
            title="Select multiple"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="icon-label">Select multiple</span>
          </button>

          {/* Sort */}
          <button
            onClick={() => {
              if (sortBy === "outfit") {
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              } else {
                setSortDir("asc");
              }
              cycleSort();
            }}
            className="icon-btn"
            title="Sort"
          >
            <SortAsc className="h-4 w-4" />
            <span className="icon-label">
              Sort ({sortBy}/{sortDir})
            </span>
          </button>

          {/* List / Grid toggle */}
          <button
            onClick={() => setView("list")}
            className={`icon-btn ${view === "list" ? "ring-1 ring-gray-300" : ""}`}
            title="List view"
          >
            <List className="h-4 w-4" />
            <span className="icon-label">List view</span>
          </button>
          <button
            onClick={() => setView("grid")}
            className={`icon-btn ${view === "grid" ? "ring-1 ring-gray-300" : ""}`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="icon-label">Grid</span>
          </button>

          {/* Export */}
          <button onClick={exportCSV} className="icon-btn" title="Export">
            <Download className="h-4 w-4" />
            <span className="icon-label">Export</span>
          </button>
        </div>

        {/* little utility styles for icon buttons */}
        <style>{`
          .icon-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid rgb(209 213 219);
            background: white;
            color: rgb(107 114 128);
          }
          .icon-btn:hover { background: rgb(249 250 251); color: rgb(55 65 81); }
          .icon-label { font-size: 11px; }
        `}</style>
      </div>

      {/* Cards / List */}
      {view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCostumes.map((c) => (
            <CardRow
              key={c.id}
              costume={c}
              multi={multi}
              selected={selectedIds.includes(c.id)}
              onToggleSelect={() => toggleSelected(c.id)}
              getStatusColor={getStatusColor}
            />
          ))}
          {filteredCostumes.length === 0 && (
            <div className="col-span-full rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              No results found.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {filteredCostumes.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">No results found.</div>
          )}
          {filteredCostumes.map((c, i) => (
            <ListRow
              key={c.id}
              costume={c}
              isLast={i === filteredCostumes.length - 1}
              multi={multi}
              selected={selectedIds.includes(c.id)}
              onToggleSelect={() => toggleSelected(c.id)}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      {/* Quick Stats (kept) */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <Shirt className="mx-auto mb-2 h-8 w-8 text-blue-600" />
          <p className="text-2xl font-bold text-gray-900">{costumes.length}</p>
          <p className="text-sm text-gray-600">Total Costumes</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <span className="text-sm font-bold text-white">✓</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {costumes.filter((c) => c.status === "Ready").length}
          </p>
          <p className="text-sm text-gray-600">Ready</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
            <span className="text-sm font-bold text-white">⏳</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {costumes.filter((c) => c.status === "In Progress").length}
          </p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
            <span className="text-sm font-bold text-white">📅</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {costumes.filter((c) => c.status === "Needs Fitting").length}
          </p>
          <p className="text-sm text-gray-600">Fittings Due</p>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create character outfit
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2"
              >
                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Character
                  </label>
                  <input
                    name="character"
                    value={form.character}
                    onChange={handleChange}
                    placeholder="e.g., Character 1 James"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Scene
                  </label>
                  <input
                    name="scene"
                    value={form.scene}
                    onChange={handleChange}
                    placeholder="e.g., Scene 12-14"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Outfit
                  </label>
                  <input
                    name="outfit"
                    value={form.outfit}
                    onChange={handleChange}
                    placeholder="e.g., Farah 1"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Size
                  </label>
                  <select
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  >
                    {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-600">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short description of the outfit"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  >
                    {["In Progress", "Ready", "Approved", "Needs Fitting"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Fitting Date
                  </label>
                  <input
                    name="fittingDate"
                    type="date"
                    value={form.fittingDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Designer
                  </label>
                  <input
                    name="designer"
                    value={form.designer}
                    onChange={handleChange}
                    placeholder="e.g., Priya Costume Design"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Image URL
                  </label>
                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-600">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Any additional notes"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black"
                  >
                    Save Outfit
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

/* ---------------- Presentational rows ---------------- */

function CardRow(props: {
  costume: Costume;
  multi: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  getStatusColor: (s: string) => string;
}) {
  const { costume, multi, selected, onToggleSelect, getStatusColor } = props;
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* left image */}
      <div className="h-32 w-1/3">
        <img src={costume.image} alt={costume.outfit} className="h-full w-full object-cover" />
      </div>

      {/* right content */}
      <div className="flex-1 p-4">
        <div className="flex items-start gap-2">
          {multi && (
            <button
              onClick={onToggleSelect}
              className={`mt-0.5 rounded border p-1 ${selected ? "bg-gray-900 text-white border-gray-900" : "text-gray-500 border-gray-300 hover:bg-gray-50"}`}
              aria-label="select card"
            >
              {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            </button>
          )}

          <div className="min-w-0">
            <div className="truncate font-semibold text-gray-900">
              {costume.outfit}
            </div>
            <div className="truncate text-sm text-gray-500">
              ID {costume.id} | {costume.character}
            </div>
          </div>
          <button className="ml-auto rounded p-1.5 text-gray-500 hover:bg-gray-50">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span className="truncate">{costume.scene}</span>
          <span className={`rounded-full px-2 py-0.5 font-medium ${getStatusColor(costume.status)}`}>
            {costume.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function ListRow(props: {
  costume: Costume;
  isLast: boolean;
  multi: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  getStatusColor: (s: string) => string;
}) {
  const { costume, isLast, multi, selected, onToggleSelect, getStatusColor } = props;
  return (
    <div className={`flex items-center gap-4 p-4 ${isLast ? "" : "border-b border-gray-100"}`}>
      {multi && (
        <button
          onClick={onToggleSelect}
          className={`rounded border p-1 ${selected ? "bg-gray-900 text-white border-gray-900" : "text-gray-500 border-gray-300 hover:bg-gray-50"}`}
          aria-label="select row"
        >
          {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </button>
      )}
      <img src={costume.image} alt={costume.outfit} className="h-14 w-20 rounded object-cover" />
      <div className="min-w-0">
        <div className="truncate font-medium text-gray-900">{costume.outfit}</div>
        <div className="truncate text-xs text-gray-500">
          ID {costume.id} | {costume.character}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-gray-600">{costume.scene}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(costume.status)}`}>
          {costume.status}
        </span>
        <button className="rounded p-1.5 text-gray-500 hover:bg-gray-50">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default CostumeDesign;
