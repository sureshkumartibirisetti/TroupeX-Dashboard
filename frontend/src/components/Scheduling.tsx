// Scheduling.tsx
// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock, MapPin, Users, Phone, Plus, Download, Printer, X, Calendar, FileSpreadsheet,
} from 'lucide-react';

/** ===================== Helpers ===================== */
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toMinutes = (t: string) => {
  // "7:00 AM" → minutes since 00:00
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && hh !== 12) hh += 12;
  if (ap === 'AM' && hh === 12) hh = 0;
  return hh * 60 + mm;
};

const fromMinutes = (mins: number) => {
  let hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const ap = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return `${hh}:${pad(mm)} ${ap}`;
};

const diffHM = (startMin: number, endMin: number) => {
  const d = Math.max(0, endMin - startMin);
  const h = Math.floor(d / 60);
  const m = d % 60;
  return `${h}h ${pad(m)}m`;
};

// Simple CSV download
const downloadCSV = (filename: string, rows: string[][]) => {
  const csv = rows.map(r =>
    r
      .map((cell) => {
        const c = `${cell ?? ''}`.replace(/"/g, '""');
        return `"${c}"`;
      })
      .join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(link.href);
};

const useLocalStorage = (key: string, initial: any) => {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);
  return [val, setVal];
};

/** ===================== Types ===================== */
type Scene = {
  id: string;
  time: string; // "7:00 AM"
  durationMin: number; // e.g. 45
  sceneNo: string;
  description: string;
  set: string;
  castIds: number[]; // [1,2]
  ie: 'I' | 'E';
  dn: 'D' | 'N';
  pages?: string;
};

type Cast = {
  id: number;
  actor: string;
  role: string;
  pickup?: string;
  callTime?: string;
  muhu?: string;
  wardrobe?: string;
  onSet?: string;
};

type Crew = {
  dept: string;
  position: string;
  name: string;
  contact: string;
  callTime: string;
};

/** ===================== Component ===================== */
const Scheduling: React.FC = () => {
  // ---------- Live Clock ----------
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30 * 1000); // every 30s
    return () => clearInterval(t);
  }, []);
  const niceNow = useMemo(() => {
    const h = now.getHours();
    const m = now.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    const hh = (h % 12) || 12;
    return `${hh}:${pad(m)} ${ap}`;
  }, [now]);

  // ---------- Data (persisted) ----------
  const [sceneBreakdown, setSceneBreakdown] = useLocalStorage('tx_scenes', [
    {
      id: crypto.randomUUID(),
      time: '7:00 AM',
      durationMin: 45,
      sceneNo: '18',
      description: 'Priya confronts Raj in the garden',
      set: 'Garden @ Mansion',
      castIds: [1, 2],
      ie: 'I',
      dn: 'D',
      pages: '2'
    },
    {
      id: crypto.randomUUID(),
      time: '7:45 AM',
      durationMin: 60,
      sceneNo: '23',
      description: 'Raj confronts Priya in the garden (reverse)',
      set: 'Garden @ Mansion',
      castIds: [2],
      ie: 'I',
      dn: 'D',
      pages: '3'
    }
  ] as Scene[]);

  const [cast, setCast] = useLocalStorage('tx_cast', [
    { id: 1, actor: 'Rahul', role: 'Kumar', pickup: '5:30 AM', callTime: '6:00 AM', muhu: '6:00 AM', wardrobe: '6:30 AM', onSet: '7:00 AM' },
    { id: 2, actor: 'Radha', role: 'Shanthi', pickup: '5:30 AM', callTime: '6:00 AM', muhu: '6:00 AM', wardrobe: '6:30 AM', onSet: '7:00 AM' },
    { id: 3, actor: 'Sai Kumar', role: 'Simba', pickup: '7:30 AM', callTime: '6:00 AM', muhu: '6:00 AM', wardrobe: '6:30 AM', onSet: '7:00 AM' },
  ] as Cast[]);

  const [crew, setCrew] = useLocalStorage('tx_crew', [
    { dept: 'Direction',       position: 'Director', name: 'Arjun Rao',      contact: '+91 98765 43210', callTime: '5:30 AM' },
    { dept: 'Cinematography',  position: 'DOP',      name: 'Vikram Reddy',   contact: '+91 98765 43213', callTime: '6:00 AM' },
    { dept: 'Sound',           position: 'Engineer', name: 'Amit Kumar',     contact: '+91 98765 43220', callTime: '6:30 AM' },
  ] as Crew[]);

  // ---------- UI State ----------
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);
  const [showTimesheets, setShowTimesheets] = useState(false);

  const [sceneForm, setSceneForm] = useState<Partial<Scene>>({
    time: '8:00 AM',
    durationMin: 30,
    sceneNo: '',
    description: '',
    set: '',
    castIds: [],
    ie: 'I',
    dn: 'D',
    pages: '1'
  });

  const [castForm, setCastForm] = useState<Partial<Cast>>({
    actor: '',
    role: '',
    pickup: '',
    callTime: '',
    muhu: '',
    wardrobe: '',
    onSet: ''
  });

  /** ============ Derived: Timesheets per person ============ 
   * For each cast:
   *  - window of engagement (min start to max end of scenes they’re in)
   *  - total on-set time (sum of scene durations they’re in)
   *  - wait/buffer = window - on-set
   */
  const scenesWithMin = useMemo(() => {
    return sceneBreakdown
      .map(s => {
        const start = toMinutes(s.time);
        const end = start != null ? start + (s.durationMin || 0) : null;
        return { ...s, start, end };
      })
      .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  }, [sceneBreakdown]);

  const castTimesheets = useMemo(() => {
    const map: Record<number, any> = {};
    cast.forEach(ca => {
      const theirScenes = scenesWithMin.filter(s => s.castIds.includes(ca.id) && s.start != null && s.end != null);
      const first = theirScenes.length ? Math.min(...theirScenes.map(s => s.start)) : null;
      const last = theirScenes.length ? Math.max(...theirScenes.map(s => s.end)) : null;
      const onSetTotal = theirScenes.reduce((acc, s) => acc + (s.durationMin || 0), 0);
      const windowTotal = first != null && last != null ? last - first : 0;
      const wait = Math.max(0, windowTotal - onSetTotal);

      map[ca.id] = {
        cast: ca,
        scenes: theirScenes,
        firstIn: first,
        lastOut: last,
        onSetMin: onSetTotal,
        windowMin: windowTotal,
        waitMin: wait,
      };
    });
    return map;
  }, [cast, scenesWithMin]);

  /** ===================== Actions ===================== */
  const addScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneForm.time || !sceneForm.sceneNo) return;
    setSceneBreakdown((prev: Scene[]) => [
      {
        id: crypto.randomUUID(),
        time: sceneForm.time!,
        durationMin: Number(sceneForm.durationMin || 30),
        sceneNo: sceneForm.sceneNo!,
        description: sceneForm.description || '—',
        set: sceneForm.set || '—',
        castIds: sceneForm.castIds || [],
        ie: (sceneForm.ie as any) || 'I',
        dn: (sceneForm.dn as any) || 'D',
        pages: sceneForm.pages || '1',
      },
      ...prev,
    ]);
    setShowSceneModal(false);
  };

  const addCast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!castForm.actor || !castForm.role) return;
    setCast((prev: Cast[]) => {
      const nextId = (prev.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
      return [
        {
          id: nextId,
          actor: castForm.actor!,
          role: castForm.role!,
          pickup: castForm.pickup || '',
          callTime: castForm.callTime || '',
          muhu: castForm.muhu || '',
          wardrobe: castForm.wardrobe || '',
          onSet: castForm.onSet || '',
        },
        ...prev,
      ];
    });
    setShowCastModal(false);
  };

  const exportTimesheetsCSV = () => {
    const rows: string[][] = [
      ['Cast', 'Role', 'First In', 'Last Out', 'On-Set (min)', 'Window (min)', 'Waiting (min)', 'Scenes'],
    ];
    Object.values(castTimesheets).forEach((ts: any) => {
      const scenesStr = ts.scenes.map((s: any) => `#${s.sceneNo}(${fromMinutes(s.start)}-${fromMinutes(s.end)})`).join(' | ');
      rows.push([
        ts.cast.actor,
        ts.cast.role,
        ts.firstIn != null ? fromMinutes(ts.firstIn) : '',
        ts.lastOut != null ? fromMinutes(ts.lastOut) : '',
        String(ts.onSetMin),
        String(ts.windowMin),
        String(ts.waitMin),
        scenesStr,
      ]);
    });
    downloadCSV('timesheets.csv', rows);
  };

  /** ===================== UI ===================== */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scheduling & Real-Time Timesheets</h2>
            <p className="text-sm text-gray-600">Plan scenes, call cast, and generate per-person timesheets instantly.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Clock className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-900">{niceNow}</span>
            </div>
            <button
              onClick={() => setShowTimesheets(true)}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Generate Timesheets
            </button>
            <button
              onClick={exportTimesheetsCSV}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Location / Logistics */}
        <div className="px-6 pb-6 grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Location & Logistics</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Primary Location</div>
                <div className="text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Jubilee Hills Mansion, Hyderabad
                </div>
              </div>
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Base Camp</div>
                <div className="text-sm text-gray-900">Gate 3 — Crew Parking</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Safety & Contacts</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Nearest Hospital</div>
                <div className="text-sm text-gray-900">Apollo Hospitals</div>
              </div>
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Transport</div>
                <div className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Rahul Verma
                </div>
              </div>
              <div className="p-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Security Lead</div>
                <div className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Vinod Sharma
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenes + Cast Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scenes */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Scenes</h3>
            <button
              onClick={() => {
                setSceneForm({
                  time: '8:00 AM',
                  durationMin: 30,
                  sceneNo: '',
                  description: '',
                  set: '',
                  castIds: [],
                  ie: 'I',
                  dn: 'D',
                  pages: '1'
                });
                setShowSceneModal(true);
              }}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Scene
            </button>
          </div>

          <div className="px-4 pb-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Time</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Scene</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Desc</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Set</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Cast</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">I/E</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">D/N</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Dur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scenesWithMin.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-900">
                      {s.time} — {s.end != null ? fromMinutes(s.end) : ''}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900">#{s.sceneNo}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{s.description}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{s.set}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{s.castIds.join(', ')}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{s.ie}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{s.dn}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{s.durationMin}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cast */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Cast & Call Times</h3>
            <button
              onClick={() => {
                setCastForm({ actor: '', role: '', pickup: '', callTime: '', muhu: '', wardrobe: '', onSet: '' });
                setShowCastModal(true);
              }}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Cast
            </button>
          </div>

          <div className="px-4 pb-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Actor</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Role</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Pickup</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Call</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">M/U & H/W</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Wardrobe</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">On Set</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cast.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-900">{c.id}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{c.actor}</td>
                    <td className="py-2 px-3 text-sm text-gray-900">{c.role}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{c.pickup}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{c.callTime}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{c.muhu}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{c.wardrobe}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{c.onSet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Crew */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Department Crew</h3>
        </div>
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Dept.</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Position</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Contact</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Call Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {crew.map((cr, i) => (
                <tr key={`${cr.dept}-${i}`} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm text-gray-900">{cr.dept}</td>
                  <td className="py-2 px-3 text-sm text-gray-900">{cr.position}</td>
                  <td className="py-2 px-3 text-sm text-gray-900">{cr.name}</td>
                  <td className="py-2 px-3 text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {cr.contact}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900">{cr.callTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowTimesheets(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" /> Generate Timesheets
        </button>
        <button
          onClick={exportTimesheetsCSV}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button
          onClick={() => window.print()}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {/* ================= Modals ================= */}

      {/* Add Scene Modal */}
      {showSceneModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSceneModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Scene</h3>
                <button onClick={() => setShowSceneModal(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={addScene}
                className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Time (e.g., 8:00 AM)</label>
                  <input
                    value={sceneForm.time}
                    onChange={(e) => setSceneForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="8:00 AM"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={sceneForm.durationMin}
                    onChange={(e) => setSceneForm(f => ({ ...f, durationMin: Number(e.target.value) }))}
                    placeholder="30"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Scene #</label>
                  <input
                    value={sceneForm.sceneNo}
                    onChange={(e) => setSceneForm(f => ({ ...f, sceneNo: e.target.value }))}
                    required
                    placeholder="18"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <input
                    value={sceneForm.description}
                    onChange={(e) => setSceneForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Set</label>
                  <input
                    value={sceneForm.set}
                    onChange={(e) => setSceneForm(f => ({ ...f, set: e.target.value }))}
                    placeholder="Garden @ Mansion"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cast IDs (comma separated)</label>
                  <input
                    value={(sceneForm.castIds || []).join(',')}
                    onChange={(e) =>
                      setSceneForm(f => ({
                        ...f,
                        castIds: e.target.value
                          .split(',')
                          .map(x => Number(x.trim()))
                          .filter(Boolean),
                      }))
                    }
                    placeholder="1,2,3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">I/E</label>
                  <select
                    value={sceneForm.ie}
                    onChange={(e) => setSceneForm(f => ({ ...f, ie: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>I</option>
                    <option>E</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">D/N</label>
                  <select
                    value={sceneForm.dn}
                    onChange={(e) => setSceneForm(f => ({ ...f, dn: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>D</option>
                    <option>N</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pages</label>
                  <input
                    value={sceneForm.pages}
                    onChange={(e) => setSceneForm(f => ({ ...f, pages: e.target.value }))}
                    placeholder="1.5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setShowSceneModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    Save Scene
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Cast Modal */}
      {showCastModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCastModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Cast</h3>
                <button onClick={() => setShowCastModal(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={addCast} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Actor</label>
                  <input
                    value={castForm.actor}
                    onChange={(e) => setCastForm(f => ({ ...f, actor: e.target.value }))}
                    required
                    placeholder="e.g., Rahul"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Role</label>
                  <input
                    value={castForm.role}
                    onChange={(e) => setCastForm(f => ({ ...f, role: e.target.value }))}
                    required
                    placeholder="e.g., Kumar"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pickup</label>
                  <input
                    value={castForm.pickup}
                    onChange={(e) => setCastForm(f => ({ ...f, pickup: e.target.value }))}
                    placeholder="5:30 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Call Time</label>
                  <input
                    value={castForm.callTime}
                    onChange={(e) => setCastForm(f => ({ ...f, callTime: e.target.value }))}
                    placeholder="6:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">M/U & H/W</label>
                  <input
                    value={castForm.muhu}
                    onChange={(e) => setCastForm(f => ({ ...f, muhu: e.target.value }))}
                    placeholder="6:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Wardrobe</label>
                  <input
                    value={castForm.wardrobe}
                    onChange={(e) => setCastForm(f => ({ ...f, wardrobe: e.target.value }))}
                    placeholder="6:30 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">On Set</label>
                  <input
                    value={castForm.onSet}
                    onChange={(e) => setCastForm(f => ({ ...f, onSet: e.target.value }))}
                    placeholder="7:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setShowCastModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    Save Cast
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Timesheets Modal */}
      {showTimesheets && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTimesheets(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Timesheets (Real-Time)</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportTimesheetsCSV}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button onClick={() => setShowTimesheets(false)} className="p-2 rounded hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Cast</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Role</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">First In</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Last Out</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">On-Set</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Window</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Waiting</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Scenes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cast.map((c) => {
                      const ts = castTimesheets[c.id];
                      return (
                        <tr key={c.id} className="hover:bg-gray-50 align-top">
                          <td className="py-2 px-3 text-sm text-gray-900">{c.actor}</td>
                          <td className="py-2 px-3 text-sm text-gray-900">{c.role}</td>
                          <td className="py-2 px-3 text-sm text-gray-700">{ts?.firstIn != null ? fromMinutes(ts.firstIn) : '—'}</td>
                          <td className="py-2 px-3 text-sm text-gray-700">{ts?.lastOut != null ? fromMinutes(ts.lastOut) : '—'}</td>
                          <td className="py-2 px-3 text-sm text-gray-900">{ts ? diffHM(0, ts.onSetMin) : '—'}</td>
                          <td className="py-2 px-3 text-sm text-gray-900">{ts ? diffHM(0, ts.windowMin) : '—'}</td>
                          <td className="py-2 px-3 text-sm text-gray-900">{ts ? diffHM(0, ts.waitMin) : '—'}</td>
                          <td className="py-2 px-3 text-xs text-gray-700">
                            {ts?.scenes?.length
                              ? ts.scenes
                                  .map((s: any) => `#${s.sceneNo} (${fromMinutes(s.start)}–${fromMinutes(s.end)})`)
                                  .join(' • ')
                              : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-4 text-xs text-gray-500">
                  * On-Set = sum of scene durations where the cast is required.
                  Window = first-in to last-out across those scenes.
                  Waiting = Window − On-Set. (Real-time updates as you add/adjust scenes.)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
