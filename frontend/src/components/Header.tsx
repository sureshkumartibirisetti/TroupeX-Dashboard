import React from 'react';
import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement global search functionality here
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <h2 className="text-xl font-semibold text-gray-800 mr-8">
            Production Management System
          </h2>
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search projects, crew, locations..."
            className="flex-1 max-w-md"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-6 border-l border-gray-300"></div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};