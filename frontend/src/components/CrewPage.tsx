import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  MoreVertical,
  Edit,
  Eye,
  Filter,
  Search,
  Plus,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react";

/** ---------- Types ---------- */
type Unit = { id: string; name: string };
type DepartmentKey = string;

type CrewType = "User" | "External" | "Vendor";
type CrewMember = {
  id: string;
  name: string;
  position: string;
  type: CrewType;
  email?: string;
  phone?: string;
  department: DepartmentKey;
  unitId?: string;
  hidden?: boolean;
};

type CrewState = { units: Unit[]; members: CrewMember[] };
type EditMode = { enabled: boolean; selectedIds: Set<string> };

type SortKey = "name" | "position" | "type" | "email" | "phone";
type SortDir = "asc" | "desc";

/** ---------- Helpers ---------- */
const LSK = "troupeX_crew_data";
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

const DEFAULT_UNITS: Unit[] = [
  { id: "u1", name: "Unit 1" },
  { id: "u2", name: "Unit 2" },
];

const SEED: CrewMember[] = [
  {
    id: uid(),
    name: "vineeth vc",
    position: "Project administrator, Producer",
    type: "User",
    email: "teluggodfather@gmail.com",
    phone: "+91 87904 60543",
    department: "Production",
    unitId: "u1",
  },
];

function loadState(): CrewState {
  try {
    const raw = localStorage.getItem(LSK);
    if (raw) return JSON.parse(raw) as CrewState;
  } catch {}
  return { units: DEFAULT_UNITS, members: SEED };
}
function saveState(s: CrewState) {
  try {
    localStorage.setItem(LSK, JSON.stringify(s));
  } catch {}
}

function toCSV(rows: CrewMember[], units: Unit[]) {
  const head = ["Name", "Position", "Type", "Email", "Phone", "Department", "Unit", "Hidden"];
  const unitName = (id?: string) => units.find((u) => u.id === id)?.name ?? "";
  const body = rows.map((r) => [
    r.name,
    r.position,
    r.type,
    r.email ?? "",
    r.phone ?? "",
    r.department,
    unitName(r.unitId),
    r.hidden ? "Yes" : "No",
  ]);
  const all = [head, ...body].map((row) =>
    row
      .map((cell) => {
        const v = String(cell ?? "");
        if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
        return v;
      })
      .join(","),
  );
  return all.join("\n");
}
function download(filename: string, data: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

/** ---------- Small UI primitives ---------- */
const TabButton: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={`px-2 md:px-3 py-2 text-sm border-b-2 ${
      active ? "border-black text-black font-medium" : "border-transparent text-gray-600 hover:text-black hover:border-gray-300"
    }`}
  >
    {children}
  </button>
);

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string; icon: React.ReactNode }> = ({
  icon,
  label,
  className = "",
  ...rest
}) => (
  <button
    {...rest}
    className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 ${className}`}
  >
    {icon}
    {label ? <span>{label}</span> : null}
  </button>
);

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded border text-[10px] text-gray-600 bg-gray-50">{children}</kbd>
);

const Menu: React.FC<{ align?: "left" | "right"; items: { label: string; onClick: () => void; danger?: boolean }[] }> = ({
  align = "right",
  items,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div
          className={`absolute mt-1 min-w-[180px] rounded-md border bg-white shadow-lg z-20 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                it.danger ? "text-red-600" : "text-gray-800"
              }`}
              role="menuitem"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** ---------- Dialog ---------- */
const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  open,
  onClose,
  title,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[680px] max-w-[95vw] rounded-xl border bg-white shadow-xl">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button className="px-2 py-1 text-sm rounded-md border" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

/** ---------- Form ---------- */
const CrewForm: React.FC<{
  units: Unit[];
  initial?: Partial<CrewMember>;
  onSubmit: (value: Omit<CrewMember, "id">) => void;
}> = ({ units, initial, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [type, setType] = useState<CrewType>((initial?.type as CrewType) ?? "User");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "Production");
  const [unitId, setUnitId] = useState<string | undefined>(initial?.unitId ?? units[0]?.id);
  const [hidden, setHidden] = useState<boolean>(!!initial?.hidden);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, position, type, email, phone, department, unitId, hidden });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Name</span>
          <input className="border rounded-md px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Position</span>
          <input className="border rounded-md px-3 py-2" value={position} onChange={(e) => setPosition(e.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Type</span>
          <select className="border rounded-md px-3 py-2" value={type} onChange={(e) => setType(e.target.value as CrewType)}>
            <option>User</option>
            <option>External</option>
            <option>Vendor</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Department</span>
          <input className="border rounded-md px-3 py-2" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Email</span>
          <input className="border rounded-md px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Phone</span>
          <input className="border rounded-md px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-600">Unit</span>
          <select className="border rounded-md px-3 py-2" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm mt-2">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          <span>Hidden</span>
        </label>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="submit" className="px-3 py-2 rounded-md bg-black text-white text-sm">
          Save
        </button>
      </div>
    </form>
  );
};

/** ---------- Row & Group ---------- */
const CrewRow: React.FC<{
  m: CrewMember;
  unitName?: string;
  onEdit: (m: CrewMember) => void;
  onToggleHidden: (m: CrewMember) => void;
  onDelete: (m: CrewMember) => void;
  editMode?: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}> = ({ m, unitName, onEdit, onToggleHidden, onDelete, editMode, selected, onSelectChange }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_minmax(0,1fr)_140px_120px] items-center px-3 py-3 border-b">
    <div className="flex items-center gap-3">
      {editMode && (
        <input
          type="checkbox"
          className="mt-0.5"
          checked={!!selected}
          onChange={(e) => onSelectChange?.(e.target.checked)}
          aria-label={`select ${m.name}`}
        />
      )}
      <div className="w-7 h-7 rounded-md bg-gray-200 grid place-items-center text-xs font-medium">
        {m.name.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className={`text-sm truncate ${m.hidden ? "text-gray-400 line-through" : "text-gray-900"}`}>{m.name}</div>
        <div className="text-xs text-gray-500">{unitName || "-"}</div>
      </div>
    </div>

    <div className="text-sm text-gray-700 truncate">{m.position}</div>
    <div className="text-xs text-gray-600">{m.type}</div>
    <div className="text-sm text-gray-700 truncate">{m.email || "-"}</div>
    <div className="text-sm text-gray-700">{m.phone || "-"}</div>

    <div className="flex justify-end items-center gap-1">
      <button className="p-2 rounded hover:bg-gray-100" title="Message">
        <Send className="w-4 h-4" />
      </button>
      <button className="p-2 rounded hover:bg-gray-100" title="Settings">
        <Settings className="w-4 h-4" />
      </button>
      <Menu
        items={[
          { label: "Edit", onClick: () => onEdit(m) },
          { label: m.hidden ? "Unhide" : "Hide", onClick: () => onToggleHidden(m) },
          { label: "Delete", onClick: () => onDelete(m), danger: true },
        ]}
      />
    </div>
  </div>
);

const DepartmentGroup: React.FC<{
  name: DepartmentKey;
  rows: CrewMember[];
  units: Unit[];
  collapsed: boolean;
  onToggle: () => void;
  editMode: EditMode;
  setEditMode: React.Dispatch<React.SetStateAction<EditMode>>;
  onEdit: (m: CrewMember) => void;
  onToggleHidden: (m: CrewMember) => void;
  onDelete: (m: CrewMember) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  setSort: (key: SortKey) => void;
}> = ({ name, rows, units, collapsed, onToggle, editMode, setEditMode, onEdit, onToggleHidden, onDelete, sortKey, sortDir, setSort }) => {
  const unitName = (id?: string) => units.find((u) => u.id === id)?.name ?? "";

  const HeaderCell: React.FC<{ k: SortKey; children: React.ReactNode }> = ({ k, children }) => (
    <button
      className={`uppercase text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 ${sortKey === k ? "font-semibold" : ""}`}
      onClick={() => setSort(k)}
      title="Sort"
    >
      {children}
      {sortKey === k ? <ChevronDown className={`w-3 h-3 ${sortDir === "asc" ? "" : "rotate-180"}`} /> : null}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
        <button className="inline-flex items-center gap-2" onClick={onToggle}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="font-medium text-sm">{name}</span>
          <span className="text-xs text-gray-500">({rows.length})</span>
        </button>
        <Menu
          items={[
            { label: "Collapse/Expand", onClick: onToggle },
          ]}
        />
      </div>

      {!collapsed && (
        <div role="table" aria-label={`${name} crew`} className="divide-y">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_minmax(0,1fr)_140px_120px] px-3 py-2 bg-white sticky top-0 z-10">
            <HeaderCell k="name">Name</HeaderCell>
            <HeaderCell k="position">Position</HeaderCell>
            <HeaderCell k="type">Type</HeaderCell>
            <HeaderCell k="email">Email</HeaderCell>
            <HeaderCell k="phone">Phone (office)</HeaderCell>
            <div className="text-xs text-gray-500 uppercase">Actions</div>
          </div>

          {rows.map((m) => (
            <CrewRow
              key={m.id}
              m={m}
              unitName={unitName(m.unitId)}
              onEdit={onEdit}
              onToggleHidden={onToggleHidden}
              onDelete={onDelete}
              editMode={editMode.enabled}
              selected={editMode.selectedIds.has(m.id)}
              onSelectChange={(checked) =>
                setEditMode((s) => {
                  const next = new Set(s.selectedIds);
                  if (checked) next.add(m.id);
                  else next.delete(m.id);
                  return { ...s, selectedIds: next };
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** ---------- Page ---------- */
const TABS = ["Crew list", "Access rights", "External contacts", "Recruitment", "Departments", "Units"] as const;
type Tab = (typeof TABS)[number];

const CrewPage: React.FC = () => {
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  // state
  const [state, setState] = useState<CrewState>(() => loadState());
  const [tab, setTab] = useState<Tab>("Crew list");
  const [query, setQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>({ enabled: false, selectedIds: new Set() });
  const [unitId, setUnitId] = useState<string | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | CrewType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | CrewMember>(null);

  useEffect(() => saveState(state), [state]);

  /** sorting */
  const setSort = (k: SortKey) => {
    setSortKey((prevK) => {
      if (prevK === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDir("asc");
      return k;
    });
  };

  /** derived list */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = state.members
      .filter((m) => (showHidden ? true : !m.hidden))
      .filter((m) => (unitId === "all" ? true : m.unitId === unitId))
      .filter((m) => (typeFilter === "all" ? true : m.type === typeFilter))
      .filter((m) => {
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.position.toLowerCase().includes(q) ||
          (m.email ?? "").toLowerCase().includes(q) ||
          (m.phone ?? "").toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q)
        );
      });

    const cmp = (a: CrewMember, b: CrewMember) => {
      const A = String(a[sortKey] ?? "").toLowerCase();
      const B = String(b[sortKey] ?? "").toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return a.name.localeCompare(b.name); // tiebreaker stable
    };

    return list.sort(cmp);
  }, [state.members, query, showHidden, unitId, typeFilter, sortKey, sortDir]);

  // group by department
  const groups = useMemo(() => {
    const map = new Map<DepartmentKey, CrewMember[]>();
    for (const m of filtered) {
      if (!map.has(m.department)) map.set(m.department, []);
      map.get(m.department)!.push(m);
    }
    const keys = Array.from(map.keys()).sort((a, b) => {
      if (a === "Production") return -1;
      if (b === "Production") return 1;
      return a.localeCompare(b);
    });
    return keys.map((k) => ({ name: k, rows: map.get(k)! }));
  }, [filtered]);

  /** actions (CRUD) */
  const addMember = (v: Omit<CrewMember, "id">) =>
    setState((s) => ({ ...s, members: [...s.members, { id: uid(), ...v }] }));

  const updateMember = (id: string, v: Omit<CrewMember, "id">) =>
    setState((s) => ({ ...s, members: s.members.map((m) => (m.id === id ? { ...m, ...v } : m)) }));

  const toggleHidden = (m: CrewMember) =>
    setState((s) => ({ ...s, members: s.members.map((x) => (x.id === m.id ? { ...x, hidden: !x.hidden } : x)) }));

  const removeMember = (m: CrewMember) =>
    setState((s) => ({ ...s, members: s.members.filter((x) => x.id !== m.id) }));

  const exportCSV = () => download("crew.csv", toCSV(filtered, state.units));

  /** Export PNG (screenshot-like) */
  const exportPNG = async () => {
    try {
      const node = surfaceRef.current!;
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "crew-page.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("To export as image, install: npm i html-to-image");
      console.error(e);
    }
  };

  /** bulk actions */
  const selected = editMode.selectedIds;
  const hasSel = selected.size > 0;

  const bulkHide = (val: boolean) =>
    setState((s) => ({
      ...s,
      members: s.members.map((m) => (selected.has(m.id) ? { ...m, hidden: val } : m)),
    }));
  const bulkDelete = () =>
    setState((s) => ({
      ...s,
      members: s.members.filter((m) => !selected.has(m.id)),
    }));

  /** UI */
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top breadcrumb-like header row to match screenshot spacing */}
      <div className="max-w-6xl mx-auto pt-3 text-xs text-gray-500 px-3">
        Crew &nbsp;›&nbsp; <span className="text-gray-700">Crew list</span>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mt-1 px-3 border-b">
        <div className="flex items-center gap-4">
          {(TABS as readonly string[]).map((t) => (
            <TabButton key={t} active={tab === (t as Tab)} onClick={() => setTab(t as Tab)}>
              {t}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-6xl mx-auto px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="pl-9 pr-8 py-2 text-sm rounded-md border bg-white w-64"
            />
            {query && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Collapse & Show hidden (icon-first like screenshot) */}
          <IconButton
            icon={<ChevronDown className="w-4 h-4" />}
            label={collapseAll ? "Expand All" : "Collapse All"}
            onClick={() => setCollapseAll((c) => !c)}
            title={`${collapseAll ? "Expand" : "Collapse"} all (toggle)`}
          />
          <IconButton
            icon={<Eye className="w-4 h-4" />}
            label={showHidden ? "Hide hidden elements" : "Show hidden elements"}
            onClick={() => setShowHidden((s) => !s)}
          />

          {/* Type filter */}
          <div className="flex items-center gap-1 ml-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-sm border rounded-md px-2 py-2 bg-white"
              title="Type"
            >
              <option value="all">All types</option>
              <option value="User">User</option>
              <option value="External">External</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          <div className="grow" />

          {/* Right controls: Export, Add, Edit, Unit, User bubble, Page selector */}
          <IconButton icon={<Download className="w-4 h-4" />} label="Export" onClick={exportCSV} />
          <IconButton icon={<Download className="w-4 h-4" />} label="Export PNG" onClick={exportPNG} />

          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>

          <IconButton
            icon={<Edit className="w-4 h-4" />}
            label={editMode.enabled ? "Done" : "Edit"}
            onClick={() => setEditMode((s) => ({ enabled: !s.enabled, selectedIds: new Set() }))}
          />

          {/* Unit switcher (to the right, compact) */}
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value as any)}
            className="text-sm border rounded-md px-2 py-2 bg-white"
            title="Units"
          >
            <option value="all">All units</option>
            {state.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Fake user bubble & page counter to match screenshot vibe */}
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white grid place-items-center font-semibold">W</div>
          <div className="px-2 py-1 text-xs border rounded-md">1</div>
        </div>

        {/* Bulk bar */}
        {editMode.enabled && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-gray-600">
              {hasSel ? `${selected.size} selected` : "Select rows to apply bulk actions"}
            </span>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button
              disabled={!hasSel}
              className={`px-2 py-1 rounded border ${hasSel ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}
              onClick={() => bulkHide(true)}
            >
              Hide
            </button>
            <button
              disabled={!hasSel}
              className={`px-2 py-1 rounded border ${hasSel ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}
              onClick={() => bulkHide(false)}
            >
              Unhide
            </button>
            <button
              disabled={!hasSel}
              className={`px-2 py-1 rounded border inline-flex items-center gap-1 ${
                hasSel ? "bg-white hover:bg-red-50 text-red-600" : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
              onClick={bulkDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content surface (captured for PNG) */}
      <div className="max-w-6xl mx-auto px-3 pb-10" ref={surfaceRef}>
        {tab !== "Crew list" ? (
          <div className="p-6 rounded-lg border bg-white">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{tab}</span> — stub. Wire your {tab.toLowerCase()} logic here.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="rounded-lg border bg-white p-10 text-center text-sm text-gray-500">
                No crew found. Add people to see them here.
              </div>
            ) : (
              groups.map((g) => (
                <DepartmentGroup
                  key={g.name}
                  name={g.name}
                  rows={g.rows}
                  units={state.units}
                  collapsed={collapseAll}
                  onToggle={() => setCollapseAll((c) => !c)}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  onEdit={(m) => setEditOpen(m)}
                  onToggleHidden={(m) =>
                    setState((s) => ({
                      ...s,
                      members: s.members.map((x) => (x.id === m.id ? { ...x, hidden: !x.hidden } : x)),
                    }))
                  }
                  onDelete={(m) => setState((s) => ({ ...s, members: s.members.filter((x) => x.id !== m.id) }))}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  setSort={setSort}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add crew member">
        <CrewForm
          units={state.units}
          onSubmit={(v) => {
            addMember(v);
            setAddOpen(false);
          }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editOpen} onClose={() => setEditOpen(null)} title="Edit crew member">
        {editOpen && (
          <CrewForm
            units={state.units}
            initial={editOpen}
            onSubmit={(v) => {
              updateMember(editOpen.id, v);
              setEditOpen(null);
            }}
          />
        )}
      </Modal>

      {/* Footer hint (dev only) */}
      <div className="max-w-6xl mx-auto px-3 pb-6 text-[11px] text-gray-500">
        Tip: Press <Kbd>Cmd</Kbd>/<Kbd>Ctrl</Kbd> + <Kbd>P</Kbd> to print to PDF if you don’t need PNG.
      </div>
    </div>
  );
};

export default CrewPage;
