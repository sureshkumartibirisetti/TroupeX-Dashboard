
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Upload, Download, Search, Filter, Eye, Edit, Trash2, Plus, X } from 'lucide-react';

type Status = 'Draft' | 'Pending' | 'Approved';

interface APIDocument {
  id: number;
  filename: string;
  category: string;
  size: number;
  upload_date: string;
  status: Status;
}

interface SceneRow {
  id?: number;
  scene_num: number;
  int_ext: string;
  location: string;
  session: string;
  text: string;
}

const API_BASE = (localStorage.getItem('apiBase') || 'http://localhost:8000');

export const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<APIDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [upCategory, setUpCategory] = useState('Scripts');
  const [upStatus, setUpStatus] = useState<Status>('Pending');

  const [activeDoc, setActiveDoc] = useState<APIDocument | null>(null);
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [scenesOpen, setScenesOpen] = useState(false);

  const categories = ['Scripts', 'Production', 'Legal', 'Equipment', 'Marketing'];
  const statusOptions: Status[] = ['Draft', 'Pending', 'Approved'];

  async function loadDocuments() {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE}/documents`);
      if (searchTerm) url.searchParams.set('q', searchTerm);
      if (filterCategory) url.searchParams.set('category', filterCategory);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      const res = await fetch(url.toString());
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { const t = setTimeout(loadDocuments, 300); return () => clearTimeout(t); }, [searchTerm, filterCategory, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const humanSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1024/1024).toFixed(1)} MB`;
  };

  const onUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', upCategory);
      fd.append('status', upStatus);
      const res = await fetch(`${API_BASE}/documents`, { method: 'POST', body: fd });
      if (!res.ok) {
        const t = await res.text();
        alert(`Upload failed: ${t}`);
        return;
      }
      const data = await res.json();
      setShowUploadModal(false);
      setFile(null);
      await loadDocuments();
      // Auto-open scene view if any scenes
      if (data?.id) {
        const doc = { id: data.id, filename: data.filename, category: data.category, size: data.size, upload_date: data.upload_date, status: data.status } as APIDocument;
        setActiveDoc(doc);
        await openScenes(doc.id);
      }
    } finally {
      setUploading(false);
    }
  };

  const openScenes = async (docId: number) => {
    const res = await fetch(`${API_BASE}/documents/${docId}/scenes`);
    const data = await res.json();
    setScenes(data.scenes ?? []);
    setScenesOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    if (activeDoc?.id === id) { setScenes([]); setScenesOpen(false); setActiveDoc(null); }
    await loadDocuments();
  };

  const filteredDocuments = useMemo(() => {
    return documents; // server-side filters already applied
  }, [documents]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Upload Document
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search documents..."
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option>All</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Status | 'All')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option>All</option>
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="px-4 py-2 border rounded-lg" onClick={loadDocuments}>Refresh</button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{doc.filename}</div>
                        <div className="text-sm text-gray-500">{doc.filename.split('.').pop()?.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{doc.category}</td>
                  <td className="px-6 py-4">{humanSize(doc.size)}</td>
                  <td className="px-6 py-4">{doc.upload_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 text-gray-400">
                      <button title="View" onClick={async () => { setActiveDoc(doc); await openScenes(doc.id); }} className="hover:text-blue-600"><Eye className="w-4 h-4"/></button>
                      <a title="Download Excel" href={`${API_BASE}/documents/${doc.id}/export`} className="hover:text-green-600"><Download className="w-4 h-4"/></a>
                      <button title="Delete" onClick={() => onDelete(doc.id)} className="hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!loading && filteredDocuments.length === 0) && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents found.</p>
          </div>
        )}
      </div>

      {/* Scenes Drawer */}
      {scenesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setScenesOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full md:w-3/4 lg:w-2/3 bg-white shadow-xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Scene Breakdown {activeDoc ? `• ${activeDoc.filename}` : ''}</h3>
              <div className="flex gap-2">
                {activeDoc && (
                  <a href={`${API_BASE}/documents/${activeDoc.id}/export`} className="px-3 py-2 border rounded-lg flex items-center text-sm">
                    <Download className="w-4 h-4 mr-2" /> Export XLSX
                  </a>
                )}
                <button className="p-2 rounded hover:bg-gray-100" onClick={() => setScenesOpen(false)}><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scene #</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INT/EXT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Script</th>
                  </tr>
                </thead>
                <tbody>
                  {scenes.map((s) => (
                    <tr key={`${s.scene_num}-${s.location}-${s.session}`} className="border-b">
                      <td className="px-4 py-2">{s.scene_num}</td>
                      <td className="px-4 py-2">{s.int_ext}</td>
                      <td className="px-4 py-2">{s.location}</td>
                      <td className="px-4 py-2">{s.session}</td>
                      <td className="px-4 py-2 whitespace-pre-wrap">{s.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500">Category</label>
                <select value={upCategory} onChange={e => setUpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select value={upStatus} onChange={e => setUpStatus(e.target.value as Status)} className="w-full px-3 py-2 border rounded-lg">
                  {statusOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Choose a file to upload (PDF will be analyzed into scenes)</p>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button disabled={!file || uploading} onClick={onUpload} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                {uploading ? 'Uploading...' : 'Analyze & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
