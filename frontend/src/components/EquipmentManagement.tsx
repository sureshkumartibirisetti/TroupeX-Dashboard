import React, { useEffect, useState } from 'react';
import { Camera, Search, Filter, Edit, MoreHorizontal, ChevronDown, X } from 'lucide-react';

type EquipmentItem = {
  id: number;
  name: string;
  category: 'Camera' | 'Lighting' | 'Sound' | 'Grip' | 'Others' | string;
  status: 'Available' | 'Reserved' | 'Checked Out' | 'Maintenance' | string;
  condition: 'Excellent' | 'Good' | 'Needs Repair' | string;
  ownership: 'Owned' | 'Rented' | string;
  lastService: string;
  serialNumber: string;
};

const EquipmentManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ===== Data as state so we can add/update rows =====
  const [equipment, setEquipment] = useState<EquipmentItem[]>([
    {
      id: 1,
      name: 'Canon C300 Mark III',
      category: 'Camera',
      status: 'Available',
      condition: 'Excellent',
      ownership: 'Owned',
      lastService: '2024-01-15',
      serialNumber: 'CC300-2024-001'
    },
    {
      id: 2,
      name: 'Arri Skypanel S60-C',
      category: 'Lighting',
      status: 'Reserved',
      condition: 'Good',
      ownership: 'Rented',
      lastService: '2024-02-10',
      serialNumber: 'AS60C-2024-002'
    },
    {
      id: 3,
      name: 'Zoom H6 Handy Recorder',
      category: 'Sound',
      status: 'Checked Out',
      condition: 'Good',
      ownership: 'Rented',
      lastService: '2024-01-20',
      serialNumber: 'ZH6-2024-003'
    },
    {
      id: 4,
      name: 'DJI Ronin-S Gimbal',
      category: 'Grip',
      status: 'Maintenance',
      condition: 'Needs Repair',
      ownership: 'Owned',
      lastService: '2023-12-15',
      serialNumber: 'DRS-2024-004'
    },
    {
      id: 5,
      name: 'Canon C300 Mark III',
      category: 'Camera',
      status: 'Available',
      condition: 'Excellent',
      ownership: 'Owned',
      lastService: '2024-01-15',
      serialNumber: 'CC300-2024-005'
    },
    {
      id: 6,
      name: 'Arri Skypanel S60-C',
      category: 'Lighting',
      status: 'Reserved',
      condition: 'Good',
      ownership: 'Rented',
      lastService: '2024-02-10',
      serialNumber: 'AS60C-2024-006'
    }
  ]);

  const categories = ['All', 'Camera', 'Lighting', 'Sound', 'Grip', 'Others'];
  const statuses = ['Available', 'Reserved', 'Checked Out', 'Maintenance'];
  const conditions = ['Excellent', 'Good', 'Needs Repair'];
  const ownerships = ['Owned', 'Rented'];

  // ===== Row-scoped dropdown state to prevent "stuck" menus =====
  const [openCategoryRow, setOpenCategoryRow] = useState<number | null>(null);
  const [openConditionRow, setOpenConditionRow] = useState<number | null>(null);
  const [openActionsRow, setOpenActionsRow] = useState<number | null>(null);

  // Close any open row menus when clicking outside
  useEffect(() => {
    const onDocClick = () => {
      setOpenCategoryRow(null);
      setOpenConditionRow(null);
      setOpenActionsRow(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Stop propagation for menu buttons/menus so they don’t close immediately
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Reserved': return 'bg-yellow-100 text-yellow-800';
      case 'Checked Out': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Needs Repair': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getFilteredEquipment = () => {
    if (selectedCategory === 'all' || selectedCategory === 'All') return equipment;
    return equipment.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
  };

  // ===== Add Equipment Modal (same pattern as Costume) =====
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<Omit<EquipmentItem, 'id'>>({
    name: '',
    category: 'Camera',
    status: 'Available',
    condition: 'Excellent',
    ownership: 'Owned',
    lastService: '',
    serialNumber: ''
  });

  const openAdd = () => {
    setForm({
      name: '',
      category: 'Camera',
      status: 'Available',
      condition: 'Excellent',
      ownership: 'Owned',
      lastService: '',
      serialNumber: ''
    });
    setOpenModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const nextId = (equipment.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
    const newRow: EquipmentItem = { id: nextId, ...form };
    setEquipment(prev => [newRow, ...prev]);
    setOpenModal(false);
  };

  // ===== In-row updates from dropdowns =====
  const updateRow = (rowId: number, patch: Partial<EquipmentItem>) => {
    setEquipment(prev => prev.map(r => (r.id === rowId ? { ...r, ...patch } : r)));
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Equipment Inventory</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); openAdd(); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Equipment
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Equipment Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Condition</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Ownership</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredEquipment().map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.serialNumber}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category dropdown (per row) */}
                  <td className="py-4 px-6">
                    <div className="relative" onClick={stop}>
                      <button
                        onClick={() => {
                          setOpenCategoryRow(openCategoryRow === item.id ? null : item.id);
                          setOpenConditionRow(null);
                          setOpenActionsRow(null);
                        }}
                        className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        {item.category}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {openCategoryRow === item.id && (
                        <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 min-w-32">
                          {categories.filter(c => c !== 'All').map((cat) => (
                            <button
                              key={cat}
                              onClick={() => { updateRow(item.id, { category: cat }); setOpenCategoryRow(null); }}
                              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status (badge) */}
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Condition dropdown (per row) */}
                  <td className="py-4 px-6">
                    <div className="relative" onClick={stop}>
                      <button
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                        onClick={() => {
                          setOpenConditionRow(openConditionRow === item.id ? null : item.id);
                          setOpenCategoryRow(null);
                          setOpenActionsRow(null);
                        }}
                      >
                        <span className={`font-medium ${getConditionColor(item.condition)}`}>{item.condition}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {openConditionRow === item.id && (
                        <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 min-w-32">
                          {conditions.map(cond => (
                            <button
                              key={cond}
                              onClick={() => { updateRow(item.id, { condition: cond }); setOpenConditionRow(null); }}
                              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Ownership (static text here) */}
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{item.ownership}</span>
                  </td>

                  {/* Row actions dropdown */}
                  <td className="py-4 px-6">
                    <div className="relative" onClick={stop}>
                      <button
                        className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        onClick={() => {
                          setOpenActionsRow(openActionsRow === item.id ? null : item.id);
                          setOpenCategoryRow(null);
                          setOpenConditionRow(null);
                        }}
                      >
                        Edit
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {openActionsRow === item.id && (
                        <div className="absolute right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 min-w-32">
                          <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Edit
                          </button>
                          <button onClick={() => updateRow(item.id, { status: 'Reserved' })} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Reserve
                          </button>
                          <button onClick={() => updateRow(item.id, { status: 'Checked Out' })} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Check-out
                          </button>
                          <button onClick={() => updateRow(item.id, { status: 'Maintenance' })} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Maintenance
                          </button>
                          <button
                            onClick={() => setEquipment(prev => prev.filter(r => r.id !== item.id))}
                            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing 1 to {Math.min(6, getFilteredEquipment().length)} of {equipment.length} results
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50" onClick={() => setOpenModal(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200" onClick={stop}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Equipment</h3>
                <button onClick={() => setOpenModal(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Equipment Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., Canon C300 Mark III"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ownership</label>
                  <select
                    name="ownership"
                    value={form.ownership}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ownerships.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Service</label>
                  <input
                    name="lastService"
                    type="date"
                    value={form.lastService}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Serial Number</label>
                  <input
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleFormChange}
                    placeholder="e.g., CC300-2024-007"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Equipment
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

export default EquipmentManagement;
