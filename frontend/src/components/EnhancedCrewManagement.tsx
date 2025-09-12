import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: number;
  location: string;
  joinDate: string;
  skills: string[];
  experience: string;
  photo?: string;
}

export const EnhancedCrewManagement: React.FC = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Director of Photography',
      department: 'Camera',
      email: 'sarah@example.com',
      phone: '+1 234-567-8901',
      availability: 'available',
      hourlyRate: 150,
      location: 'Los Angeles, CA',
      joinDate: '2024-01-15',
      skills: ['RED Camera', 'Lighting', 'Color Grading'],
      experience: '8 years'
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Sound Engineer',
      department: 'Audio',
      email: 'mike@example.com',
      phone: '+1 234-567-8902',
      availability: 'busy',
      hourlyRate: 120,
      location: 'New York, NY',
      joinDate: '2024-01-10',
      skills: ['Pro Tools', 'Boom Operation', 'Sound Design'],
      experience: '5 years'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Gaffer',
      department: 'Electrical',
      email: 'elena@example.com',
      phone: '+1 234-567-8903',
      availability: 'available',
      hourlyRate: 130,
      location: 'Atlanta, GA',
      joinDate: '2024-01-12',
      skills: ['LED Lighting', 'Electrical Safety', 'HMI'],
      experience: '6 years'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const departments = ['Camera', 'Audio', 'Electrical', 'Grip', 'Production', 'Post-Production'];
  const availabilityOptions = ['available', 'busy', 'unavailable'];

  const filteredCrew = crewMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesAvailability = filterAvailability === 'all' || member.availability === filterAvailability;
    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddCrew = () => {
    setShowAddModal(true);
  };

  const handleViewDetails = (member: CrewMember) => {
    setSelectedCrew(member);
    setShowDetailModal(true);
  };

  const handleDeleteCrew = (id: string) => {
    setCrewMembers(crewMembers.filter(member => member.id !== id));
  };

  const handleHire = (member: CrewMember) => {
    // Handle hire functionality
    alert(`Hiring ${member.name} for the project!`);
  };

  const handleContact = (member: CrewMember) => {
    // Handle contact functionality
    window.open(`mailto:${member.email}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Crew Management</h1>
            <p className="text-gray-600 mt-2">Manage your production crew and talent</p>
          </div>
          <button 
            onClick={handleAddCrew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Crew Member
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crew members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Availability</option>
              {availabilityOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Crew Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrew.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-lg">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(member.availability)}`}>
                  {member.availability}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {member.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  ${member.hourlyRate}/hour
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {member.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="text-xs text-gray-500">+{member.skills.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(member)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleContact(member)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Contact"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 p-1" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCrew(member.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleHire(member)}
                  disabled={member.availability === 'unavailable'}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Hire
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCrew.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No crew members found matching your criteria.</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCrew && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crew Member Details</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold text-xl">
                        {selectedCrew.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCrew.name}</h3>
                      <p className="text-gray-600">{selectedCrew.role}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getAvailabilityColor(selectedCrew.availability)}`}>
                        {selectedCrew.availability}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <p className="text-gray-900">{selectedCrew.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <p className="text-gray-900">{selectedCrew.experience}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                      <p className="text-gray-900">${selectedCrew.hourlyRate}/hour</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Information</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedCrew.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedCrew.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedCrew.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCrew.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => handleContact(selectedCrew)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Contact
                </button>
                <button 
                  onClick={() => handleHire(selectedCrew)}
                  disabled={selectedCrew.availability === 'unavailable'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Hire for Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Crew Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Crew Member</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </form>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Add Crew Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};