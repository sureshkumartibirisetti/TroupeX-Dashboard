import React from 'react';
// import {} FileText } from 'lucide-react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Video, 
  MapPin, 
  Package, 
  User,
  FileText,
  UserPlus,
  ClipboardList,
  Navigation,
  LogOut,
  CalendarDays,
  CheckSquare,
  UserCircle,
  Shirt,
  FileStack
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'scheduling', label: 'Scheduling', icon: CalendarDays },
    { id: 'CrewPage', label: 'CrewPage', icon: Users },
    // { id: 'crew', label: 'Crew Management', icon: Users },  
    // { id: 'enhanced-crew', label: 'Enhanced Crew', icon: UserPlus },
    // { id: 'equipment', label: 'Equipment', icon: Package },
    // { id: 'location', label: 'Location Scouting', icon: MapPin },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare } ,
    {id:'create-callsheets',label:'Call Sheets',icon:ClipboardList},
    { id: "CastPage",  label: "Cast",      icon: UserCircle }, 
    { id: 'enhanced-location', label: 'Enhanced Locations', icon: MapPin },
    { id: 'costume', label: 'Costume Design', icon: Shirt },
    { id: 'create-scripts', label: 'Create Scripts', icon: FileText },
    { id: 'documents', label: 'Document Management', icon: FileStack },
    { id: "PropPage",  label: "Props", icon: Package },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Production Management</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};