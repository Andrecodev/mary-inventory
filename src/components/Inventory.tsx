import React, { useState } from 'react';
import { Search, Plus, CreditCard as Edit, Trash2, AlertTriangle, Mic, QrCode, Filter, X, Check, HelpCircle, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { createProduct, updateProduct, deleteProduct } from '../lib/database';
import { t } from '../utils/translations';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { state, loadData } = useApp();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['all', 'electronics', 'clothing', 'food', 'books', 'other'];

  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await createProduct(productData, user.id);
      await loadData();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      alert('Error al agregar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProduct) return;

    try {
      setIsLoading(true);
      const updatedProduct: Product = {
        ...productData,
        id: editingProduct.id,
        createdAt: editingProduct.createdAt,
        updatedAt: new Date(),
      };
      await updateProduct(updatedProduct);
      await loadData();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteProduct(id);
      await loadData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const ProductForm: React.FC<{
    product?: Product;
    onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
  }> = ({ product, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      image: product?.image || 'https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: product?.price || 0,
      quantity: product?.quantity || 0,
      category: product?.category || 'other',
      lowStockThreshold: product?.lowStockThreshold || 5,
      notes: product?.notes || '',
      barcode: product?.barcode || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = 'Product name is required';
      if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
      if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      setErrors({});
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                aria-label="Close form"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            
            <p className="text-lg text-gray-600 mb-8">
              {product ? 'Update the product information below.' : 'Fill in the details for your new product.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label" htmlFor="product-name">
                    Product Name *
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    required
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="error-message mt-2" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label" htmlFor="product-category">
                    Category
                  </label>
                  <select
                    id="product-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                  >
                    {categories.filter(cat => cat !== 'all').map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="product-price">
                    Price ($) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                    required
                    aria-describedby={errors.price ? 'price-error' : undefined}
                  />
                  {errors.price && (
                    <p id="price-error" className="error-message mt-2" role="alert">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label" htmlFor="product-quantity">
                    Quantity in Stock *
                  </label>
                  <input
                    id="product-quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                    required
                    aria-describedby={errors.quantity ? 'quantity-error' : 'quantity-help'}
                  />
                  {errors.quantity ? (
                    <p id="quantity-error" className="error-message mt-2" role="alert">
                      {errors.quantity}
                    </p>
                  ) : (
                    <p id="quantity-help" className="text-gray-600 mt-2">
                      Current number of items in stock
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label" htmlFor="low-stock-threshold">
                    Low Stock Alert Level
                  </label>
                  <input
                    id="low-stock-threshold"
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                    className="form-input"
                    aria-describedby="threshold-help"
                  />
                  <p id="threshold-help" className="text-gray-600 mt-2">
                    You'll be alerted when stock falls below this number
                  </p>
                </div>

                <div>
                  <label className="form-label" htmlFor="product-barcode">
                    Barcode
                  </label>
                  <div className="flex rounded-lg border-2 border-gray-400 focus-within:border-blue-600">
                    <input
                      id="product-barcode"
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none"
                      placeholder="Enter or scan barcode"
                    />
                    <button
                      type="button"
                      className="px-4 py-4 bg-gray-100 hover:bg-gray-200 border-l-2 border-gray-300"
                      aria-label="Scan barcode"
                      title="Scan barcode with camera"
                    >
                      <QrCode className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="product-notes">
                  Notes and Description
                </label>
                <textarea
                  id="product-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="form-input"
                  placeholder="Add any additional information about this product..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      {product ? 'Update Product' : 'Add Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmDialog: React.FC<{ productId: string; productName: string }> = ({ productId, productName }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Product?</h3>
          <p className="text-lg text-gray-600 mb-6">
            Are you sure you want to delete <strong>"{productName}"</strong>? This action cannot be undone.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete(productId)}
              className="btn-danger flex-1"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Inventory
          </h1>
          <p className="text-xl text-gray-600">
            Manage your products and track stock levels
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="btn-secondary flex items-center space-x-2"
            title="Get help with inventory management"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-3"
          >
            <Plus className="h-6 w-6" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-blue-700">{state.products.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-700">
            {state.products.filter(p => p.quantity <= p.lowStockThreshold).length}
          </p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Categories</h3>
          <p className="text-3xl font-bold text-green-700">
            {new Set(state.products.map(p => p.category)).size}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search and Filter Products</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="form-label" htmlFor="product-search">
              Search Products
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                id="product-search"
                type="text"
                placeholder="Search by product name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-12 pr-12"
              />
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                title="Voice search"
                aria-label="Use voice to search"
              >
                <Mic className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div>
            <label className="form-label" htmlFor="category-filter">
              Filter by Category
            </label>
            <div className="flex items-center space-x-3">
              <Filter className="h-6 w-6 text-gray-400" />
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-lg text-gray-600">
          Showing {filteredProducts.length} of {state.products.length} products
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </p>
      </div>

      {/* No Results Message */}
      {filteredProducts.length === 0 && (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
          <p className="text-lg text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding your first product to the inventory.'
            }
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Product
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card hover:shadow-xl transition-all duration-200">
            <div className="relative mb-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              {product.quantity <= product.lowStockThreshold && (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Low Stock</span>
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-lg font-semibold text-gray-700">Price</span>
                  <span className="text-xl font-bold text-green-700">${product.price.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-lg font-semibold text-gray-700">In Stock</span>
                  <span className={`text-xl font-bold ${
                    product.quantity <= product.lowStockThreshold ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {product.quantity}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold text-gray-700">Alert Level</span>
                  <span className="text-lg text-gray-600">{product.lowStockThreshold}</span>
                </div>
              </div>
              
              {product.notes && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{product.notes}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="btn-danger flex items-center justify-center px-4"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Forms */}
      {showAddForm && (
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          productId={showDeleteConfirm}
          productName={state.products.find(p => p.id === showDeleteConfirm)?.name || ''}
        />
      )}
    </main>
  );
};

export default Inventory;