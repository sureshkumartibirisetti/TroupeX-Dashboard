import React, { useState } from 'react';
import { MapPin, Search, Filter, Phone, Mail, Car, Zap, Wifi, Users, Shield, Clock } from 'lucide-react';

const LocationScouting: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const locations = [
    {
      id: 1,
      name: 'Hyderabad Film Studio - Hall A',
      status: 'Available',
      price: 50000,
      owner: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.charminar@example.com',
      address: '20-4-15, Charminar, Hyderabad, Telangana, India',
      gps: '17.3616°N, 78.4747°E',
      availability: 'May 1-10',
      permit: 'Pending (Expected April 28)',
      parking: 'Nearby paid parking',
      loadAccess: 'Moderate',
      restrooms: 'Available nearby',
      powerSource: 'Generator available on site',
      internet: 'Not Available',
      noise: 'High ambient street noise (crowded area)',
      facilities: ['Generator', 'Security', 'Catering Area'],
      images: ['https://images.pexels.com/photos/1024248/pexels-photo-1024248.jpeg']
    },
    {
      id: 2,
      name: 'Mumbai Beach Resort',
      status: 'Tentative',
      price: 75000,
      owner: 'Shruti Sharma',
      phone: '+91 98765 43211',
      email: 'shruti.sharma@example.com',
      address: 'Marine Drive, Mumbai, Maharashtra, India',
      gps: '18.9220°N, 72.8347°E',
      availability: 'May 15-25',
      permit: 'Approved',
      parking: 'Valet parking available',
      loadAccess: 'Easy',
      restrooms: 'Premium facilities',
      powerSource: 'Grid power with backup',
      internet: 'High-speed WiFi',
      noise: 'Low ambient noise',
      facilities: ['WiFi', 'Catering', 'Security', 'Equipment Storage'],
      images: ['https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg']
    },
    {
      id: 3,
      name: 'Heritage Palace Courtyard',
      status: 'Booked',
      price: 30000,
      owner: 'Ramesh Patil',
      phone: '+91 98765 43212',
      email: 'ramesh.patil@example.com',
      address: 'Old City, Jaipur, Rajasthan, India',
      gps: '26.9124°N, 75.7873°E',
      availability: 'May 5-12',
      permit: 'Required - In Process',
      parking: 'Limited street parking',
      loadAccess: 'Difficult',
      restrooms: 'Basic facilities',
      powerSource: 'Grid power only',
      internet: 'Limited connectivity',
      noise: 'Moderate traffic noise',
      facilities: ['Historical Architecture', 'Natural Lighting'],
      images: ['https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Tentative': return 'bg-yellow-100 text-yellow-800';
      case 'Booked': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-6 h-full">
        {/* Left Panel - Location List */}
        <div className="w-1/2 bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Locations</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                  selectedLocation?.id === location.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {location.address.split(',').slice(-2).join(', ')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(location.status)}`}>
                    {location.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-blue-600">₹{location.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">{location.owner}</span>
                  </div>
                  <span className="text-sm text-gray-500">{location.availability}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Location Details */}
        <div className="w-1/2 bg-white rounded-lg border border-gray-200 p-4">
          {selectedLocation ? (
            <div>
              <div className="mb-6">
                <img 
                  src={selectedLocation.images[0]} 
                  alt={selectedLocation.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedLocation.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedLocation.status)}`}>
                      {selectedLocation.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-blue-600">₹{selectedLocation.price.toLocaleString()}</span>
                    <span className="text-green-600 font-medium">{selectedLocation.availability}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Detailed Info Section:</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        Address & GPS Coordinates:
                      </h4>
                      <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                      <p className="text-sm text-gray-600">GPS: {selectedLocation.gps}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" />
                        Contact Information:
                      </h4>
                      <p className="text-sm text-gray-600">Name: {selectedLocation.owner} (Location Manager)</p>
                      <p className="text-sm text-gray-600">Phone: {selectedLocation.phone}</p>
                      <p className="text-sm text-gray-600">Email: {selectedLocation.email}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4" />
                        Accessibility & Parking:
                      </h4>
                      <p className="text-sm text-gray-600">Parking Area: {selectedLocation.parking}</p>
                      <p className="text-sm text-gray-600">Load-in/Load-out convenience: {selectedLocation.loadAccess}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Facilities & Utilities:
                      </h4>
                      <p className="text-sm text-gray-600">Restrooms: {selectedLocation.restrooms}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Power Source: {selectedLocation.powerSource}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Wifi className="w-3 h-3" />
                        Internet/Wi-Fi: {selectedLocation.internet}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4" />
                        Noise Levels & Concerns:
                      </h4>
                      <p className="text-sm text-gray-600">{selectedLocation.noise}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Facilities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Book Location
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                        Add to Shortlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a location to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationScouting;