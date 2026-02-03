import { useState } from 'react';
import { Product } from '../types';
import { createProduct, updateProduct, deleteProduct } from '../lib/database';

interface UseProductOperationsOptions {
  userId: string;
  onSuccess: () => void;
  onError?: (message: string) => void;
  onSuccessMessage?: (message: string) => void;
}

export const useProductOperations = ({ userId, onSuccess, onError, onSuccessMessage }: UseProductOperationsOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      console.log('📦 Agregando producto:', productData);
      const result = await createProduct(productData, userId);
      console.log('✅ Producto creado:', result);
      onSuccessMessage?.(`Producto "${productData.name}" agregado exitosamente`);
      await onSuccess();
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Por favor intenta de nuevo.';
      onError?.(`Error al agregar el producto: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    existingProduct: Product
  ) => {
    try {
      setIsLoading(true);
      const updatedProduct: Product = {
        ...productData,
        id: existingProduct.id,
        createdAt: existingProduct.createdAt,
        updatedAt: new Date(),
      };
      console.log('📝 Actualizando producto:', updatedProduct);
      const result = await updateProduct(updatedProduct);
      console.log('✅ Producto actualizado:', result);
      onSuccessMessage?.(`Producto "${productData.name}" actualizado exitosamente`);
      await onSuccess();
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Por favor intenta de nuevo.';
      onError?.(`Error al actualizar el producto: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, productName?: string) => {
    try {
      setIsLoading(true);
      await deleteProduct(id);
      onSuccessMessage?.(productName ? `Producto "${productName}" eliminado` : 'Producto eliminado exitosamente');
      await onSuccess();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      onError?.('Error al eliminar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  };
};
