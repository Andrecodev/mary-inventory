import React from 'react';
import { Product } from '../../types';
import { ProductTableRow } from './ProductTableRow';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="card overflow-x-auto overflow-y-visible">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-4 px-4 text-lg font-bold text-gray-900">Producto</th>
            <th className="text-left py-4 px-4 text-lg font-bold text-gray-900">Categoría</th>
            <th className="text-right py-4 px-4 text-lg font-bold text-gray-900">Precio Venta</th>
            <th className="text-right py-4 px-4 text-lg font-bold text-gray-900">Precio Compra</th>
            <th className="text-center py-4 px-4 text-lg font-bold text-gray-900">Stock</th>
            <th className="text-center py-4 px-4 text-lg font-bold text-gray-900">Alerta</th>
            <th className="text-center py-4 px-4 text-lg font-bold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductTableRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
