import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Filter, CreditCard, FileText, User, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks';
import { createAccountTransaction, updateAccountTransaction, deleteAccountTransaction, createPaymentRecord, createPurchaseHistory, createOrderHistory } from '../lib/database';
import { t } from '../utils/translations';
import { AccountTransaction, PaymentRecord, PurchaseHistory, OrderHistory } from '../types';
import DateInput from './DateInput';

const Accounts: React.FC = () => {
  const { state, loadData } = useApp();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountTransaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<AccountTransaction | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<AccountTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredTransactions = state.accountTransactions.filter(transaction => {
    const matchesType = transaction.type === activeTab;
    const matchesSearch = 
      (transaction.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (transaction.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (transaction.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      transaction.products.some(p => p.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesType && matchesSearch && matchesStatus;
  });

  const totals = {
    receivable: {
      total: state.accountTransactions
        .filter(t => t.type === 'receivable')
        .reduce((sum, t) => sum + t.totalAmount, 0),
      pending: state.accountTransactions
        .filter(t => t.type === 'receivable' && t.status !== 'paid')
        .reduce((sum, t) => sum + t.remainingAmount, 0),
      overdue: state.accountTransactions
        .filter(t => t.type === 'receivable' && t.status === 'overdue')
        .reduce((sum, t) => sum + t.remainingAmount, 0),
    },
    payable: {
      total: state.accountTransactions
        .filter(t => t.type === 'payable')
        .reduce((sum, t) => sum + t.totalAmount, 0),
      pending: state.accountTransactions
        .filter(t => t.type === 'payable' && t.status !== 'paid')
        .reduce((sum, t) => sum + t.remainingAmount, 0),
      overdue: state.accountTransactions
        .filter(t => t.type === 'payable' && t.status === 'overdue')
        .reduce((sum, t) => sum + t.remainingAmount, 0),
    }
  };

  const handleAddTransaction = async (transactionData: Omit<AccountTransaction, 'id' | 'createdDate' | 'remainingAmount'>) => {
    // Validate that at least one product is selected
    if (!transactionData.products || transactionData.products.length === 0) {
      error('Debes agregar al menos un producto a la transacción');
      return;
    }

    // Validate that all products have a valid productId
    const invalidProducts = transactionData.products.filter(p => !p.productId || p.productId === '');
    if (invalidProducts.length > 0) {
      error('Debes seleccionar un producto válido para cada línea');
      return;
    }

    // Validate that total amount is greater than 0
    if (transactionData.totalAmount <= 0) {
      error('El monto total debe ser mayor a 0');
      return;
    }

    try {
      setIsLoading(true);
      const newTransaction: AccountTransaction = {
        ...transactionData,
        id: Date.now().toString(),
        createdDate: new Date(),
        remainingAmount: transactionData.totalAmount - transactionData.paidAmount,
      };
      await createAccountTransaction(newTransaction, user?.id || '');

      // Automatically create purchase history for receivables (customer purchases)
      if (transactionData.type === 'receivable' && transactionData.customerId) {
        // Map products to PurchaseHistory format: { productId, quantity, price }
        const mappedProducts = transactionData.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          price: p.unitPrice
        }));

        const purchaseHistory: Omit<PurchaseHistory, 'id'> = {
          customerId: transactionData.customerId,
          products: mappedProducts,
          total: transactionData.totalAmount,
          date: newTransaction.createdDate,
          notes: transactionData.notes
        };
        await createPurchaseHistory(purchaseHistory, user?.id || '');
        console.log('✅ Purchase history created for customer transaction');
      }

      // Automatically create order history for payables (supplier orders)
      if (transactionData.type === 'payable' && transactionData.supplierId) {
        // Map products to OrderHistory format: { productId, quantity, cost }
        const mappedProducts = transactionData.products.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          cost: p.unitPrice
        }));

        const orderHistory: Omit<OrderHistory, 'id'> = {
          supplierId: transactionData.supplierId,
          products: mappedProducts,
          total: transactionData.totalAmount,
          orderDate: newTransaction.createdDate,
          expectedDelivery: transactionData.dueDate,
          status: 'pending',
          notes: transactionData.notes
        };
        await createOrderHistory(orderHistory, user?.id || '');
        console.log('✅ Order history created for supplier transaction');
      }

      const type = transactionData.type === 'receivable' ? 'por cobrar' : 'por pagar';
      success(`Transacción ${type} agregada exitosamente`);
      await loadData();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
      error('Error al agregar la transacción. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (transactionData: Omit<AccountTransaction, 'id' | 'createdDate'>) => {
    if (editingTransaction) {
      try {
        setIsLoading(true);
        const updatedTransaction: AccountTransaction = {
          ...transactionData,
          id: editingTransaction.id,
          createdDate: editingTransaction.createdDate,
        };
        await updateAccountTransaction(updatedTransaction);
        success('Transacción actualizada exitosamente');
        await loadData();
        setEditingTransaction(null);
      } catch (err) {
        console.error('Error updating transaction:', err);
        error('Error al actualizar la transacción. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        setIsLoading(true);
        await deleteAccountTransaction(id);
        success('Transacción eliminada exitosamente');
        await loadData();
      } catch (err) {
        console.error('Error deleting transaction:', err);
        error('Error al eliminar la transacción. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddPayment = async (transactionId: string, paymentData: Omit<PaymentRecord, 'id' | 'transactionId'>) => {
    try {
      setIsLoading(true);
      const newPayment: PaymentRecord = {
        ...paymentData,
        id: Date.now().toString(),
        transactionId,
      };

      // Update transaction
      const transaction = state.accountTransactions.find(t => t.id === transactionId);
      if (transaction) {
        const newPaidAmount = transaction.paidAmount + paymentData.amount;
        const newRemainingAmount = transaction.totalAmount - newPaidAmount;
        const newStatus = newRemainingAmount <= 0 ? 'paid' :
                         newPaidAmount > 0 ? 'partial' :
                         new Date() > transaction.dueDate ? 'overdue' : 'pending';

        const updatedTransaction: AccountTransaction = {
          ...transaction,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          lastPaymentDate: paymentData.paymentDate,
        };

        await createPaymentRecord(newPayment, user?.id || '');
        await updateAccountTransaction(updatedTransaction);
        success(`Pago de $${paymentData.amount.toLocaleString()} registrado exitosamente`);
        await loadData();
      }

      setShowPaymentForm(null);
    } catch (err) {
      console.error('Error adding payment:', err);
      error('Error al registrar el pago. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const TransactionForm: React.FC<{
    transaction?: AccountTransaction;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
  }> = ({ transaction, onSubmit, onCancel, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
      type: transaction?.type || activeTab,
      customerId: transaction?.customerId || '',
      supplierId: transaction?.supplierId || '',
      customerName: transaction?.customerName || '',
      supplierName: transaction?.supplierName || '',
      products: transaction?.products || [],
      totalAmount: transaction?.totalAmount || 0,
      paidAmount: transaction?.paidAmount || 0,
      dueDate: transaction?.dueDate ? transaction.dueDate.toISOString().split('T')[0] : '',
      paymentTerms: transaction?.paymentTerms || '',
      notes: transaction?.notes || '',
      invoiceNumber: transaction?.invoiceNumber || '',
      reference: transaction?.reference || '',
      status: transaction?.status || 'pending',
    });

    const [selectedProducts, setSelectedProducts] = useState<any[]>(transaction?.products || []);

    const handleAddProduct = () => {
      setSelectedProducts([...selectedProducts, {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      }]);
    };

    const handleRemoveProduct = (index: number) => {
      const newProducts = selectedProducts.filter((_, i) => i !== index);
      setSelectedProducts(newProducts);
      updateTotalAmount(newProducts);
    };

    const handleProductChange = (index: number, field: string, value: any) => {
      const newProducts = [...selectedProducts];
      newProducts[index] = { ...newProducts[index], [field]: value };

      if (field === 'productId') {
        const product = state.products.find(p => p.id === value);
        if (product) {
          newProducts[index].productName = product.name;
          newProducts[index].unitPrice = product.price;
          // Also calculate totalPrice when product is selected
          newProducts[index].totalPrice = newProducts[index].quantity * product.price;
        }
      }

      if (field === 'quantity' || field === 'unitPrice') {
        newProducts[index].totalPrice = newProducts[index].quantity * newProducts[index].unitPrice;
      }
      
      setSelectedProducts(newProducts);
      updateTotalAmount(newProducts);
    };

    const updateTotalAmount = (products: any[]) => {
      const total = products.reduce((sum, p) => sum + p.totalPrice, 0);
      setFormData(prev => ({ ...prev, totalAmount: total, products }));
    };

    // Check if products are valid (have productId selected)
    const hasValidProducts = selectedProducts.length > 0 &&
      selectedProducts.every(p => p.productId && p.productId !== '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // Validate that products are properly selected
      if (!hasValidProducts) {
        return;
      }

      const submitData = {
        ...formData,
        products: selectedProducts,
        dueDate: new Date(formData.dueDate),
        remainingAmount: formData.totalAmount - formData.paidAmount,
      };
      onSubmit(submitData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              {transaction ? 'Editar Transacción' : `Nueva ${activeTab === 'receivable' ? 'Cuenta por Cobrar' : 'Cuenta por Pagar'}`}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Transacción
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!transaction}
                    >
                      <option value="receivable">Cuenta por Cobrar</option>
                      <option value="payable">Cuenta por Pagar</option>
                    </select>
                  </div>

                  {formData.type === 'receivable' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente *
                      </label>
                      {state.customers.length === 0 ? (
                        <p className="text-sm text-amber-600 py-2">
                          No hay clientes registrados. Agrega un cliente primero.
                        </p>
                      ) : (
                        <select
                          value={formData.customerId}
                          onChange={(e) => {
                            const customer = state.customers.find(c => c.id === e.target.value);
                            setFormData({
                              ...formData,
                              customerId: e.target.value,
                              customerName: customer?.name || ''
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar Cliente</option>
                          {state.customers.map(customer => (
                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor *
                      </label>
                      {state.suppliers.length === 0 ? (
                        <p className="text-sm text-amber-600 py-2">
                          No hay proveedores registrados. Agrega un proveedor primero.
                        </p>
                      ) : (
                        <select
                          value={formData.supplierId}
                          onChange={(e) => {
                            const supplier = state.suppliers.find(s => s.id === e.target.value);
                            setFormData({
                              ...formData,
                              supplierId: e.target.value,
                              supplierName: supplier?.name || ''
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar Proveedor</option>
                          {state.suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Factura
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <DateInput
                      label="Fecha de Vencimiento"
                      value={formData.dueDate}
                      onChange={(value:any) => setFormData({ ...formData, dueDate: value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="Seleccionar fecha de vencimiento"
                    />
                  </div>

                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-medium">Productos *</h3>
                  {state.products.length === 0 ? (
                    <p className="text-xs sm:text-sm text-amber-600">
                      No hay productos registrados
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 bg-blue-600 text-white px-3 py-1.5 sm:py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar Producto</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="sm:col-span-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Producto</label>
                        <select
                          value={product.productId}
                          onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar Producto</option>
                          {state.products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Cantidad</label>
                        <input
                          type="number"
                          placeholder="Cant."
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Precio Unit.</label>
                        <input
                          type="number"
                          placeholder="Precio"
                          value={product.unitPrice}
                          onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Total</label>
                        <input
                          type="number"
                          placeholder="Total"
                          value={product.totalPrice}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Información de Pago</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Total
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Pagado
                    </label>
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.01"
                      min="0"
                      max={formData.totalAmount}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Pendiente
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount - formData.paidAmount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales sobre la transacción..."
                />
              </div>

              {/* Validation message - show before buttons for visibility */}
              {!hasValidProducts && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-amber-700">
                  {selectedProducts.length === 0 ? (
                    <span>* Debes agregar al menos un producto usando el botón "Agregar Producto"</span>
                  ) : (
                    <span>* Debes seleccionar un producto del menú desplegable para cada línea</span>
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasValidProducts}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const PaymentForm: React.FC<{
    transaction: AccountTransaction;
    onSubmit: (data: Omit<PaymentRecord, 'id' | 'transactionId'>) => void;
    onCancel: () => void;
  }> = ({ transaction, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      amount: transaction.remainingAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash' as const,
      reference: '',
      notes: '',
      createdBy: state.user?.name || 'Usuario',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        paymentDate: new Date(formData.paymentDate),
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Registrar Pago</h2>
            
            <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">
                {transaction.type === 'receivable' ? 'Cliente' : 'Proveedor'}: {transaction.customerName || transaction.supplierName}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Monto Pendiente: <span className="font-semibold">${transaction.remainingAmount.toLocaleString()}</span>
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto del Pago *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  min="0.01"
                  max={transaction.remainingAmount}
                  required
                />
              </div>

              <div>
                <DateInput
                  label="Fecha de Pago"
                  value={formData.paymentDate}
                  onChange={(value) => setFormData({ ...formData, paymentDate: value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  placeholder="Seleccionar fecha de pago"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="check">Cheque</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número de transacción, cheque, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const TransactionDetailModal: React.FC<{
    transaction: AccountTransaction;
    onClose: () => void;
  }> = ({ transaction, onClose }) => {
    const payments = state.paymentRecords.filter(p => p.transactionId === transaction.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-semibold">Detalle de Transacción</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Transaction Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base mb-2">Información General</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">
                          {transaction.type === 'receivable' ? 'Por Cobrar' : 'Por Pagar'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {transaction.type === 'receivable' ? 'Cliente:' : 'Proveedor:'}
                        </span>
                        <span className="font-medium text-right">
                          {transaction.customerName || transaction.supplierName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Factura:</span>
                        <span className="font-medium">{transaction.invoiceNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'paid' ? 'Pagado' :
                           transaction.status === 'partial' ? 'Parcial' :
                           transaction.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-medium text-sm mb-2">Montos</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">${transaction.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pagado:</span>
                        <span className="font-semibold text-green-600">${transaction.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pendiente:</span>
                        <span className="font-semibold text-red-600">${transaction.remainingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-medium text-sm mb-2">Fechas</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creación:</span>
                        <span>{transaction.createdDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vencimiento:</span>
                        <span>{transaction.dueDate.toLocaleDateString()}</span>
                      </div>
                      {transaction.lastPaymentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Último Pago:</span>
                          <span>{transaction.lastPaymentDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products and Payments */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Products */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Productos</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {transaction.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm sm:text-base">{product.productName}</span>
                          <span className="font-semibold text-sm sm:text-base">${product.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Cantidad: {product.quantity} × ${product.unitPrice.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">Historial de Pagos</h3>
                    {transaction.remainingAmount > 0 && (
                      <button
                        onClick={() => setShowPaymentForm(transaction)}
                        className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 bg-green-600 text-white px-3 py-1.5 sm:py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Pago</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <div key={payment.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm sm:text-base">${payment.amount.toLocaleString()}</span>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {payment.paymentDate.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Método: {payment.paymentMethod === 'cash' ? 'Efectivo' :
                                    payment.paymentMethod === 'card' ? 'Tarjeta' :
                                    payment.paymentMethod === 'transfer' ? 'Transferencia' :
                                    payment.paymentMethod === 'check' ? 'Cheque' : 'Otro'}
                            {payment.reference && ` | Ref: ${payment.reference}`}
                          </div>
                          {payment.notes && (
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">{payment.notes}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-500">
                        No hay pagos registrados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="mt-4 sm:mt-6">
                <h4 className="font-medium text-sm mb-2">Notas</h4>
                <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg">{transaction.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Cuentas por Cobrar y Pagar
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Transacción</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {/* Receivables Summary */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Cuentas por Cobrar
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Total Facturado:</span>
              <span className="font-semibold">${totals.receivable.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Pendiente de Cobro:</span>
              <span className="font-semibold text-yellow-600">${totals.receivable.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Vencido:</span>
              <span className="font-semibold text-red-600">${totals.receivable.overdue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payables Summary */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-red-600" />
            Cuentas por Pagar
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Total Adeudado:</span>
              <span className="font-semibold">${totals.payable.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Pendiente de Pago:</span>
              <span className="font-semibold text-yellow-600">${totals.payable.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Vencido:</span>
              <span className="font-semibold text-red-600">${totals.payable.overdue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-6 sm:space-x-8 px-3 sm:px-6">
            <button
              onClick={() => setActiveTab('receivable')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'receivable'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Cuentas por Cobrar</span>
                <span className="sm:hidden">Cobrar</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payable')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'payable'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Cuentas por Pagar</span>
                <span className="sm:hidden">Pagar</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, proveedor, factura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendiente</option>
                <option value="partial">Parcial</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'receivable' ? 'Cliente' : 'Proveedor'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendiente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.customerName || transaction.supplierName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.invoiceNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${transaction.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">
                      ${transaction.remainingAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.dueDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">
                        {transaction.status === 'paid' ? 'Pagado' :
                         transaction.status === 'partial' ? 'Parcial' :
                         transaction.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setViewingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {transaction.remainingAmount > 0 && (
                      <button
                        onClick={() => setShowPaymentForm(transaction)}
                        className="text-green-600 hover:text-green-900"
                        title="Registrar pago"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                        {transaction.customerName || transaction.supplierName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Factura: {transaction.invoiceNumber || 'N/A'}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                    </span>
                  </div>

                  {/* Amount info */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Monto Total</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">
                        ${transaction.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Pendiente</p>
                      <p className="text-sm sm:text-base font-semibold text-red-600">
                        ${transaction.remainingAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Date info */}
                  <div className="text-xs sm:text-sm text-gray-600 py-2">
                    Vencimiento: {transaction.dueDate.toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setViewingTransaction(transaction)}
                      className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Editar
                    </button>
                    {transaction.remainingAmount > 0 && (
                      <button
                        onClick={() => setShowPaymentForm(transaction)}
                        className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        <CreditCard className="h-4 w-4 inline mr-1" />
                        Pago
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <FileText className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No hay transacciones</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Comienza creando una nueva {activeTab === 'receivable' ? 'cuenta por cobrar' : 'cuenta por pagar'}.
            </p>
          </div>
        )}
      </div>

      {/* Forms and Modals */}
      {showAddForm && (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isLoading}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleUpdateTransaction}
          onCancel={() => setEditingTransaction(null)}
          isSubmitting={isLoading}
        />
      )}

      {viewingTransaction && (
        <TransactionDetailModal
          transaction={viewingTransaction}
          onClose={() => setViewingTransaction(null)}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          transaction={showPaymentForm}
          onSubmit={(data) => handleAddPayment(showPaymentForm.id, data)}
          onCancel={() => setShowPaymentForm(null)}
        />
      )}
    </div>
  );
};

export default Accounts;