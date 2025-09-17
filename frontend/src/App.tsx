import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Dashboard  from './components/Dashboard';
import { Profile } from './components/Profile';
import  Scheduling  from './components/Scheduling';
import CallSheetEditor from './components/CallSheetEditor';
import CrewManagement from './components/CrewManagement';
import { EnhancedCrewManagement } from './components/EnhancedCrewManagement';
import EquipmentManagement  from './components/EquipmentManagement';
import  LocationScouting  from './components/LocationScouting';
import CrewPage from './components/CrewPage';
import PropPage from "./components/PropPage";
import TasksPage from './components/TasksPage';
import { EnhancedLocationScouting } from './components/EnhancedLocationScouting';
import CastPage from './components/CastPage';
import CostumeDesign  from './components/CostumeDesign';
import { DocumentManagement } from './components/DocumentManagement';
import { AdminAuth } from './components/AdminAuth';
import ScriptEditor from './components/ScriptEditor';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (authStatus: boolean) => {
    setIsAuthenticated(authStatus);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Show admin authentication if not logged in
  if (!isAuthenticated) {
    return <AdminAuth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'scheduling':
        return <Scheduling />;
      case 'CrewPage':
        return <CrewPage />; 
      // case 'crew':
      //   return <CrewManagement />;
      // case 'enhanced-crew':
      //   return <EnhancedCrewManagement />;
      // case 'equipment':
      //   return <EquipmentManagement />;
      // case 'location':
      //   return <LocationScouting />;
      case "PropPage":
        return <PropPage />;
      case 'create-callsheets':
        return <CallSheetEditor />;
      case 'tasks':
        return <TasksPage />;
      case 'CastPage':
        return <CastPage/>;
      case 'enhanced-location':
        return <EnhancedLocationScouting />;
      case 'costume':
        return <CostumeDesign />;
      case 'documents':
        return <DocumentManagement />;
      case 'create-scripts':
        return <ScriptEditor />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;