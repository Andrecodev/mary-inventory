import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks';
import { createCustomer, updateCustomer, deleteCustomer } from '../lib/database';
import { t } from '../utils/translations';
import { Customer, PurchaseHistory } from '../types';

const Customers: React.FC = () => {
  const { state, loadData } = useApp();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredCustomers = state.customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    return matchesSearch;
  });

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      await createCustomer(customerData, user?.id || '');
      success(`Cliente "${customerData.name}" agregado exitosamente`);
      await loadData();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding customer:', err);
      error('Error al agregar el cliente. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCustomer) {
      try {
        setIsLoading(true);
        const updatedCustomer: Customer = {
          ...customerData,
          id: editingCustomer.id,
          createdAt: editingCustomer.createdAt,
          updatedAt: new Date(),
        };
        await updateCustomer(updatedCustomer);
        success(`Cliente "${customerData.name}" actualizado exitosamente`);
        await loadData();
        setEditingCustomer(null);
      } catch (err) {
        console.error('Error updating customer:', err);
        error('Error al actualizar el cliente. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const customer = state.customers.find(c => c.id === id);
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        setIsLoading(true);
        await deleteCustomer(id);
        success(customer ? `Cliente "${customer.name}" eliminado` : 'Cliente eliminado exitosamente');
        await loadData();
      } catch (err) {
        console.error('Error deleting customer:', err);
        error('Error al eliminar el cliente. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const CustomerForm: React.FC<{
    customer?: Customer;
    onSubmit: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
  }> = ({ customer, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      photo: '',
      address: '',
      totalDebt: customer?.totalDebt || 0,
      category: 'Regular' as const,
      rating: 5,
      preferences: '',
      notes: customer?.notes || '',
      lastPurchase: customer?.lastPurchase,
      totalPurchases: 0,
      followUpDate: undefined as Date | undefined,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {customer ? t('edit', state.language) : t('addCustomer', state.language)}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('customerName', state.language)} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email', state.language)}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone', state.language)} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('notes', state.language)}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('cancel', state.language)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('save', state.language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CustomerDetailModal: React.FC<{
    customer: Customer;
    onClose: () => void;
  }> = ({ customer, onClose }) => {
    const customerPurchases = state.purchaseHistory.filter(p => p.customerId === customer.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">{getInitials(customer.name)}</span>
                </div>
                <h2 className="text-2xl font-semibold">{customer.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="space-y-3">
                    {customer.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('totalDebt', state.language)}</span>
                      <span className={`font-semibold ${customer.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${customer.totalDebt.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2 text-sm">{t('notes', state.language)}</h4>
                      <p className="text-sm text-gray-600">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('purchaseHistory', state.language)}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {customerPurchases.length > 0 ? (
                    customerPurchases.map((purchase) => (
                      <div key={purchase.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">${purchase.total}</span>
                          <span className="text-sm text-gray-600">
                            {purchase.date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {purchase.products.length} item{purchase.products.length > 1 ? 's' : ''}
                        </div>
                        {purchase.notes && (
                          <div className="text-sm text-gray-500 mt-1">{purchase.notes}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Sin historial de compras
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          {t('customers', state.language)}
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>{t('addCustomer', state.language)}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search', state.language) + ' clientes...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">{getInitials(customer.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {customer.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{customer.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{customer.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('totalDebt', state.language)}</span>
                  <span className={`font-semibold ${customer.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${customer.totalDebt.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setViewingCustomer(customer)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{t('view', state.language)}</span>
                </button>
                <button
                  onClick={() => setEditingCustomer(customer)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">{t('edit', state.language)}</span>
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms and Modals */}
      {showAddForm && (
        <CustomerForm
          onSubmit={handleAddCustomer}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
        />
      )}

      {viewingCustomer && (
        <CustomerDetailModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
      )}
    </div>
  );
};

export default Customers;