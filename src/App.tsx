import React, { useState } from 'react';
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
import Reports from './components/Reports';
import VoiceAssistant from './components/VoiceAssistant';
import FeedbackModal from './components/FeedbackModal';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks';
import { Mic, Lightbulb } from 'lucide-react';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { toasts, removeToast } = useToast();

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
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" lang={state.language}>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Navigation />
      <div className="pb-24">
        {renderCurrentView()}
      </div>
      
      {/* Voice Assistant Toggle Button */}
      <button
        onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-40 ${
          showVoiceAssistant 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label={showVoiceAssistant ? 'Ocultar asistente de voz' : 'Mostrar asistente de voz'}
        title={showVoiceAssistant ? 'Ocultar asistente de voz' : 'Mostrar asistente de voz'}
      >
        <Mic className="h-6 w-6 text-white" />
      </button>

      {/* Feedback Button */}
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="fixed bottom-24 right-6 p-4 rounded-full bg-green-600 hover:bg-green-700 shadow-2xl transition-all duration-300 z-40"
        aria-label="Enviar feedback"
        title="Comparte tu feedback"
      >
        <Lightbulb className="h-6 w-6 text-white" />
      </button>

      {/* Voice Assistant - Only show when toggled */}
      {showVoiceAssistant && (
        <div className="fixed bottom-24 right-6 z-40">
          <VoiceAssistant />
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      
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