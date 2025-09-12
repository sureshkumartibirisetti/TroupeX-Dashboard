import React, { useState } from 'react';
import { MapPin, Plus, Search, Eye, Edit, Trash2, Star, Calendar, DollarSign, Camera } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  availability: 'available' | 'booked' | 'pending';
  price: number;
  rating: number;
  description: string;
  features: string[];
  images: string[];
  contact: string;
  notes: string;
}

export const EnhancedLocationScouting: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Downtown Loft Studio',
      address: '123 Main St, Downtown LA',
      type: 'Studio',
      availability: 'available',
      price: 500,
      rating: 4.5,
      description: 'Modern loft space with natural lighting and city views',
      features: ['Natural Light', 'City View', 'Kitchen', 'Parking'],
      images: ['loft1.jpg', 'loft2.jpg'],
      contact: 'John Doe - (555) 123-4567',
      notes: 'Great for interviews and small commercial shoots'
    },
    {
      id: '2',
      name: 'Vintage Warehouse',
      address: '456 Industrial Blvd, Arts District',
      type: 'Warehouse',
      availability: 'pending',
      price: 800,
      rating: 4.8,
      description: 'Large warehouse space with industrial aesthetic',
      features: ['High Ceilings', 'Loading Dock', 'Power Grid', 'Flexible Space'],
      images: ['warehouse1.jpg'],
      contact: 'Jane Smith - (555) 987-6543',
      notes: 'Perfect for music videos and commercials'
    },
    {
      id: '3',
      name: 'Beachside Cafe',
      address: '789 Ocean Ave, Santa Monica',
      type: 'Restaurant',
      availability: 'booked',
      price: 300,
      rating: 4.2,
      description: 'Cozy cafe with ocean views and vintage decor',
      features: ['Ocean View', 'Vintage Decor', 'Full Kitchen', 'Outdoor Seating'],
      images: ['cafe1.jpg', 'cafe2.jpg', 'cafe3.jpg'],
      contact: 'Mike Johnson - (555) 456-7890',
      notes: 'Available early mornings before opening'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const locationTypes = ['Studio', 'Warehouse', 'Restaurant', 'Office', 'Outdoor', 'Residential'];
  const availabilityOptions = ['available', 'booked', 'pending'];

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || location.type === filterType;
    const matchesAvailability = filterAvailability === 'all' || location.availability === filterAvailability;
    return matchesSearch && matchesType && matchesAvailability;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddLocation = () => {
    setShowAddModal(true);
  };

  const handleViewDetails = (location: Location) => {
    setSelectedLocation(location);
    setShowDetailModal(true);
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(location => location.id !== id));
  };

  const handleBookLocation = (location: Location) => {
    // Handle booking functionality
    setLocations(locations.map(loc => 
      loc.id === location.id 
        ? { ...loc, availability: 'booked' as const }
        : loc
    ));
    alert(`Location "${location.name}" has been booked!`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Location Scouting</h1>
            <p className="text-gray-600 mt-2">Discover and manage filming locations</p>
          </div>
          <button 
            onClick={handleAddLocation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {locationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
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

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white opacity-75" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(location.availability)}`}>
                    {location.availability}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-1">
                    {renderStars(location.rating)}
                    <span className="text-sm ml-1">{location.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{location.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {location.type}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{location.address}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{location.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-green-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">${location.price}/day</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {location.images.length} photos
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {location.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                  {location.features.length > 3 && (
                    <span className="text-xs text-gray-500">+{location.features.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(location)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-1" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleBookLocation(location)}
                    disabled={location.availability === 'booked'}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {location.availability === 'booked' ? 'Booked' : 'Book Location'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No locations found matching your criteria.</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedLocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {/* Image Gallery */}
                  <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-4 relative">
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg">
                      <Camera className="w-16 h-16 text-white opacity-75" />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-1">
                        {renderStars(selectedLocation.rating)}
                        <span className="ml-2">{selectedLocation.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{selectedLocation.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedLocation.address}
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getAvailabilityColor(selectedLocation.availability)}`}>
                        {selectedLocation.availability}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <p className="text-gray-900">{selectedLocation.description}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <p className="text-gray-900">{selectedLocation.notes}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-green-600 mb-1">
                        <DollarSign className="w-5 h-5 mr-1" />
                        <span className="font-semibold text-lg">${selectedLocation.price}</span>
                      </div>
                      <span className="text-sm text-gray-600">per day</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-semibold text-gray-900">{selectedLocation.type}</span>
                      </div>
                      <span className="text-sm text-gray-600">Location Type</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features & Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.features.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                    <p className="text-gray-900">{selectedLocation.contact}</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => handleBookLocation(selectedLocation)}
                      disabled={selectedLocation.availability === 'booked'}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {selectedLocation.availability === 'booked' ? 'Already Booked' : 'Book This Location'}
                    </button>
                    <button className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                      Save to Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Location Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add New Location</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Location Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Type</option>
                    {locationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Full Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Price per day ($)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact Information"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
                <textarea
                  placeholder="Features (comma separated)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
                <textarea
                  placeholder="Additional Notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </form>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Add Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
