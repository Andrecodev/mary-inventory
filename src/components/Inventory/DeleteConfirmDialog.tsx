import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  productId: string;
  productName: string;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  productId,
  productName,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
    <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Eliminar Producto?</h3>
        <p className="text-lg text-gray-600 mb-6">
          ¿Estás seguro de que quieres eliminar <strong>"{productName}"</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(productId)}
            className="btn-danger flex-1"
          >
            Eliminar Producto
          </button>
        </div>
      </div>
    </div>
  </div>
);
