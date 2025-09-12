import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search...", 
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setIsExpanded(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center bg-white border border-gray-300 rounded-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-64'
      }`}>
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => !query && setIsExpanded(false)}
          className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-gray-700"
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="p-1 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-3 text-sm text-gray-500">
            Searching for: <span className="font-medium text-gray-900">"{query}"</span>
          </div>
        </div>
      )}
    </div>
  );
};