import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Star, Calendar, Phone, Mail, MapPin, User, Filter, Eye, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { Customer, PurchaseHistory } from '../types';

const Customers: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'VIP', 'Regular', 'New', 'Inactive'];

  const filteredCustomers = state.customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || customer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    setShowAddForm(false);
  };

  const handleUpdateCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCustomer) {
      const updatedCustomer: Customer = {
        ...customerData,
        id: editingCustomer.id,
        createdAt: editingCustomer.createdAt,
        updatedAt: new Date(),
      };
      dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
      setEditingCustomer(null);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Regular': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const CustomerForm: React.FC<{
    customer?: Customer;
    onSubmit: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
  }> = ({ customer, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      photo: customer?.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      address: customer?.address || '',
      totalDebt: customer?.totalDebt || 0,
      category: customer?.category || 'Regular' as const,
      rating: customer?.rating || 5,
      preferences: customer?.preferences || '',
      notes: customer?.notes || '',
      lastPurchase: customer?.lastPurchase,
      totalPurchases: customer?.totalPurchases || 0,
      followUpDate: customer?.followUpDate,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {customer ? t('edit', state.language) : t('addCustomer', state.language)}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {t('customerCategory', state.language)}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Regular">Regular</option>
                    <option value="New">New</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('totalDebt', state.language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalDebt}
                    onChange={(e) => setFormData({ ...formData, totalDebt: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('followUpDate', state.language)}
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate ? formData.followUpDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      followUpDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('totalPurchases', state.language)}
                  </label>
                  <input
                    type="number"
                    value={formData.totalPurchases}
                    onChange={(e) => setFormData({ ...formData, totalPurchases: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('preferences', state.language)}
                </label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customer preferences, special requirements, etc."
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
                  placeholder="Additional notes about the customer..."
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
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{customer.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="text-center">
                    <img
                      src={customer.photo}
                      alt={customer.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(customer.category)}`}>
                      {customer.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{customer.address}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t('rating', state.language)}</span>
                      <div className="flex">{renderStars(customer.rating)}</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t('totalDebt', state.language)}</span>
                      <span className="font-semibold text-red-600">${customer.totalDebt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('totalPurchases', state.language)}</span>
                      <span className="font-semibold">{customer.totalPurchases}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">{t('purchaseHistory', state.language)}</h3>
                <div className="space-y-3">
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
                      No purchase history available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes and Preferences */}
            {(customer.notes || customer.preferences) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.preferences && (
                  <div>
                    <h4 className="font-medium mb-2">{t('preferences', state.language)}</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{customer.preferences}</p>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <h4 className="font-medium mb-2">{t('notes', state.language)}</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
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

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search', state.language) + ' customers...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={customer.photo}
                  alt={customer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(customer.category)}`}>
                    {customer.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{customer.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('rating', state.language)}</span>
                  <div className="flex">{renderStars(customer.rating)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('totalDebt', state.language)}</span>
                  <span className={`font-semibold ${customer.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${customer.totalDebt}
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