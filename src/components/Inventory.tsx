import React, { useState } from 'react';
import { Search, Plus, Mic, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useProductOperations, useToast } from '../hooks';
import { ProductForm } from './Inventory/ProductForm';
import { ProductTable } from './Inventory/ProductTable';
import { DeleteConfirmDialog } from './Inventory/DeleteConfirmDialog';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { state, loadData } = useApp();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const categories = ['all', 'electronics', 'clothing', 'food', 'books', 'other'];

  const { isLoading, handleAddProduct, handleUpdateProduct, handleDeleteProduct } = useProductOperations({
    userId: user?.id || '',
    onSuccess: async () => {
      await loadData();
      setShowAddForm(false);
      setEditingProduct(null);
      setShowDeleteConfirm(null);
    },
    onError: (message) => error(message),
    onSuccessMessage: (message) => success(message),
  });

  const filteredProducts = state.products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onSubmitAdd = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    handleAddProduct(productData);
  };

  const onSubmitEdit = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      handleUpdateProduct(productData, editingProduct);
    }
  };

  const onConfirmDelete = (id: string) => {
    const product = state.products.find(p => p.id === id);
    handleDeleteProduct(id, product?.name);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Inventario de Productos
          </h1>
          <p className="text-xl text-gray-600">
            Gestiona tus productos y rastrea los niveles de stock
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-6 w-6" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Productos</h3>
          <p className="text-3xl font-bold text-blue-700">{state.products.length}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Artículos con Bajo Stock</h3>
          <p className="text-3xl font-bold text-red-700">
            {state.products.filter(p => p.quantity <= p.lowStockThreshold).length}
          </p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Categorías</h3>
          <p className="text-3xl font-bold text-green-700">
            {new Set(state.products.map(p => p.category)).size}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Buscar Productos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="form-label" htmlFor="product-search">
              Buscar por nombre
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                id="product-search"
                type="text"
                placeholder="Buscar por nombre de producto o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-12 pr-12"
              />
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                title="Búsqueda por voz"
                aria-label="Usar voz para buscar"
              >
                <Mic className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="category-filter">
              Filtrar por Categoría
            </label>
            <div className="flex items-center space-x-3">
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Todas las Categorías' : cat.charAt(0).toUpperCase() + cat.slice(1)}
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
          Mostrando {filteredProducts.length} de {state.products.length} productos
          {searchQuery && ` que coinciden con "${searchQuery}"`}
          {selectedCategory !== 'all' && ` en ${selectedCategory}`}
        </p>
      </div>

      {/* No Results Message */}
      {filteredProducts.length === 0 && (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No se Encontraron Productos</h3>
          <p className="text-lg text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Intenta ajustar tus criterios de búsqueda o filtro.'
              : 'Comienza agregando tu primer producto al inventario.'
            }
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agrega tu Primer Producto
          </button>
        </div>
      )}

      {/* Products Table */}
      {filteredProducts.length > 0 && (
        <ProductTable
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={setShowDeleteConfirm}
        />
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <ProductForm
          onSubmit={onSubmitAdd}
          onCancel={() => setShowAddForm(false)}
          isLoading={isLoading}
        />
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={onSubmitEdit}
          onCancel={() => setEditingProduct(null)}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          productId={showDeleteConfirm}
          productName={state.products.find(p => p.id === showDeleteConfirm)?.name || ''}
          onConfirm={onConfirmDelete}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </main>
  );
};

export default Inventory;
