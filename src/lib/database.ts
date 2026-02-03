import { supabase } from './supabase';
import { Product, Customer, Supplier, AccountTransaction, PaymentRecord, PurchaseHistory, OrderHistory } from '../types';

// Products
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
  console.log('🔵 createProduct llamado con:', { product, userId });
  
  // Filter out undefined values and ensure we have all required fields
  const insertData: Record<string, any> = {
    user_id: userId,
    name: product.name,
    image: product.image || null,
    price: product.price,
    purchase_price: product.purchasePrice || 0,
    quantity: product.quantity || 0,
    category: product.category || 'other',
    low_stock_threshold: product.lowStockThreshold || 5,
    notes: product.notes || '',
    barcode: product.barcode || '',
  };
  
  console.log('📤 Datos a insertar:', insertData);
  console.log('🔌 Estado de conexión Supabase:', supabase);
  
  try {
    console.log('⏳ Iniciando inserción en Supabase...');
    console.log('📡 Ejecutando INSERT en tabla products...');

    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select();

    console.log('🔍 Respuesta completa de Supabase:', { data, error, hasData: !!data, hasError: !!error });

    // If error is about purchase_price column not existing, try again without it
    if (error && error.message && error.message.includes('purchase_price')) {
      console.warn('⚠️ Campo purchase_price no existe en la tabla, reintentando sin él...');
      const dataWithoutPurchasePrice = { ...insertData };
      delete dataWithoutPurchasePrice.purchase_price;
      
      const retryResult = await supabase
        .from('products')
        .insert(dataWithoutPurchasePrice)
        .select();
      
      data = retryResult.data;
      error = retryResult.error;
      console.log('🔄 Respuesta del reintento:', { data, error });
    }

    if (error) {
      console.error('❌ Error de Supabase:', error);
      console.error('❌ Código de error:', error.code);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Detalles:', error.details);
      console.error('❌ Hint:', error.hint);
      throw new Error(`Error de Supabase: ${error.message} (Código: ${error.code || 'desconocido'})`);
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('⚠️ No se recibió data ni error de Supabase');
      throw new Error('No se recibió respuesta de Supabase');
    }
    
    const insertedProduct = data[0];
    console.log('✅ Producto creado exitosamente:', insertedProduct);
    return insertedProduct;
  } catch (err) {
    console.error('❌ Error capturado en createProduct:', err);
    if (err instanceof Error) {
      console.error('❌ Mensaje de error:', err.message);
      console.error('❌ Stack:', err.stack);
    }
    throw err;
  }
};

export const updateProduct = async (product: Product) => {
  const updateData: Record<string, any> = {
    name: product.name,
    image: product.image || null,
    price: product.price,
    purchase_price: product.purchasePrice || 0,
    quantity: product.quantity || 0,
    category: product.category || 'other',
    low_stock_threshold: product.lowStockThreshold || 5,
    notes: product.notes || '',
    barcode: product.barcode || '',
  };

  let { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', product.id)
    .select();

  // If error is about purchase_price column not existing, try again without it
  if (error && error.message && error.message.includes('purchase_price')) {
    console.warn('⚠️ Campo purchase_price no existe en la tabla, reintentando sin él...');
    const dataWithoutPurchasePrice = { ...updateData };
    delete dataWithoutPurchasePrice.purchase_price;
    
    const retryResult = await supabase
      .from('products')
      .update(dataWithoutPurchasePrice)
      .eq('id', product.id)
      .select();
    
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) throw error;
  return data && Array.isArray(data) && data.length > 0 ? data[0] : data;
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
