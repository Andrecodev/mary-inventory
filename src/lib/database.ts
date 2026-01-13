import { supabase } from './supabase';
import { Product, Customer, Supplier, AccountTransaction, PaymentRecord, PurchaseHistory, OrderHistory } from '../types';

// Products
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      low_stock_threshold: product.lowStockThreshold,
      notes: product.notes,
      barcode: product.barcode
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (product: Product) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      low_stock_threshold: product.lowStockThreshold,
      notes: product.notes,
      barcode: product.barcode
    })
    .eq('id', product.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Customers
export const createCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      photo: customer.photo,
      address: customer.address,
      total_debt: customer.totalDebt,
      category: customer.category,
      rating: customer.rating,
      preferences: customer.preferences,
      notes: customer.notes,
      last_purchase: customer.lastPurchase?.toISOString(),
      total_purchases: customer.totalPurchases,
      follow_up_date: customer.followUpDate?.toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCustomer = async (customer: Customer) => {
  const { data, error } = await supabase
    .from('customers')
    .update({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      photo: customer.photo,
      address: customer.address,
      total_debt: customer.totalDebt,
      category: customer.category,
      rating: customer.rating,
      preferences: customer.preferences,
      notes: customer.notes,
      last_purchase: customer.lastPurchase?.toISOString(),
      total_purchases: customer.totalPurchases,
      follow_up_date: customer.followUpDate?.toISOString()
    })
    .eq('id', customer.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Suppliers
export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: userId,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      total_owed: supplier.totalOwed,
      rating: supplier.rating,
      contract_terms: supplier.contractTerms,
      payment_terms: supplier.paymentTerms,
      delivery_schedule: supplier.deliverySchedule,
      notes: supplier.notes,
      last_order: supplier.lastOrder?.toISOString(),
      total_orders: supplier.totalOrders,
      on_time_delivery: supplier.performance.onTimeDelivery,
      quality_rating: supplier.performance.qualityRating,
      communication_rating: supplier.performance.communicationRating,
      auto_reorder_enabled: supplier.autoReorderEnabled,
      reorder_threshold: supplier.reorderThreshold
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSupplier = async (supplier: Supplier) => {
  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      total_owed: supplier.totalOwed,
      rating: supplier.rating,
      contract_terms: supplier.contractTerms,
      payment_terms: supplier.paymentTerms,
      delivery_schedule: supplier.deliverySchedule,
      notes: supplier.notes,
      last_order: supplier.lastOrder?.toISOString(),
      total_orders: supplier.totalOrders,
      on_time_delivery: supplier.performance.onTimeDelivery,
      quality_rating: supplier.performance.qualityRating,
      communication_rating: supplier.performance.communicationRating,
      auto_reorder_enabled: supplier.autoReorderEnabled,
      reorder_threshold: supplier.reorderThreshold
    })
    .eq('id', supplier.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSupplier = async (id: string) => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Account Transactions
export const createAccountTransaction = async (transaction: Omit<AccountTransaction, 'id' | 'createdDate'>, userId: string) => {
  const { data, error } = await supabase
    .from('account_transactions')
    .insert({
      user_id: userId,
      type: transaction.type,
      customer_id: transaction.customerId,
      supplier_id: transaction.supplierId,
      customer_name: transaction.customerName,
      supplier_name: transaction.supplierName,
      products: transaction.products,
      total_amount: transaction.totalAmount,
      paid_amount: transaction.paidAmount,
      remaining_amount: transaction.remainingAmount,
      due_date: transaction.dueDate.toISOString(),
      last_payment_date: transaction.lastPaymentDate?.toISOString(),
      status: transaction.status,
      payment_terms: transaction.paymentTerms,
      notes: transaction.notes,
      invoice_number: transaction.invoiceNumber,
      reference: transaction.reference
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAccountTransaction = async (transaction: AccountTransaction) => {
  const { data, error } = await supabase
    .from('account_transactions')
    .update({
      type: transaction.type,
      customer_id: transaction.customerId,
      supplier_id: transaction.supplierId,
      customer_name: transaction.customerName,
      supplier_name: transaction.supplierName,
      products: transaction.products,
      total_amount: transaction.totalAmount,
      paid_amount: transaction.paidAmount,
      remaining_amount: transaction.remainingAmount,
      due_date: transaction.dueDate.toISOString(),
      last_payment_date: transaction.lastPaymentDate?.toISOString(),
      status: transaction.status,
      payment_terms: transaction.paymentTerms,
      notes: transaction.notes,
      invoice_number: transaction.invoiceNumber,
      reference: transaction.reference
    })
    .eq('id', transaction.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccountTransaction = async (id: string) => {
  const { error} = await supabase
    .from('account_transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Payment Records
export const createPaymentRecord = async (payment: Omit<PaymentRecord, 'id'>, userId: string) => {
  const { data, error } = await supabase
    .from('payment_records')
    .insert({
      user_id: userId,
      transaction_id: payment.transactionId,
      amount: payment.amount,
      payment_date: payment.paymentDate.toISOString(),
      payment_method: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      created_by: payment.createdBy
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Purchase History
export const createPurchaseHistory = async (purchase: Omit<PurchaseHistory, 'id'>, userId: string) => {
  const { data, error } = await supabase
    .from('purchase_history')
    .insert({
      user_id: userId,
      customer_id: purchase.customerId,
      products: purchase.products,
      total: purchase.total,
      notes: purchase.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Order History
export const createOrderHistory = async (order: Omit<OrderHistory, 'id'>, userId: string) => {
  const { data, error } = await supabase
    .from('order_history')
    .insert({
      user_id: userId,
      supplier_id: order.supplierId,
      products: order.products,
      total: order.total,
      order_date: order.orderDate.toISOString(),
      expected_delivery: order.expectedDelivery.toISOString(),
      actual_delivery: order.actualDelivery?.toISOString(),
      status: order.status,
      notes: order.notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOrderHistory = async (order: OrderHistory) => {
  const { data, error } = await supabase
    .from('order_history')
    .update({
      supplier_id: order.supplierId,
      products: order.products,
      total: order.total,
      order_date: order.orderDate.toISOString(),
      expected_delivery: order.expectedDelivery.toISOString(),
      actual_delivery: order.actualDelivery?.toISOString(),
      status: order.status,
      notes: order.notes
    })
    .eq('id', order.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
