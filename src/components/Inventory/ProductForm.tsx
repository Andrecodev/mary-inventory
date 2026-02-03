import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '../../types';
import { validateProductForm } from '../../utils/validation';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const categories = ['electronics', 'clothing', 'food', 'books', 'other'];

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    image: product?.image || '',
    price: product?.price || '',
    purchasePrice: product?.purchasePrice || '',
    quantity: product?.quantity || '',
    category: product?.category || 'other',
    lowStockThreshold: product?.lowStockThreshold || 5,
    notes: product?.notes || '',
    barcode: product?.barcode || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = Number(formData.price);
    const purchasePrice = Number(formData.purchasePrice);
    const quantity = Number(formData.quantity);
    const lowStockThreshold = Number(formData.lowStockThreshold);

    // Validate using utility function
    const validation = validateProductForm({
      name: formData.name,
      price,
      purchasePrice,
      quantity,
      lowStockThreshold
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      ...formData,
      price,
      purchasePrice,
      quantity,
      lowStockThreshold
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {product ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Cerrar formulario"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            {product ? 'Actualiza la información del producto a continuación.' : 'Completa los detalles de tu nuevo producto.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label" htmlFor="product-name">
                  Nombre del Producto *
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
                  Categoría *
                </label>
                <select
                  id="product-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="product-price">
                  Precio de Venta ($) *
                </label>
                <input
                  id="product-price"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseInt(e.target.value) : '' })}
                  className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                  required
                  placeholder="0"
                  aria-describedby={errors.price ? 'price-error' : undefined}
                />
                {errors.price && (
                  <p id="price-error" className="error-message mt-2" role="alert">
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" htmlFor="product-purchase-price">
                  Precio de Compra ($) *
                </label>
                <input
                  id="product-purchase-price"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value ? parseInt(e.target.value) : '' })}
                  className={`form-input ${errors.purchasePrice ? 'border-red-500' : ''}`}
                  required
                  placeholder="0"
                  aria-describedby={errors.purchasePrice ? 'purchase-price-error' : undefined}
                />
                {errors.purchasePrice && (
                  <p id="purchase-price-error" className="error-message mt-2" role="alert">
                    {errors.purchasePrice}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" htmlFor="product-quantity">
                  Cantidad en Stock *
                </label>
                <input
                  id="product-quantity"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value ? parseInt(e.target.value) : '' })}
                  className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                  required
                  placeholder="0"
                  aria-describedby={errors.quantity ? 'quantity-error' : 'quantity-help'}
                />
                {errors.quantity ? (
                  <p id="quantity-error" className="error-message mt-2" role="alert">
                    {errors.quantity}
                  </p>
                ) : (
                  <p id="quantity-help" className="text-gray-600 mt-2">
                    Número actual de artículos en stock
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" htmlFor="low-stock-threshold">
                  Nivel de Alerta de Bajo Stock
                </label>
                <input
                  id="low-stock-threshold"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value ? parseInt(e.target.value) : 5 })}
                  className="form-input"
                  placeholder="5"
                  aria-describedby="threshold-help"
                />
                <p id="threshold-help" className="text-gray-600 mt-2">
                  Se te alertará cuando el stock caiga por debajo de este número
                </p>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="product-notes">
                Notas y Descripción
              </label>
              <textarea
                id="product-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="form-input"
                placeholder="Agrega información adicional sobre este producto..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary px-6 py-3"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-6 py-3 flex items-center justify-center min-w-[140px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    {product ? 'Actualizar' : 'Agregar Producto'}
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
