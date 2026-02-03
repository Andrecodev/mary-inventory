import React, { useState } from 'react';
import { AlertTriangle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({ product, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          {product.quantity <= product.lowStockThreshold && (
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <div>
            <div className="font-semibold text-gray-900">{product.name}</div>
            {product.notes && (
              <div className="text-sm text-gray-600 mt-1">{product.notes}</div>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </span>
      </td>
      <td className="py-4 px-4 text-right font-semibold text-green-700">
        ${product.price.toLocaleString()}
      </td>
      <td className="py-4 px-4 text-right font-semibold text-blue-700">
        ${product.purchasePrice.toLocaleString()}
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`font-bold ${
          product.quantity <= product.lowStockThreshold ? 'text-red-700' : 'text-gray-900'
        }`}>
          {product.quantity}
        </span>
      </td>
      <td className="py-4 px-4 text-center text-gray-600">
        {product.lowStockThreshold}
      </td>
      <td className="py-4 px-4 text-center relative">
        <div className="relative inline-block">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Abrir menú de acciones"
            aria-expanded={showMenu}
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50">
                <button
                  onClick={() => {
                    onEdit(product);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 rounded-t-lg transition-colors"
                >
                  <Edit className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Editar</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(product.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-3 rounded-b-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-700">Eliminar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
