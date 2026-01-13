import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Star, Calendar, Phone, Mail, MapPin, Truck, Filter, Eye, Bell, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { Supplier, OrderHistory } from '../types';

const Suppliers: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = state.suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.phone.includes(searchQuery);
    return matchesSearch;
  });

  const handleAddSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
    setShowAddForm(false);
  };

  const handleUpdateSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSupplier) {
      const updatedSupplier: Supplier = {
        ...supplierData,
        id: editingSupplier.id,
        createdAt: editingSupplier.createdAt,
        updatedAt: new Date(),
      };
      dispatch({ type: 'UPDATE_SUPPLIER', payload: updatedSupplier });
      setEditingSupplier(null);
    }
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      dispatch({ type: 'DELETE_SUPPLIER', payload: id });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
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
      address: supplier?.address || '',
      totalOwed: supplier?.totalOwed || 0,
      rating: supplier?.rating || 5,
      contractTerms: supplier?.contractTerms || '',
      paymentTerms: supplier?.paymentTerms || '',
      deliverySchedule: supplier?.deliverySchedule || '',
      notes: supplier?.notes || '',
      lastOrder: supplier?.lastOrder,
      totalOrders: supplier?.totalOrders || 0,
      performance: supplier?.performance || {
        onTimeDelivery: 5,
        qualityRating: 5,
        communicationRating: 5,
      },
      autoReorderEnabled: supplier?.autoReorderEnabled || false,
      reorderThreshold: supplier?.reorderThreshold || 10,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {supplier ? t('edit', state.language) : t('addSupplier', state.language)}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {t('email', state.language)} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                      {t('rating', state.language)}
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('address', state.language)}
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contract & Payment Terms */}
              <div>
                <h3 className="text-lg font-medium mb-3">Contract & Payment Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contractTerms', state.language)}
                    </label>
                    <textarea
                      value={formData.contractTerms}
                      onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contract terms and conditions..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('paymentTerms', state.language)}
                    </label>
                    <textarea
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Payment terms (e.g., Net 30, 2/10 Net 30)..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('deliverySchedule', state.language)}
                  </label>
                  <input
                    type="text"
                    value={formData.deliverySchedule}
                    onChange={(e) => setFormData({ ...formData, deliverySchedule: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Weekly on Mondays, Bi-weekly..."
                  />
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('onTimeDelivery', state.language)}
                    </label>
                    <select
                      value={formData.performance.onTimeDelivery}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        performance: { 
                          ...formData.performance, 
                          onTimeDelivery: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('qualityRating', state.language)}
                    </label>
                    <select
                      value={formData.performance.qualityRating}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        performance: { 
                          ...formData.performance, 
                          qualityRating: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('communicationRating', state.language)}
                    </label>
                    <select
                      value={formData.performance.communicationRating}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        performance: { 
                          ...formData.performance, 
                          communicationRating: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Auto Reorder Settings */}
              <div>
                <h3 className="text-lg font-medium mb-3">Auto Reorder Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoReorder"
                      checked={formData.autoReorderEnabled}
                      onChange={(e) => setFormData({ ...formData, autoReorderEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoReorder" className="text-sm font-medium text-gray-700">
                      {t('autoReorder', state.language)}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('reorderThreshold', state.language)}
                    </label>
                    <input
                      type="number"
                      value={formData.reorderThreshold}
                      onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!formData.autoReorderEnabled}
                    />
                  </div>
                </div>
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
                  placeholder="Additional notes about the supplier..."
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
    const avgPerformance = (supplier.performance.onTimeDelivery + supplier.performance.qualityRating + supplier.performance.communicationRating) / 3;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{supplier.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supplier Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.address}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t('rating', state.language)}</span>
                      <div className="flex">{renderStars(supplier.rating)}</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t('totalOwed', state.language)}</span>
                      <span className="font-semibold text-red-600">${supplier.totalOwed}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t('totalOrders', state.language)}</span>
                      <span className="font-semibold">{supplier.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Performance</span>
                      <span className={`font-semibold ${getPerformanceColor(avgPerformance)}`}>
                        {avgPerformance.toFixed(1)}/5
                      </span>
                    </div>
                  </div>

                  {supplier.autoReorderEnabled && (
                    <div className="border-t pt-3">
                      <div className="flex items-center space-x-2 text-green-600">
                        <Bell className="h-4 w-4" />
                        <span className="text-sm font-medium">Auto Reorder Enabled</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Threshold: {supplier.reorderThreshold} units
                      </p>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('performance', state.language)}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('onTimeDelivery', state.language)}</span>
                      <div className="flex">{renderStars(supplier.performance.onTimeDelivery)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('qualityRating', state.language)}</span>
                      <div className="flex">{renderStars(supplier.performance.qualityRating)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('communicationRating', state.language)}</span>
                      <div className="flex">{renderStars(supplier.performance.communicationRating)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">{t('orderHistory', state.language)}</h3>
                <div className="space-y-3">
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
                              {order.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              {order.orderDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.products.length} item{order.products.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expected: {order.expectedDelivery.toLocaleDateString()}
                          {order.actualDelivery && (
                            <span className="ml-2">
                              | Delivered: {order.actualDelivery.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {order.notes && (
                          <div className="text-sm text-gray-500 mt-1">{order.notes}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No order history available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Terms and Notes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {supplier.contractTerms && (
                <div>
                  <h4 className="font-medium mb-2">{t('contractTerms', state.language)}</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{supplier.contractTerms}</p>
                </div>
              )}
              {supplier.paymentTerms && (
                <div>
                  <h4 className="font-medium mb-2">{t('paymentTerms', state.language)}</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{supplier.paymentTerms}</p>
                </div>
              )}
              {supplier.notes && (
                <div>
                  <h4 className="font-medium mb-2">{t('notes', state.language)}</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{supplier.notes}</p>
                </div>
              )}
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
            placeholder={t('search', state.language) + ' suppliers...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => {
          const avgPerformance = (supplier.performance.onTimeDelivery + supplier.performance.qualityRating + supplier.performance.communicationRating) / 3;
          
          return (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                      {supplier.autoReorderEnabled && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Bell className="h-3 w-3" />
                          <span className="text-xs">Auto Reorder</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('rating', state.language)}</span>
                    <div className="flex">{renderStars(supplier.rating)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Performance</span>
                    <span className={`font-semibold ${getPerformanceColor(avgPerformance)}`}>
                      {avgPerformance.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('totalOwed', state.language)}</span>
                    <span className={`font-semibold ${supplier.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${supplier.totalOwed}
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
          );
        })}
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