// @ts-nocheck
import React, { useState, useCallback, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/**
 * CallSheetEditor.tsx
 * - Add / edit call sheet entries (cast, crew, scenes, notes)
 * - Autosave to localStorage
 * - Export to Excel
 * - Print-friendly layout with id="call-sheet-print"
 */

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DEFAULT_CALLSHEET = {
  id: uid(),
  productionTitle: "Production Title",
  date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  callTime: "07:00",
  location: "Location address / set",
  parking: "",
  weather: "",
  notes: "",
  cast: [
    { id: uid(), name: "Lead Actor", role: "Role", call: "08:00", contact: "" },
  ],
  crew: [
    { id: uid(), name: "Director", department: "Direction", call: "06:30", contact: "" },
  ],
  scenes: [
    { id: uid(), sceneNo: "1", description: "EXT. PARK - DAY", pages: "1", call: "08:00" },
  ],
};

function useAutosave(key, state) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) state.set(parsed);
      }
    } catch {}
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state.get()));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [state]);
}

// Simple toolbar component
const Toolbar = ({ onAddCast, onAddCrew, onAddScene, onExportExcel, onExportPDF }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex gap-2">
      <button onClick={onAddCast} className="px-3 py-1 rounded-xl bg-black text-white text-sm shadow">+ Cast</button>
      <button onClick={onAddCrew} className="px-3 py-1 rounded-xl bg-black text-white text-sm shadow">+ Crew</button>
      <button onClick={onAddScene} className="px-3 py-1 rounded-xl bg-black text-white text-sm shadow">+ Scene</button>
    </div>
    <div className="flex gap-2">
      <button onClick={onExportExcel} className="px-4 py-2 rounded-2xl bg-white text-black border shadow">Export Excel</button>
      <button onClick={onExportPDF} className="px-4 py-2 rounded-2xl bg-white text-black border shadow">Print / Export PDF</button>
    </div>
  </div>
);

function RowInput({ children }) {
  return <div className="grid gap-2 md:grid-cols-4 items-center w-full">{children}</div>;
}

export default function CallSheetEditor() {
  const [callSheet, setCallSheet] = useState(DEFAULT_CALLSHEET);
  const sheetRef = useRef(null);

  // Expose get/set for useAutosave helper
  const stateWrapper = {
    get: () => callSheet,
    set: (s) => setCallSheet(s),
  };
  useAutosave("call_sheet_draft", stateWrapper);

  // Adders
  const addCast = useCallback(() => {
    setCallSheet((s) => ({
      ...s,
      cast: [...(s.cast || []), { id: uid(), name: "", role: "", call: s.callTime || "", contact: "" }],
    }));
  }, []);

  const addCrew = useCallback(() => {
    setCallSheet((s) => ({
      ...s,
      crew: [...(s.crew || []), { id: uid(), name: "", department: "", call: s.callTime || "", contact: "" }],
    }));
  }, []);

  const addScene = useCallback(() => {
    setCallSheet((s) => ({
      ...s,
      scenes: [...(s.scenes || []), { id: uid(), sceneNo: "", description: "", pages: "", call: s.callTime || "" }],
    }));
  }, []);

  // Updaters & Deleters
  const updateField = useCallback((k, v) => setCallSheet((s) => ({ ...s, [k]: v })), []);
  const updateListItem = useCallback((listKey, id, patch) => {
    setCallSheet((s) => ({
      ...s,
      [listKey]: (s[listKey] || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }, []);
  const deleteListItem = useCallback((listKey, id) => {
    setCallSheet((s) => ({ ...s, [listKey]: (s[listKey] || []).filter((it) => it.id !== id) })), [];
  });

  // Export to Excel
  const exportExcel = useCallback(() => {
    const header = ["Type", "Name/Scene", "Role/Dept/Description", "Call Time", "Pages", "Contact"];
    const rows = [];

    // Basic info row
    rows.push(["Production", callSheet.productionTitle, `Date: ${callSheet.date} | Call: ${callSheet.callTime}`, callSheet.location, "", ""]);

    rows.push([]);
    rows.push(["CAST"]);
    rows.push(header);
    (callSheet.cast || []).forEach((c) => {
      rows.push(["Cast", c.name || "", c.role || "", c.call || "", "", c.contact || ""]);
    });

    rows.push([]);
    rows.push(["CREW"]);
    rows.push(header);
    (callSheet.crew || []).forEach((c) => {
      rows.push(["Crew", c.name || "", c.department || "", c.call || "", "", c.contact || ""]);
    });

    rows.push([]);
    rows.push(["SCENES"]);
    rows.push(["SceneNo", "Description", "Pages", "Call", "", ""]);
    (callSheet.scenes || []).forEach((sc) => {
      rows.push([sc.sceneNo || "", sc.description || "", sc.pages || "", sc.call || "", "", ""]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CallSheet");
    XLSX.writeFile(wb, `${(callSheet.productionTitle || "callsheet").replace(/\s+/g, "_")}_callsheet.xlsx`);
  }, [callSheet]);

  // Print
  const exportPDF = useCallback(() => {
    setTimeout(() => window.print(), 100);
  }, []);

  // Keyboard shortcuts: Alt+C (cast), Alt+R (crew), Alt+S (scene)
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "c") { addCast(); e.preventDefault(); }
      if (k === "r") { addCrew(); e.preventDefault(); }
      if (k === "s") { addScene(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addCast, addCrew, addScene]);

  return (
    <div className="min-h-screen bg-neutral-100 text-black">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 bg-neutral-100/95 border-b border-gray-200 py-2">
          <Toolbar onAddCast={addCast} onAddCrew={addCrew} onAddScene={addScene} onExportExcel={exportExcel} onExportPDF={exportPDF} />
        </div>

        <main className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-gray-500">Production</label>
                <input className="w-full bg-transparent outline-none border-b py-1" value={callSheet.productionTitle} onChange={(e) => updateField("productionTitle", e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-gray-500">Date</label>
                <input type="date" className="w-full bg-transparent outline-none border-b py-1" value={callSheet.date} onChange={(e) => updateField("date", e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-gray-500">Call Time</label>
                <input type="time" className="w-full bg-transparent outline-none border-b py-1" value={callSheet.callTime} onChange={(e) => updateField("callTime", e.target.value)} />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs uppercase font-bold text-gray-500">Location</label>
              <input className="w-full bg-transparent outline-none border-b py-1" value={callSheet.location} onChange={(e) => updateField("location", e.target.value)} />
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <input placeholder="Parking / Load-in details" className="bg-transparent outline-none border-b py-1" value={callSheet.parking} onChange={(e) => updateField("parking", e.target.value)} />
              <input placeholder="Weather" className="bg-transparent outline-none border-b py-1" value={callSheet.weather} onChange={(e) => updateField("weather", e.target.value)} />
              <input placeholder="Other notes" className="bg-transparent outline-none border-b py-1" value={callSheet.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
          </div>

          {/* Printable area */}
          <div id="call-sheet-print" ref={sheetRef} className="bg-white p-6 rounded-2xl shadow space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{callSheet.productionTitle}</h2>
                <div className="text-sm text-gray-600">Date: {callSheet.date} • Call: {callSheet.callTime}</div>
                <div className="text-sm text-gray-600">Location: {callSheet.location}</div>
              </div>
              <div className="text-right text-sm">
                <div>Parking: {callSheet.parking}</div>
                <div>Weather: {callSheet.weather}</div>
              </div>
            </div>

            {/* Cast */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold uppercase text-sm">Cast</h3>
                <div className="text-xs text-gray-500">Total: {(callSheet.cast || []).length}</div>
              </div>
              <div className="space-y-2">
                {(callSheet.cast || []).map((c) => (
                  <div key={c.id} className="p-3 rounded border">
                    <RowInput>
                      <input className="bg-transparent outline-none" placeholder="Name" value={c.name} onChange={(e) => updateListItem("cast", c.id, { name: e.target.value })} />
                      <input className="bg-transparent outline-none" placeholder="Role" value={c.role} onChange={(e) => updateListItem("cast", c.id, { role: e.target.value })} />
                      <input className="bg-transparent outline-none" placeholder="Call" value={c.call} onChange={(e) => updateListItem("cast", c.id, { call: e.target.value })} />
                      <div className="flex gap-2 justify-end items-center">
                        <input className="bg-transparent outline-none" placeholder="Contact" value={c.contact} onChange={(e) => updateListItem("cast", c.id, { contact: e.target.value })} />
                        <button onClick={() => deleteListItem("cast", c.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs">Delete</button>
                      </div>
                    </RowInput>
                  </div>
                ))}
              </div>
            </section>

            {/* Crew */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold uppercase text-sm">Crew</h3>
                <div className="text-xs text-gray-500">Total: {(callSheet.crew || []).length}</div>
              </div>
              <div className="space-y-2">
                {(callSheet.crew || []).map((c) => (
                  <div key={c.id} className="p-3 rounded border">
                    <RowInput>
                      <input className="bg-transparent outline-none" placeholder="Name" value={c.name} onChange={(e) => updateListItem("crew", c.id, { name: e.target.value })} />
                      <input className="bg-transparent outline-none" placeholder="Department" value={c.department} onChange={(e) => updateListItem("crew", c.id, { department: e.target.value })} />
                      <input className="bg-transparent outline-none" placeholder="Call" value={c.call} onChange={(e) => updateListItem("crew", c.id, { call: e.target.value })} />
                      <div className="flex gap-2 justify-end items-center">
                        <input className="bg-transparent outline-none" placeholder="Contact" value={c.contact} onChange={(e) => updateListItem("crew", c.id, { contact: e.target.value })} />
                        <button onClick={() => deleteListItem("crew", c.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs">Delete</button>
                      </div>
                    </RowInput>
                  </div>
                ))}
              </div>
            </section>

            {/* Scenes */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold uppercase text-sm">Scenes</h3>
                <div className="text-xs text-gray-500">Total: {(callSheet.scenes || []).length}</div>
              </div>
              <div className="space-y-2">
                {(callSheet.scenes || []).map((sc) => (
                  <div key={sc.id} className="p-3 rounded border">
                    <RowInput>
                      <input className="bg-transparent outline-none" placeholder="Scene No" value={sc.sceneNo} onChange={(e) => updateListItem("scenes", sc.id, { sceneNo: e.target.value })} />
                      <input className="bg-transparent outline-none" placeholder="Description" value={sc.description} onChange={(e) => updateListItem("scenes", sc.id, { description: e.target.value })} />
                      <input className="bg-transparent outline-none" placeholder="Pages" value={sc.pages} onChange={(e) => updateListItem("scenes", sc.id, { pages: e.target.value })} />
                      <div className="flex gap-2 justify-end items-center">
                        <input className="bg-transparent outline-none" placeholder="Call" value={sc.call} onChange={(e) => updateListItem("scenes", sc.id, { call: e.target.value })} />
                        <button onClick={() => deleteListItem("scenes", sc.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs">Delete</button>
                      </div>
                    </RowInput>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer notes */}
            <div>
              <label className="text-xs uppercase font-bold text-gray-500">Notes / Reminders</label>
              <textarea className="w-full bg-transparent outline-none mt-2" rows={4} value={callSheet.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
          </div>
        </main>
      </div>

      {/* Print CSS — simple and local to this component */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #call-sheet-print, #call-sheet-print * { visibility: visible !important; }
          #call-sheet-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
