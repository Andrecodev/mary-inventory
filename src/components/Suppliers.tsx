import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, Truck, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks';
import { createSupplier, updateSupplier, deleteSupplier } from '../lib/database';
import { t } from '../utils/translations';
import { Supplier, OrderHistory } from '../types';

const Suppliers: React.FC = () => {
  const { state, loadData } = useApp();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredSuppliers = state.suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.phone.includes(searchQuery);
    return matchesSearch;
  });

  const handleAddSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      await createSupplier(supplierData, user?.id || '');
      success(`Proveedor "${supplierData.name}" agregado exitosamente`);
      await loadData();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding supplier:', err);
      error('Error al agregar el proveedor. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSupplier) {
      try {
        setIsLoading(true);
        const updatedSupplier: Supplier = {
          ...supplierData,
          id: editingSupplier.id,
          createdAt: editingSupplier.createdAt,
          updatedAt: new Date(),
        };
        await updateSupplier(updatedSupplier);
        success(`Proveedor "${supplierData.name}" actualizado exitosamente`);
        await loadData();
        setEditingSupplier(null);
      } catch (err) {
        console.error('Error updating supplier:', err);
        error('Error al actualizar el proveedor. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    const supplier = state.suppliers.find(s => s.id === id);
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        setIsLoading(true);
        await deleteSupplier(id);
        success(supplier ? `Proveedor "${supplier.name}" eliminado` : 'Proveedor eliminado exitosamente');
        await loadData();
      } catch (err) {
        console.error('Error deleting supplier:', err);
        error('Error al eliminar el proveedor. Por favor intenta de nuevo.');
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

  const SupplierForm: React.FC<{
    supplier?: Supplier;
    onSubmit: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
  }> = ({ supplier, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: supplier?.name || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: '',
      totalOwed: supplier?.totalOwed || 0,
      rating: 5,
      contractTerms: '',
      paymentTerms: '',
      deliverySchedule: '',
      notes: supplier?.notes || '',
      lastOrder: supplier?.lastOrder,
      totalOrders: supplier?.totalOrders || 0,
      performance: {
        onTimeDelivery: 5,
        qualityRating: 5,
        communicationRating: 5,
      },
      autoReorderEnabled: false,
      reorderThreshold: 10,
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
              {supplier ? t('edit', state.language) : t('addSupplier', state.language)}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('supplierName', state.language)} *
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
                  placeholder="Notas adicionales sobre el proveedor..."
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

  const SupplierDetailModal: React.FC<{
    supplier: Supplier;
    onClose: () => void;
  }> = ({ supplier, onClose }) => {
    const supplierOrders = state.orderHistory.filter(o => o.supplierId === supplier.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold">{supplier.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Supplier Info */}
              <div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="space-y-3">
                    {supplier.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{supplier.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('totalOwed', state.language)}</span>
                      <span className={`font-semibold ${supplier.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${supplier.totalOwed.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {supplier.notes && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2 text-sm">{t('notes', state.language)}</h4>
                      <p className="text-sm text-gray-600">{supplier.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('orderHistory', state.language)}</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {supplierOrders.length > 0 ? (
                    supplierOrders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">${order.total}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status === 'delivered' ? 'Entregado' :
                               order.status === 'shipped' ? 'Enviado' :
                               order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.orderDate.toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Sin historial de pedidos
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
          {t('suppliers', state.language)}
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>{t('addSupplier', state.language)}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search', state.language) + ' proveedores...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{supplier.name}</h3>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {supplier.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{supplier.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{supplier.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('totalOwed', state.language)}</span>
                  <span className={`font-semibold ${supplier.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${supplier.totalOwed.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setViewingSupplier(supplier)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{t('view', state.language)}</span>
                </button>
                <button
                  onClick={() => setEditingSupplier(supplier)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">{t('edit', state.language)}</span>
                </button>
                <button
                  onClick={() => handleDeleteSupplier(supplier.id)}
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
        <SupplierForm
          onSubmit={handleAddSupplier}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingSupplier && (
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleUpdateSupplier}
          onCancel={() => setEditingSupplier(null)}
        />
      )}

      {viewingSupplier && (
        <SupplierDetailModal
          supplier={viewingSupplier}
          onClose={() => setViewingSupplier(null)}
        />
      )}
    </div>
  );
};

export default Suppliers;