import React from 'react';
import { Package, AlertTriangle, Clock, DollarSign, Plus, BarChart3, Users, Truck, TrendingUp, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();

  const lowStockProducts = state.products.filter(p => p.quantity <= p.lowStockThreshold);
  const overduePayments = state.accountTransactions.filter(t => t.status === 'overdue');
  const totalRevenue = state.accountTransactions
    .filter(t => t.status === 'paid' && t.type === 'receivable')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const quickActions = [
    {
      icon: Plus,
      label: t('addNewProduct', state.language),
      description: 'Agregar un nuevo producto a tu inventario',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'inventory' }),
      color: 'btn-primary',
    },
    {
      icon: Users,
      label: t('addNewCustomer', state.language),
      description: 'Registrar un nuevo cliente en el sistema',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'customers' }),
      color: 'btn-success',
    },
    {
      icon: Truck,
      label: t('addNewSupplier', state.language),
      description: 'Agregar un nuevo proveedor a tu red',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'suppliers' }),
      color: 'btn-secondary',
    },
    {
      icon: BarChart3,
      label: t('viewReports', state.language),
      description: 'Acceder a reportes detallados y analíticas del negocio',
      action: () => dispatch({ type: 'SET_VIEW', payload: 'reports' }),
      color: 'btn-secondary',
    },
  ];

  return (
    <main id="main-content" className="p-4 md:p-8 max-w-7xl mx-auto" role="main">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
          {t('welcomeToDashboard', state.language)}
        </h1>
        <p className="text-base md:text-xl text-gray-700 mb-2 md:mb-4">
          {new Date().toLocaleDateString(state.language === 'en' ? 'en-US' : 'es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-sm md:text-lg text-gray-600">
          {t('businessOverview', state.language)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm md:text-lg font-semibold text-gray-700 mb-2">{t('totalProducts', state.language)}</p>
              <p className="text-2xl md:text-4xl font-bold text-gray-900">{state.products.length}</p>
            </div>
            <div className="p-2 md:p-4 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-700" aria-hidden="true" />
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'inventory' })}
            className="text-blue-700 hover:text-blue-800 font-semibold text-sm md:text-lg"
            aria-label="Ver todos los productos en el inventario"
          >
            {t('viewInventory', state.language)} →
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm md:text-lg font-semibold text-gray-700 mb-2">{t('lowStock', state.language)}</p>
              <p className="text-2xl md:text-4xl font-bold text-red-700">{lowStockProducts.length}</p>
            </div>
            <div className="p-2 md:p-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-700" aria-hidden="true" />
            </div>
          </div>
          {lowStockProducts.length > 0 && (
            <div className="flex items-center space-x-2 text-red-700">
              <Bell className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              <span className="font-semibold text-sm md:text-lg">{t('needsAttention', state.language)}</span>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pagos Vencidos</p>
              <p className="text-2xl font-bold text-amber-700">{overduePayments.length}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <Clock className="h-6 w-6 text-amber-700" aria-hidden="true" />
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'accounts' })}
            className="text-amber-700 hover:text-amber-800 font-semibold text-sm md:text-lg"
            aria-label="Ver pagos vencidos"
          >
            Revisar pagos →
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-700">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-700" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-700">
            <span className="font-semibold text-sm md:text-lg">Este Mes</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        {/* <p className="text-lg text-gray-600 mb-8">Realiza tareas comunes con un clic</p> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} flex flex-col items-center space-y-4 p-8 text-center`}
              title={action.description}
              aria-label={action.description}
            >
              <action.icon className="h-10 w-10" aria-hidden="true" />
              <span className="font-bold text-lg">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="h-7 w-7 text-red-700 mr-3" aria-hidden="true" />
              Alerta de Bajo Stock
            </h3>
            <p className="text-lg text-gray-600 mb-6">Estos productos necesitan ser reabastecidos pronto:</p>
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-red-700" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{product.name}</p>
                      <p className="text-red-700 font-semibold">Solo {product.quantity} en stock</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'inventory' })}
                    className="btn-primary"
                    aria-label={`Reabastecer ${product.name}`}
                  >
                    Reabastecer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overdue Payments */}
        {overduePayments.length > 0 && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-7 w-7 text-amber-700 mr-3" aria-hidden="true" />
              {t('overduePayments', state.language)}
            </h3>
            <p className="text-lg text-gray-600 mb-6">Estos pagos requieren atención inmediata:</p>
            <div className="space-y-4">
              {overduePayments.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-amber-700" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">${transaction.remainingAmount.toLocaleString()}</p>
                      <p className="text-amber-700 font-semibold">
                        {transaction.type === 'receivable' 
                          ? transaction.customerName || 'Cliente' 
                          : transaction.supplierName || 'Proveedor'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'accounts' })}
                    className="btn-primary"
                    aria-label={`Seguimiento de pago de $${transaction.remainingAmount}`}
                  >
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;