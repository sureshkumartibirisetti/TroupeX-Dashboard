import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Save, X } from 'lucide-react';

interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  bio: string;
  skills: string[];
  projects: number;
  department: string;
}

export const EnhancedProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Anderson',
    role: 'Production Manager',
    email: 'john.anderson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, CA',
    joinDate: '2023-01-15',
    bio: 'Experienced production manager with over 10 years in the film industry. Passionate about bringing creative visions to life through efficient project management and team coordination.',
    skills: ['Project Management', 'Budget Planning', 'Team Leadership', 'Risk Assessment', 'Vendor Relations'],
    projects: 47,
    department: 'Production'
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (skills: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Details</h1>
            <p className="text-gray-600 mt-2">Manage your professional information</p>
          </div>
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button 
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {!isEditing ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{profile.name}</h2>
                  <p className="text-gray-600 mb-4">{profile.role}</p>
                  <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm mb-4">
                    {profile.department}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile.projects}</div>
                    <div className="text-sm text-gray-600">Projects Completed</div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold"
                  />
                  <input
                    type="text"
                    value={editedProfile.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                  <select
                    value={editedProfile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Camera">Camera</option>
                    <option value="Audio">Audio</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Post-Production">Post-Production</option>
                  </select>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Projects</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {!isEditing ? (
                    <p className="text-gray-900">{profile.email}</p>
                  ) : (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {!isEditing ? (
                    <p className="text-gray-900">{profile.phone}</p>
                  ) : (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  {!isEditing ? (
                    <p className="text-gray-900">{profile.location}</p>
                  ) : (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Join Date
                  </label>
                  <p className="text-gray-900">{new Date(profile.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
                {!isEditing ? (
                  <p className="text-gray-900 leading-relaxed">{profile.bio}</p>
                ) : (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Expertise</label>
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={editedProfile.skills.join(', ')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      placeholder="Enter skills separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Separate multiple skills with commas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Project "Urban Stories" completed</h4>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-gray-600 text-sm">Successfully delivered the final cut on schedule</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">New team member onboarded</h4>
                    <span className="text-sm text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-gray-600 text-sm">Added Sarah Johnson as Director of Photography</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Budget review meeting</h4>
                    <span className="text-sm text-gray-500">2 weeks ago</span>
                  </div>
                  <p className="text-gray-600 text-sm">Reviewed Q1 budget allocations with finance team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};