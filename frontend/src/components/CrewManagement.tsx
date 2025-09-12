import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Phone, Mail, Star, X } from 'lucide-react';

type Crew = {
  id: number;
  name: string;
  role: string;
  department: string;
  availability: 'Available' | 'Fully Available' | 'Tentative' | 'Unavailable' | string;
  phone: string;
  email: string;
  experience: string;
  skills: string[];
  languages: string[];
  status: 'Active' | 'Inactive' | string;
  avatar: string; // initials
};

const CrewManagement: React.FC = () => {
  // ----------------- Departments (expanded) -----------------
  const [departments, setDepartments] = useState<string[]>([
    'All Departments',
    'Direction Department',
    'Cinematography Department',
    'Production Department',
    'Production Design & Art Department',
    'Costume & Wardrobe Department',
    'Hair & Makeup Department',
    'Sound Department',
    'Lighting & Grip Department',
    'Action / Stunts Department',
    'VFX & Post Production Department',
    'Editing Department',
    'Color & DI Department',
    'Music & Background Score Department',
    'Casting Department',
    'Locations Department',
    'Script & Continuity Department',
    'Publicity & Marketing Department',
    'Accounts / Line Production Department',
    'Actors / Cast',
    'Others'
  ]);

  // ----------------- State -----------------
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [selectedMember, setSelectedMember] = useState<Crew | null>(null);

  const [crewMembers, setCrewMembers] = useState<Crew[]>([
    {
      id: 1,
      name: 'Arjun Rao',
      role: 'Director',
      department: 'Direction Department',
      availability: 'Available',
      phone: '+91 98765 43210',
      email: 'arjun.rao@example.com',
      experience: '8 years',
      skills: ['Assistant Direction Expertise', 'Cinematography basics', 'Drone Operation Certified', 'First Aid Certified'],
      languages: ['Telugu', 'Hindi', 'English'],
      status: 'Active',
      avatar: 'AR'
    },
    {
      id: 2,
      name: 'Amit Sharma',
      role: 'Assistant Director (1st AD)',
      department: 'Direction Department',
      availability: 'Tentative',
      phone: '+91 98765 43211',
      email: 'amit.sharma@example.com',
      experience: '5 years',
      skills: ['Script Continuity', 'Crew Coordination'],
      languages: ['Hindi', 'English'],
      status: 'Active',
      avatar: 'AS'
    },
    {
      id: 3,
      name: 'Priya Menon',
      role: 'Continuity Supervisor',
      department: 'Script & Continuity Department',
      availability: 'Fully Available',
      phone: '+91 98765 43212',
      email: 'priya.menon@example.com',
      experience: '6 years',
      skills: ['Script Supervision', 'Continuity Management'],
      languages: ['Malayalam', 'Hindi', 'English'],
      status: 'Active',
      avatar: 'PM'
    },
    {
      id: 4,
      name: 'Vikram Reddy',
      role: 'Director of Photography (DOP)',
      department: 'Cinematography Department',
      availability: 'Available',
      phone: '+91 98765 43213',
      email: 'vikram.reddy@example.com',
      experience: '10 years',
      skills: ['Camera Operation', 'Lighting Design', 'Color Grading'],
      languages: ['Telugu', 'Hindi', 'English'],
      status: 'Active',
      avatar: 'VR'
    }
  ]);

  // ----------------- Helpers -----------------
  const getFilteredMembers = () => {
    if (selectedDepartment === 'All Departments') return crewMembers;
    return crewMembers.filter(m => m.department === selectedDepartment);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
      case 'Fully Available':
        return 'bg-green-100 text-green-800';
      case 'Tentative':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ----------------- Add Crew Modal -----------------
  const [open, setOpen] = useState(false);
  const [customDeptMode, setCustomDeptMode] = useState(false);
  const [form, setForm] = useState<Omit<Crew, 'id' | 'skills' | 'languages'>>({
    name: '',
    role: '',
    department: 'Direction Department',
    availability: 'Available',
    phone: '',
    email: '',
    experience: '',
    status: 'Active',
    avatar: ''
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [customDept, setCustomDept] = useState('');

  const resetForm = () => {
    setForm({
      name: '',
      role: '',
      department: 'Direction Department',
      availability: 'Available',
      phone: '',
      email: '',
      experience: '',
      status: 'Active',
      avatar: ''
    });
    setSkillsInput('');
    setLanguagesInput('');
    setCustomDept('');
    setCustomDeptMode(false);
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'department') {
      const isOthers = value === 'Others';
      setCustomDeptMode(isOthers);
      if (!isOthers) setCustomDept('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;

    const finalDept = customDeptMode && customDept.trim() ? customDept.trim() : form.department;

    // Add custom department into the list if it's new
    if (!departments.includes(finalDept)) {
      setDepartments(prev => [...prev.filter(d => d !== 'Others'), finalDept, 'Others']);
    }

    const nextId = (crewMembers.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const languages = languagesInput
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    const initials = form.avatar?.trim()
      ? form.avatar.trim().slice(0, 2).toUpperCase()
      : form.name
          .split(' ')
          .map(p => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

    const newCrew: Crew = {
      id: nextId,
      name: form.name,
      role: form.role,
      department: finalDept,
      availability: form.availability,
      phone: form.phone,
      email: form.email,
      experience: form.experience || '—',
      status: form.status,
      avatar: initials,
      skills,
      languages
    };

    setCrewMembers(prev => [newCrew, ...prev]);
    setOpen(false);
    // Optional: auto-select that department and highlight the member
    setSelectedDepartment(finalDept);
    setSelectedMember(newCrew);
  };

  return (
    <div className="p-6">
      <div className="flex gap-6 h-full">
        {/* Left Panel - Departments */}
        <div className="w-1/4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Departments & Associated Roles</h2>
            <button
              onClick={openAdd}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Crew
            </button>
          </div>

          <div className="space-y-1">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Panel - Crew List */}
        <div className="w-1/2 bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{selectedDepartment}</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crew..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Example Department Sections */}
          <div className="space-y-6">
            {/* Direction Section */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                Direction Department
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {getFilteredMembers().filter(m => m.department === 'Direction Department').length}
                </span>
              </h3>

              {/* HOD if exists */}
              {crewMembers
                .filter(m => m.department === 'Direction Department' && m.role.toLowerCase().includes('director'))
                .slice(0, 1)
                .map((hod) => (
                  <div key={hod.id} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Head of the Department</h4>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{hod.avatar}</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{hod.name}</h5>
                          <p className="text-sm text-gray-600">{hod.role}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getAvailabilityColor(hod.availability)}`}>
                            {hod.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members</h4>
                <div className="grid grid-cols-2 gap-3">
                  {getFilteredMembers()
                    .filter(member => member.department === 'Direction Department' && !member.role.toLowerCase().includes('director'))
                    .map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{member.avatar}</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">{member.name}</h5>
                            <p className="text-xs text-gray-600">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Cinematography Section */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                Cinematography Department
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {getFilteredMembers().filter(m => m.department === 'Cinematography Department').length}
                </span>
              </h3>

              {/* HOD if exists */}
              {crewMembers
                .filter(m => m.department === 'Cinematography Department' && m.role.toLowerCase().includes('director of photography'))
                .slice(0, 1)
                .map((hod) => (
                  <div key={hod.id} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Head of the Department</h4>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{hod.avatar}</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{hod.name}</h5>
                          <p className="text-sm text-gray-600">{hod.role}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getAvailabilityColor(hod.availability)}`}>
                            {hod.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Member Details */}
        <div className="w-1/4 bg-white rounded-lg border border-gray-200 p-4">
          {selectedMember ? (
            <div>
              <div className="mb-4">
                <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm">
                  Detailed Card ↗
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-lg font-medium">{selectedMember.avatar}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{selectedMember.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedMember.role}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getAvailabilityColor(selectedMember.availability)}`}>
                  {selectedMember.availability}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Role & Department:</h4>
                  <p className="text-sm text-gray-600">{selectedMember.role}</p>
                  <p className="text-sm text-gray-600">{selectedMember.department}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Info:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {selectedMember.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {selectedMember.email}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills & Certifications:</h4>
                  <div className="space-y-1">
                    {selectedMember.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Languages:</h4>
                  <p className="text-sm text-gray-600">{selectedMember.languages.join(', ')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a crew member to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Crew Modal */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Crew Member</h3>
                <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., Sita Narayan"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Avatar (Initials)</label>
                  <input
                    name="avatar"
                    value={form.avatar}
                    onChange={handleFormChange}
                    placeholder="e.g., SN"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g., 1st AC, Script Supervisor, Gaffer"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Availability</label>
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['Available','Fully Available','Tentative','Unavailable'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Department</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.filter(d => d !== 'All Departments').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {customDeptMode && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Custom Department</label>
                    <input
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      placeholder="Type new department name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="+91 ..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="name@domain.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Experience</label>
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleFormChange}
                    placeholder="e.g., 4 years"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Skills (comma separated)</label>
                  <input
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g., Gimbal Op, Color Grading, ADR"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Languages (comma separated)</label>
                  <input
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="e.g., Telugu, Hindi, English"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['Active','Inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Crew
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

export default CrewManagement;
