import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Filter,
  MoreVertical,
  Plus,
  Calendar,
  User,
  X,
  CheckCircle2,
  Circle,
  MoreVertical as EllipsisVertical,
} from "lucide-react";

/** ---------------- Types ---------------- */
type ID = string;
type Status = "Uncompleted" | "Completed";
type Priority = "low" | "medium" | "high";

type Subtask = { id: ID; title: string; done: boolean };
type Task = {
  id: ID;
  title: string;
  description?: string;
  deadline?: string; // ISO date
  assignees: string[]; // user ids
  createdBy: string; // user id
  status: Status;
  priority: Priority;
  subtasks: Subtask[];
};

type TasksState = { users: { id: string; name: string; initials: string }[]; tasks: Task[] };

/** ---------------- Storage & seed ---------------- */
const LSK = "troupeX_tasks_data";
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

const USERS = [
  { id: "me", name: "You", initials: "Y" },
  { id: "aa", name: "Ava Adams", initials: "AA" },
  { id: "js", name: "James Stone", initials: "JS" },
];

const SEED_TASKS: Task[] = [
  {
    id: uid(),
    title: "Drone footage test",
    deadline: isoShiftDays(-5), // overdue by 5
    assignees: [],
    createdBy: "me",
    status: "Uncompleted",
    priority: "low",
    subtasks: [],
  },
  {
    id: uid(),
    title: "Costume issue",
    deadline: isoShiftDays(-3),
    assignees: ["aa", "js"],
    createdBy: "me",
    status: "Uncompleted",
    priority: "medium",
    subtasks: [],
  },
  {
    id: uid(),
    title: "Finalize props",
    deadline: isoShiftDays(12),
    assignees: [],
    createdBy: "aa",
    status: "Uncompleted",
    priority: "medium",
    subtasks: [{ id: uid(), title: "Confirm vendor", done: false }],
  },
  {
    id: uid(),
    title: "Steadicam test",
    deadline: isoShiftDays(19),
    assignees: ["js"],
    createdBy: "aa",
    status: "Uncompleted",
    priority: "low",
    subtasks: [],
  },
  {
    id: uid(),
    title: "Cast James",
    deadline: isoShiftDays(-1),
    assignees: ["js"],
    createdBy: "me",
    status: "Completed",
    priority: "high",
    subtasks: [],
  },
  {
    id: uid(),
    title: "Rewrite",
    deadline: isoShiftDays(0),
    assignees: ["js"],
    createdBy: "me",
    status: "Completed",
    priority: "high",
    subtasks: [],
  },
];

function isoShiftDays(delta: number) {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function load(): TasksState {
  try {
    const raw = localStorage.getItem(LSK);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { users: USERS, tasks: SEED_TASKS };
}
function save(s: TasksState) {
  try {
    localStorage.setItem(LSK, JSON.stringify(s));
  } catch {}
}

/** ---------------- Small UI ---------------- */
const ToolbarBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode }> = ({
  icon,
  children,
  className = "",
  ...rest
}) => (
  <button
    {...rest}
    className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 ${className}`}
  >
    {icon}
    {children ? <span>{children}</span> : null}
  </button>
);

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded border text-[10px] text-gray-600 bg-gray-50">{children}</kbd>
);

const PriorityBar: React.FC<{ p: Priority }> = ({ p }) => {
  const c =
    p === "high" ? "bg-green-600" : p === "medium" ? "bg-yellow-500" : "bg-pink-500";
  return <div className={`w-1 h-8 rounded ${c}`} />;
};

const AvatarStack: React.FC<{ ids: string[]; users: TasksState["users"] }> = ({ ids, users }) => {
  if (!ids.length) return <span className="text-xs text-gray-400">—</span>;
  const items = ids.slice(0, 3);
  const extra = ids.length - items.length;
  return (
    <div className="flex -space-x-2">
      {items.map((id) => {
        const u = users.find((x) => x.id === id);
        if (!u) return null;
        return (
          <div
            key={id}
            className="w-6 h-6 rounded-full border border-white bg-gray-700 text-white text-[10px] grid place-items-center"
            title={u.name}
          >
            {u.initials}
          </div>
        );
      })}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full border border-white bg-gray-200 text-[10px] grid place-items-center">+{extra}</div>
      )}
    </div>
  );
};

const RowMenu: React.FC<{ onEdit: () => void; onDelete: () => void }> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen((o) => !o)}>
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 min-w-[160px] rounded-md border bg-white shadow-lg z-20">
          <button onClick={() => (setOpen(false), onEdit())} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
            Edit
          </button>
          <button
            onClick={() => (setOpen(false), onDelete())}
            className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

/** ---------------- Create/Edit Modal ---------------- */
const TaskModal: React.FC<{
  open: boolean;
  onClose: () => void;
  users: TasksState["users"];
  initial?: Partial<Task>;
  onSubmit: (t: Omit<Task, "id">) => void;
}> = ({ open, onClose, users, initial, onSubmit }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline?.slice(0, 10) ?? "");
  const [assignees, setAssignees] = useState<string[]>(initial?.assignees ?? []);
  const [status, setStatus] = useState<Status>((initial?.status as Status) ?? "Uncompleted");
  const [priority, setPriority] = useState<Priority>((initial?.priority as Priority) ?? "low");
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial?.subtasks ?? []);
  const [createdBy] = useState<string>(initial?.createdBy ?? "me");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDeadline(initial?.deadline?.slice(0, 10) ?? "");
    setAssignees(initial?.assignees ?? []);
    setStatus((initial?.status as Status) ?? "Uncompleted");
    setPriority((initial?.priority as Priority) ?? "low");
    setSubtasks(initial?.subtasks ?? []);
  }, [open, initial]);

  if (!open) return null;

  const addSub = () =>
    setSubtasks((s) => [...s, { id: uid(), title: `Subtask ${s.length + 1}`, done: false }]);
  const updateSub = (id: string, patch: Partial<Subtask>) =>
    setSubtasks((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeSub = (id: string) => setSubtasks((s) => s.filter((x) => x.id !== id));

  return (
    <div className="fixed inset-0 z-40 grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[720px] max-w-[95vw] rounded-xl border bg-white shadow-xl">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">{initial?.id ? "Edit task" : "Create task"}</h3>
          <button className="p-2 rounded hover:bg-gray-100" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          className="p-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              title: title.trim(),
              description: "",
              deadline: deadline ? new Date(deadline).toISOString() : undefined,
              assignees,
              createdBy,
              status,
              priority,
              subtasks,
            });
            onClose();
          }}
        >
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600">Title</span>
            <input required className="border rounded-md px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">Deadline</span>
              <input
                type="date"
                className="border rounded-md px-3 py-2"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">Status</span>
              <select className="border rounded-md px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option>Uncompleted</option>
                <option>Completed</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-gray-600">Priority</span>
              <select
                className="border rounded-md px-3 py-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="grid gap-1 text-sm">
            <span className="text-gray-600">Assignees</span>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => {
                const on = assignees.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() =>
                      setAssignees((prev) => (on ? prev.filter((x) => x !== u.id) : [...prev, u.id]))
                    }
                    className={`px-2 py-1 rounded border text-xs ${on ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
                    title={u.name}
                  >
                    <User className="w-3 h-3 inline mr-1" />
                    {u.initials}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtasks</span>
              <button type="button" className="px-2 py-1 rounded border text-xs" onClick={addSub}>
                + Add subtask
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input
                    className="border rounded px-2 py-1 grow text-sm"
                    value={s.title}
                    onChange={(e) => updateSub(s.id, { title: e.target.value })}
                  />
                  <label className="text-xs flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={(e) => updateSub(s.id, { done: e.target.checked })}
                    />
                    Done
                  </label>
                  <button type="button" className="p-2 rounded hover:bg-gray-100" onClick={() => removeSub(s.id)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {subtasks.length === 0 && <div className="text-xs text-gray-500">No subtasks</div>}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" className="px-3 py-2 rounded-md border" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-3 py-2 rounded-md bg-blue-600 text-white">
              Save task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** ---------------- Utilities ---------------- */
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");
const daysOverdue = (iso?: string) => {
  if (!iso) return 0;
  const due = new Date(iso).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const diff = Math.floor((today - due) / 86400000);
  return diff > 0 ? diff : 0;
};

/** ---------------- Row ---------------- */
const TaskRow: React.FC<{
  task: Task;
  users: TasksState["users"];
  showSubtasks: boolean;
  onToggleDone: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}> = ({ task, users, showSubtasks, onToggleDone, onEdit, onDelete }) => {
  const overdue = daysOverdue(task.deadline);
  const statusTxt =
    task.status === "Completed"
      ? "Completed"
      : overdue > 0
      ? `${overdue} day${overdue === 1 ? "" : "s"} overdue`
      : "Uncompleted";
  return (
    <div className="rounded-xl border bg-white px-4 py-3 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <PriorityBar p={task.priority} />
        <button className="mt-1" onClick={() => onToggleDone(task)} aria-label="toggle done">
          {task.status === "Completed" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-400" />}
        </button>

        <div>
          <div className="text-sm font-medium">{task.title}</div>
          {showSubtasks && task.subtasks.length > 0 && (
            <ul className="mt-1 text-xs text-gray-600 list-disc ml-5 space-y-0.5">
              {task.subtasks.map((s) => (
                <li key={s.id} className={s.done ? "line-through text-gray-400" : ""}>
                  {s.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[140px_160px_140px_32px] items-center gap-3">
        <div className="text-xs text-gray-500">
          <div className="uppercase">Deadline</div>
          <div className="flex items-center gap-1 text-gray-800">
            <Calendar className="w-3 h-3" />
            {fmtDate(task.deadline)}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <div className="uppercase">Assigned to</div>
          <AvatarStack ids={task.assignees} users={users} />
        </div>

        <div className="text-xs text-gray-500">
          <div className="uppercase">Status</div>
          <div className={`text-gray-800 ${task.status === "Completed" ? "text-green-700" : overdue ? "text-red-600" : ""}`}>
            {statusTxt}
          </div>
        </div>

        <RowMenu onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />
      </div>
    </div>
  );
};

/** ---------------- Main Page ---------------- */
const TABS = ["My tasks", "My created tasks", "Completed tasks", "All tasks"] as const;
type Tab = (typeof TABS)[number];

const TasksPage: React.FC = () => {
  const [state, setState] = useState<TasksState>(() => load());
  const [tab, setTab] = useState<Tab>("All tasks");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"deadline" | "title" | "status">("deadline");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | string>("all");
  const [showSubtasks, setShowSubtasks] = useState(true);

  // modals
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Task | null>(null);

  useEffect(() => save(state), [state]);

  const currentUser = "me"; // TODO: plug your auth id here

  /** derived list */
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();

    let tasks = state.tasks.slice();

    // tab filters
    if (tab === "My tasks") tasks = tasks.filter((t) => t.assignees.includes(currentUser));
    if (tab === "My created tasks") tasks = tasks.filter((t) => t.createdBy === currentUser);
    if (tab === "Completed tasks") tasks = tasks.filter((t) => t.status === "Completed");

    // toolbar filters
    if (statusFilter !== "all") tasks = tasks.filter((t) => t.status === statusFilter);
    if (assigneeFilter !== "all") tasks = tasks.filter((t) => t.assignees.includes(assigneeFilter));

    // search
    if (q) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q),
      );
    }

    // sort
    tasks.sort((a, b) => {
      let A: any, B: any;
      if (sortKey === "deadline") {
        A = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        B = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      } else if (sortKey === "title") {
        A = a.title.toLowerCase();
        B = b.title.toLowerCase();
      } else {
        A = a.status;
        B = b.status;
      }
      const cmp = A < B ? -1 : A > B ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return tasks;
  }, [state.tasks, tab, statusFilter, assigneeFilter, query, sortKey, sortDir]);

  /** actions */
  const createTask = (t: Omit<Task, "id">) =>
    setState((s) => ({ ...s, tasks: [{ id: uid(), ...t }, ...s.tasks] }));
  const updateTask = (id: string, patch: Partial<Task>) =>
    setState((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeTask = (id: string) =>
    setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }));

  /** UI */
  return (
    <div className="min-h-screen bg-white">
      {/* Tabs row */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="flex gap-6 text-sm border-b">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 -mb-px ${tab === t ? "border-b-2 border-black font-medium" : "text-gray-500 hover:text-black"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Create task
          </button>

          <div className="relative ml-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="pl-9 pr-3 py-2 text-sm rounded-md border bg-white w-56"
            />
          </div>

          <ToolbarBtn
            icon={<ArrowUpDown className="w-4 h-4" />}
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            Sort
          </ToolbarBtn>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="text-sm border rounded-md px-2 py-2 bg-white"
            title="Sort key"
          >
            <option value="deadline">Deadline</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>

          <ToolbarBtn icon={<Filter className="w-4 h-4" />}>Filter</ToolbarBtn>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm border rounded-md px-2 py-2 bg-white"
            title="Status"
          >
            <option value="all">All statuses</option>
            <option value="Uncompleted">Uncompleted</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value as any)}
            className="text-sm border rounded-md px-2 py-2 bg-white"
            title="Assignee"
          >
            <option value="all">All assignees</option>
            {state.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <ToolbarBtn
            icon={<EllipsisVertical className="w-4 h-4" />}
            onClick={() => setShowSubtasks((v) => !v)}
          >
            {showSubtasks ? "Hide subtasks" : "Show subtasks"}
          </ToolbarBtn>

          <div className="ml-auto text-[11px] text-gray-500">
            Tip: press <Kbd>F</Kbd> to focus search
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-3">
        {list.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            users={state.users}
            showSubtasks={showSubtasks}
            onToggleDone={(task) =>
              updateTask(task.id, { status: task.status === "Completed" ? "Uncompleted" : "Completed" })
            }
            onEdit={(task) => {
              setEdit(task);
              setOpen(true);
            }}
            onDelete={(task) => removeTask(task.id)}
          />
        ))}
        {list.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">No tasks found.</div>
        )}
      </div>

      {/* Modal */}
      <TaskModal
        open={open}
        onClose={() => setOpen(false)}
        users={state.users}
        initial={edit ?? undefined}
        onSubmit={(payload) => {
          if (edit) updateTask(edit.id, payload);
          else createTask(payload);
        }}
      />
    </div>
  );
};

export default TasksPage;
