import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, DollarSign, Calendar, Clock, CheckCircle, AlertTriangle, Eye, Filter, CreditCard, FileText, User, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { AccountTransaction, PaymentRecord } from '../types';

const Accounts: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<AccountTransaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<AccountTransaction | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<AccountTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleAddTransaction = (transactionData: Omit<AccountTransaction, 'id' | 'createdDate' | 'remainingAmount'>) => {
    const newTransaction: AccountTransaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdDate: new Date(),
      remainingAmount: transactionData.totalAmount - transactionData.paidAmount,
    };
    dispatch({ type: 'ADD_ACCOUNT_TRANSACTION', payload: newTransaction });
    setShowAddForm(false);
  };

  const handleUpdateTransaction = (transactionData: Omit<AccountTransaction, 'id' | 'createdDate'>) => {
    if (editingTransaction) {
      const updatedTransaction: AccountTransaction = {
        ...transactionData,
        id: editingTransaction.id,
        createdDate: editingTransaction.createdDate,
      };
      dispatch({ type: 'UPDATE_ACCOUNT_TRANSACTION', payload: updatedTransaction });
      setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      dispatch({ type: 'DELETE_ACCOUNT_TRANSACTION', payload: id });
    }
  };

  const handleAddPayment = (transactionId: string, paymentData: Omit<PaymentRecord, 'id' | 'transactionId'>) => {
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

      dispatch({ type: 'ADD_PAYMENT_RECORD', payload: newPayment });
      dispatch({ type: 'UPDATE_ACCOUNT_TRANSACTION', payload: updatedTransaction });
    }
    
    setShowPaymentForm(null);
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
  }> = ({ transaction, onSubmit, onCancel }) => {
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
      setFormData({ ...formData, totalAmount: total, products });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        products: selectedProducts,
        dueDate: new Date(formData.dueDate),
        remainingAmount: formData.totalAmount - formData.paidAmount,
      };
      onSubmit(submitData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {transaction ? 'Editar Transacción' : `Nueva ${activeTab === 'receivable' ? 'Cuenta por Cobrar' : 'Cuenta por Pagar'}`}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor *
                      </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Vencimiento *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Términos de Pago
                    </label>
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ej: Net 30, 2/10 Net 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencia
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Productos</h3>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Producto</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="md:col-span-2">
                        <select
                          value={product.productId}
                          onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar Producto</option>
                          {state.products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Cantidad"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Precio Unitario"
                          value={product.unitPrice}
                          onChange={(e) => handleProductChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Total"
                          value={product.totalPrice}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                <h3 className="text-lg font-medium mb-3">Información de Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales sobre la transacción..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Registrar Pago</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {transaction.type === 'receivable' ? 'Cliente' : 'Proveedor'}: {transaction.customerName || transaction.supplierName}
              </p>
              <p className="text-sm text-gray-600">
                Monto Pendiente: <span className="font-semibold">${transaction.remainingAmount.toLocaleString()}</span>
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto del Pago *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  min="0.01"
                  max={transaction.remainingAmount}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Detalle de Transacción</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transaction Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Información General</h3>
                    <div className="space-y-2 text-sm">
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
                        <span className="font-medium">
                          {transaction.customerName || transaction.supplierName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Factura:</span>
                        <span className="font-medium">{transaction.invoiceNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'paid' ? 'Pagado' :
                           transaction.status === 'partial' ? 'Parcial' :
                           transaction.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Montos</h4>
                    <div className="space-y-2 text-sm">
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

                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Fechas</h4>
                    <div className="space-y-2 text-sm">
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
              <div className="lg:col-span-2">
                {/* Products */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Productos</h3>
                  <div className="space-y-3">
                    {transaction.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{product.productName}</span>
                          <span className="font-semibold">${product.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Cantidad: {product.quantity} × ${product.unitPrice.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Historial de Pagos</h3>
                    {transaction.remainingAmount > 0 && (
                      <button
                        onClick={() => setShowPaymentForm(transaction)}
                        className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Pago</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">${payment.amount.toLocaleString()}</span>
                            <span className="text-sm text-gray-600">
                              {payment.paymentDate.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Método: {payment.paymentMethod === 'cash' ? 'Efectivo' :
                                    payment.paymentMethod === 'card' ? 'Tarjeta' :
                                    payment.paymentMethod === 'transfer' ? 'Transferencia' :
                                    payment.paymentMethod === 'check' ? 'Cheque' : 'Otro'}
                            {payment.reference && ` | Ref: ${payment.reference}`}
                          </div>
                          {payment.notes && (
                            <div className="text-sm text-gray-500 mt-1">{payment.notes}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No hay pagos registrados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Notas</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{transaction.notes}</p>
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
          Cuentas por Cobrar y Pagar
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Transacción</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Receivables Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Cuentas por Cobrar
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Facturado:</span>
              <span className="font-semibold">${totals.receivable.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pendiente de Cobro:</span>
              <span className="font-semibold text-yellow-600">${totals.receivable.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vencido:</span>
              <span className="font-semibold text-red-600">${totals.receivable.overdue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payables Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-red-600" />
            Cuentas por Pagar
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Adeudado:</span>
              <span className="font-semibold">${totals.payable.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pendiente de Pago:</span>
              <span className="font-semibold text-yellow-600">${totals.payable.pending.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vencido:</span>
              <span className="font-semibold text-red-600">${totals.payable.overdue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('receivable')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'receivable'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Cuentas por Cobrar</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payable')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payable'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Cuentas por Pagar</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, proveedor, factura o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="overflow-x-auto">
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
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {transaction.remainingAmount > 0 && (
                      <button
                        onClick={() => setShowPaymentForm(transaction)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay transacciones</h3>
            <p className="mt-1 text-sm text-gray-500">
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
        />
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleUpdateTransaction}
          onCancel={() => setEditingTransaction(null)}
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