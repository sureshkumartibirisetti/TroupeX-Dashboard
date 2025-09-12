// @ts-nocheck
import React, { useRef, useState, useCallback } from "react";
import * as XLSX from "xlsx";

/** Fixed Celtx-style Script Editor */

const ACTION_WIDTH = "w-[55%]";
const CD_CONTAINER_WIDTH = "w-[90%]";
const TIME_RIGHT_PAD_REM = 4.5;

const DEFAULT_PAGE = {
  widthIn: 8.5,
  heightIn: 11,
  marginsIn: { top: 1, bottom: 1, left: 1.5, right: 1 },
  fontFamily: "'Courier New','Courier Prime','Noto Serif Telugu','Noto Serif Devanagari',monospace",
  fontSizePt: 12,
  lineHeight: 1.15,
};

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const NEW_SCENE = () => ({
  id: uid(),
  type: "SceneHeading",
  sceneNo: "SCENE: ",
  location: "",
  time: "",
});

const START_DOC = [
  NEW_SCENE(),
  { id: uid(), type: "Action", text: "Action" },
  { id: uid(), type: "CharDialogueInline", character: "Character", dialogue: "Dialouge" },
  { id: uid(), type: "Transition", text: "CUT TO" },
];

// Excel rows helper
const buildRows = (blocks) => {
  const rows = [];
  let current = { sceneNo: "", location: "", time: "" };

  for (const b of blocks) {
    if (b.type === "SceneHeading") {
      current = {
        sceneNo: (b.sceneNo || "").trim(),
        location: (b.location || "").trim(),
        time: (b.time || "").trim(),
      };
    } else if (b.type === "CharDialogueInline") {
      rows.push([current.sceneNo, current.location, current.time, b.character || "", b.dialogue || ""]);
    } else if (b.type === "Action") {
      rows.push([current.sceneNo, current.location, current.time, "", b.text || ""]);
    } else if (b.type === "Transition") {
      if (/cut/i.test(b.text || "")) current = { sceneNo: "", location: "", time: "" };
    }
  }
  return rows;
};

// Improved Print CSS
function usePrintCSS(page) {
  const styleTag = useRef(null);
  
  React.useEffect(() => {
    const s = document.createElement("style");
    s.setAttribute("id", "print-css");
    document.head.appendChild(s);
    styleTag.current = s;
    return () => s.remove();
  }, []);

  React.useEffect(() => {
    if (!styleTag.current) return;
    const { widthIn, heightIn, marginsIn, fontFamily, fontSizePt, lineHeight } = page;
    
    styleTag.current.textContent = `
      @page { 
        size: ${widthIn}in ${heightIn}in; 
        margin: ${marginsIn.top}in ${marginsIn.right}in ${marginsIn.bottom}in ${marginsIn.left}in;
      }
      @media print {
        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        body * { visibility: hidden !important; }
        #script-editor-print, #script-editor-print * { visibility: visible !important; }
        #script-editor-print { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 100% !important;
          height: auto !important;
        }
        .page {
          width: ${widthIn}in !important;
          height: auto !important;
          min-height: ${heightIn - marginsIn.top - marginsIn.bottom}in !important;
          box-shadow: none !important; 
          margin: 0 !important;
          padding: 0 !important;
          font-family: ${fontFamily} !important; 
          font-size: ${fontSizePt + 2}pt !important; 
          line-height: ${lineHeight} !important;
          page-break-after: always !important;
          break-after: always !important;
        }
        .page:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        .group:hover .hidden { display: none !important; }
        textarea, input { 
          border: none !important;
          background: transparent !important;
          resize: none !important;
          outline: none !important;
          font-size: ${fontSizePt + 4}pt !important;
        }
      }
      @media screen {
        .page {
          width: ${widthIn}in !important;
          min-height: ${heightIn - marginsIn.top - marginsIn.bottom}in !important;
          height: auto !important;
          padding: ${marginsIn.top}in ${marginsIn.right}in ${marginsIn.bottom}in ${marginsIn.left}in !important;
          font-family: ${fontFamily} !important; 
          font-size: ${fontSizePt}pt !important; 
          line-height: ${lineHeight} !important;
        }
      }
    `;
  }, [page]);
}

// Controls
const BlockControls = ({ onAdd }) => (
  <div className="flex flex-wrap gap-2">
    {[
      ["Scene", () => onAdd({ ...NEW_SCENE(), sceneNo: "SCENE: " })],
      ["Action", () => onAdd({ id: uid(), type: "Action", text: "" })],
      ["Char:Dialogue", () => onAdd({ id: uid(), type: "CharDialogueInline", character: "", dialogue: "" })],
      ["Transition", () => onAdd({ id: uid(), type: "Transition", text: "CUT TO" })],
    ].map(([label, fn]) => (
      <button key={label} onClick={fn} className="px-3 py-1 rounded-xl bg-black text-white text-sm shadow hover:bg-gray-800 transition-colors">
        + {label}
      </button>
    ))}
  </div>
);

const Toolbar = ({ onAdd, onExportPDF, onExportExcel }) => (
  <div className="flex items-center justify-between gap-3">
    <BlockControls onAdd={onAdd} />
    <div className="flex gap-2">
      <button onClick={onExportExcel} className="px-4 py-2 rounded-2xl bg-white text-black border shadow hover:bg-gray-50 transition-colors">
        Export Excel
      </button>
      <button onClick={onExportPDF} className="px-4 py-2 rounded-2xl bg-white text-black border shadow hover:bg-gray-50 transition-colors">
        Export PDF
      </button>
    </div>
  </div>
);

// Page container
function Page({ page, children, isLast = false }) {
  usePrintCSS(page);
  
  const style = {
    width: `${page.widthIn}in`,
    minHeight: `${page.heightIn - page.marginsIn.top - page.marginsIn.bottom}in`,
    height: "auto",
    paddingTop: `${page.marginsIn.top}in`,
    paddingBottom: `${page.marginsIn.bottom}in`,
    paddingLeft: `${page.marginsIn.left}in`,
    paddingRight: `${page.marginsIn.right}in`,
    fontFamily: page.fontFamily,
    fontSize: `${page.fontSizePt}pt`,
    lineHeight: page.lineHeight,
  };
  
  return (
    <div 
      className={`page bg-white shadow-xl rounded-2xl relative overflow-hidden ${isLast ? '' : 'mb-8'}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Improved Block component with stable auto-grow
const Block = ({ b, onChange, onDelete, onMoveUp, onMoveDown, onFocused }) => {
  const textareaRefs = useRef(new Map());
  
  const autoGrow = useCallback((el) => {
    if (!el) return;
    
    // Store current scroll position
    const scrollTop = window.pageYOffset;
    
    // Reset height to measure content
    el.style.height = 'auto';
    
    // Calculate new height
    const newHeight = Math.max(el.scrollHeight, 24) + 'px';
    
    // Only update if height actually changed
    if (el.style.height !== newHeight) {
      el.style.height = newHeight;
    }
    
    // Restore scroll position if it changed
    if (Math.abs(window.pageYOffset - scrollTop) > 1) {
      window.scrollTo(0, scrollTop);
    }
  }, []);

  const handleTextareaRef = useCallback((el, key) => {
    if (el) {
      textareaRefs.current.set(key, el);
      // Initial size
      requestAnimationFrame(() => autoGrow(el));
    } else {
      textareaRefs.current.delete(key);
    }
  }, [autoGrow]);

  return (
    <div className="group my-2">
      <div className="hidden group-hover:flex gap-2 mb-1 text-[10px] text-gray-600 print:hidden">
        <button onClick={onMoveUp} className="px-2 py-0.5 rounded bg-gray-100 border hover:bg-gray-200 transition-colors">↑</button>
        <button onClick={onMoveDown} className="px-2 py-0.5 rounded bg-gray-100 border hover:bg-gray-200 transition-colors">↓</button>
        <button onClick={onDelete} className="px-2 py-0.5 rounded bg-red-50 text-red-600 border hover:bg-red-100 transition-colors">Delete</button>
      </div>

      {b.type === "SceneHeading" && (
        <div className="font-bold uppercase">
          <div className="w-full flex">
            <input
              className="flex-1 max-w-[33%] bg-transparent outline-none border-none"
              placeholder="SCENE: 1"
              value={b.sceneNo || ''}
              onFocus={() => onFocused(b.id)}
              onChange={(e) => onChange({ ...b, sceneNo: e.target.value })}
            />
            <input
              className="flex-1 text-center bg-transparent outline-none border-none uppercase"
              placeholder="LOCATION"
              value={b.location || ''}
              onFocus={() => onFocused(b.id)}
              onChange={(e) => onChange({ ...b, location: e.target.value })}
            />
            <input
              className="flex-1 text-right bg-transparent outline-none border-none uppercase"
              style={{ paddingRight: `${TIME_RIGHT_PAD_REM}rem` }}
              placeholder="INT/EXT/DAY"
              value={b.time || ''}
              onFocus={() => onFocused(b.id)}
              onChange={(e) => onChange({ ...b, time: e.target.value })}
            />
          </div>
        </div>
      )}

      {b.type === "Action" && (
        <textarea
          ref={(el) => handleTextareaRef(el, `action-${b.id}`)}
          className={`${ACTION_WIDTH} bg-transparent outline-none border-none resize-none overflow-hidden`}
          placeholder="Action…"
          value={b.text || ''}
          onFocus={() => onFocused(b.id)}
          onChange={(e) => {
            onChange({ ...b, text: e.target.value });
            autoGrow(e.target);
          }}
          onInput={(e) => autoGrow(e.target)}
          style={{ 
            textAlign: "left", 
            marginBottom: "1em", 
            whiteSpace: "pre-wrap",
            minHeight: "24px",
          }}
        />
      )}

      {b.type === "CharDialogueInline" && (
        <div className={`${CD_CONTAINER_WIDTH} mx-auto`}>
          <div className="grid items-start gap-2" style={{ gridTemplateColumns: "40% max-content 55%" }}>
            <input
              className="w-full text-right font-bold bg-transparent outline-none border-none"
              placeholder="Character"
              value={b.character || ''}
              onFocus={() => onFocused(b.id)}
              onChange={(e) => onChange({ ...b, character: e.target.value })}
            />
            <div className="font-bold">:</div>
            <textarea
              ref={(el) => handleTextareaRef(el, `dialogue-${b.id}`)}
              className="w-full block bg-transparent outline-none border-none resize-none text-left overflow-hidden"
              placeholder="Dialogue…"
              value={b.dialogue || ''}
              onFocus={() => onFocused(b.id)}
              onChange={(e) => {
                onChange({ ...b, dialogue: e.target.value });
                autoGrow(e.target);
              }}
              onInput={(e) => autoGrow(e.target)}
              style={{ 
                whiteSpace: "pre-wrap",
                minHeight: "24px",
              }}
            />
          </div>
        </div>
      )}

      {b.type === "Transition" && (
        <input
          className="w-full text-center font-bold uppercase bg-transparent outline-none border-none"
          placeholder="CUT TO"
          value={b.text || ''}
          onFocus={() => onFocused(b.id)}
          onChange={(e) => onChange({ ...b, text: (e.target.value || '').toUpperCase() })}
          style={{ margin: "2em 0 3em 0" }}
        />
      )}
    </div>
  );
};

// Main Editor Component
export default function ScriptEditor() {
  const [page] = useState(DEFAULT_PAGE);
  const [blocks, setBlocks] = useState(START_DOC);
  const [activeId, setActiveId] = useState(null);
  const blockRefs = useRef(new Map());

  // Ref management
  const rememberRef = useCallback((id) => (el) => {
    if (el) {
      blockRefs.current.set(id, el);
    } else {
      blockRefs.current.delete(id);
    }
  }, []);

  // Autosave
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("script_editor_draft");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setBlocks(parsed);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try { 
        localStorage.setItem("script_editor_draft", JSON.stringify(blocks)); 
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [blocks]);

  // CRUD operations
  const onFocused = useCallback((id) => {
    setActiveId(id);
  }, []);

  const addBlock = useCallback((b) => {
    if (!b.id) b.id = uid();
    setBlocks((arr) => [...arr, b]);
    setActiveId(b.id);
    
    setTimeout(() => {
      const host = blockRefs.current.get(b.id);
      if (host) {
        const focusable = host.querySelector("input,textarea");
        focusable?.focus();
        host.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 100);
  }, []);

  const updateBlock = useCallback((id, patch) => {
    setActiveId(id);
    setBlocks((arr) => arr.map((b) => (b.id === id ? patch : b)));
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks((arr) => arr.filter((b) => b.id !== id));
    setActiveId(null);
  }, []);

  const move = useCallback((id, dir) => {
    setActiveId(id);
    setBlocks((arr) => {
      const i = arr.findIndex((b) => b.id === id);
      if (i < 0) return arr;
      const j = dir === -1 ? Math.max(0, i - 1) : Math.min(arr.length - 1, i + 1);
      if (i === j) return arr;
      const copy = arr.slice();
      const [it] = copy.splice(i, 1);
      copy.splice(j, 0, it);
      return copy;
    });
  }, []);

  // Export functions
  const exportPDF = useCallback(() => {
    // Small delay to ensure all content is rendered
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  const exportExcel = useCallback(() => {
    const header = ["Scene No", "Location", "Time", "Character", "Dialogue"];
    const rows = buildRows(blocks);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Script");
    XLSX.writeFile(wb, "script_export.xlsx");
  }, [blocks]);

  // Simple pagination - group blocks into pages without complex height calculation
  const BLOCKS_PER_PAGE = 15; // Adjust as needed
  const pagesState = React.useMemo(() => {
    const pages = [];
    for (let i = 0; i < blocks.length; i += BLOCKS_PER_PAGE) {
      pages.push(blocks.slice(i, i + BLOCKS_PER_PAGE));
    }
    return pages.length > 0 ? pages : [[]];
  }, [blocks]);

  // Keyboard shortcuts (Alt+S/A/C/T)
  React.useEffect(() => {
    const onKey = (e) => {
      if (!(e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s") { 
        addBlock({ ...NEW_SCENE(), sceneNo: "SCENE: " }); 
        e.preventDefault(); 
      } else if (k === "a") { 
        addBlock({ id: uid(), type: "Action", text: "" }); 
        e.preventDefault(); 
      } else if (k === "c") { 
        addBlock({ id: uid(), type: "CharDialogueInline", character: "", dialogue: "" }); 
        e.preventDefault(); 
      } else if (k === "t") { 
        addBlock({ id: uid(), type: "Transition", text: "CUT TO" }); 
        e.preventDefault(); 
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addBlock]);

  return (
    <div className="min-h-screen bg-neutral-100 text-black">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 bg-neutral-100/95
                        supports-[backdrop-filter]:bg-neutral-100/80 backdrop-blur
                        border-b border-gray-200 py-2">
          <Toolbar onAdd={addBlock} onExportPDF={exportPDF} onExportExcel={exportExcel} />
        </div>

        <main className="flex items-start gap-6 pt-4">
          <div id="script-editor-print" className="w-full">
            {pagesState.map((pageBlocks, pageIndex) => (
              <Page key={pageIndex} page={page} isLast={pageIndex === pagesState.length - 1}>
                {pageBlocks.map((b) => (
                  <div key={b.id} ref={rememberRef(b.id)}>
                    <Block
                      b={b}
                      onFocused={onFocused}
                      onChange={(patch) => updateBlock(b.id, patch)}
                      onDelete={() => deleteBlock(b.id)}
                      onMoveUp={() => move(b.id, -1)}
                      onMoveDown={() => move(b.id, +1)}
                    />
                  </div>
                ))}
              </Page>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
