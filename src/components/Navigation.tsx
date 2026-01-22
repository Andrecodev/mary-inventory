import React, { useState } from 'react';
import { LayoutDashboard, Package, Users, Truck, Settings, Wifi, WifiOff, CreditCard, Home, HelpCircle, LogOut, User, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/translations';

const Navigation: React.FC = () => {
  const { state, dispatch } = useApp();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard', state.language), description: 'View business overview and statistics' },
    { id: 'inventory', icon: Package, label: t('inventory', state.language), description: 'Manage products and stock levels' },
    { id: 'customers', icon: Users, label: t('customers', state.language), description: 'Manage customer information and accounts' },
    { id: 'suppliers', icon: Truck, label: t('suppliers', state.language), description: 'Manage supplier relationships' },
    { id: 'accounts', icon: CreditCard, label: t('accounts', state.language), description: 'Track money owed and payments' },
    { id: 'settings', icon: Settings, label: t('settings', state.language), description: 'Configure system preferences' },
  ];

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <nav className="bg-white border-b-4 border-gray-300 px-4 md:px-6 py-4" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-12">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Package className="h-8 md:h-12 w-8 md:w-12 text-blue-700" aria-hidden="true" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">InvenFlow</h1>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Business Management System</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id as any })}
                  className={`nav-item ${
                    state.currentView === item.id ? 'nav-item-active' : 'nav-item-inactive'
                  }`}
                  aria-current={state.currentView === item.id ? 'page' : undefined}
                  title={item.description}
                >
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'es' : 'en' })}
              className="hidden md:flex btn-secondary items-center space-x-2"
              aria-label={`Cambiar a ${state.language === 'en' ? 'Español' : 'Inglés'}`}
            >
              <span>{state.language === 'en' ? 'Español' : 'English'}</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2 rounded-lg bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition-colors"
                aria-label="Menú de usuario"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-3 w-3 md:h-5 md:w-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border-2 border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.user_metadata?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      dispatch({ type: 'SET_VIEW', payload: 'settings' });
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Configuración</span>
                  </button>

                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-3 transition-colors text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Sidebar */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Menú</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              
              <div className="py-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      dispatch({ type: 'SET_VIEW', payload: item.id as any });
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-4 flex items-center space-x-3 transition-colors ${
                      state.currentView === item.id 
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-current={state.currentView === item.id ? 'page' : undefined}
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'es' : 'en' });
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {state.language === 'en' ? '🇪🇸 Español' : '🇬🇧 English'}
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Navigation;