import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Accounts from './components/Accounts';
import Settings from './components/Settings';
import VoiceAssistant from './components/VoiceAssistant';

const AppContent: React.FC = () => {
  const { state } = useApp();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'accounts':
        return <Accounts />;
      case 'settings':
        return <Settings />;
      case 'reports':
        return <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
          <div className="card">
            <p className="text-xl text-gray-600 mb-6">Advanced reporting features are coming soon!</p>
            <p className="text-lg text-gray-600">
              This section will include detailed business analytics, financial reports, and performance metrics.
            </p>
          </div>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" lang={state.language}>
      <Navigation />
      <div className="pb-24">
        {renderCurrentView()}
      </div>
      <VoiceAssistant />
      
      {/* Loading overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex items-center space-x-4">
            <div className="loading-spinner" />
            <span className="text-xl font-semibold text-gray-900">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;