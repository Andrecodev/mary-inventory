/**
 * Database Provider Interface
 * Abstraction layer that allows switching between different database providers
 */

import { Product, Customer, Supplier, AccountTransaction, PaymentRecord, PurchaseHistory, OrderHistory } from '../../types';

export interface DatabaseProvider {
  name: string;

  // Products
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Product>;
  getProducts(userId: string): Promise<Product[]>;
  updateProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Customers
  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Customer>;
  getCustomers(userId: string): Promise<Customer[]>;
  updateCustomer(customer: Customer): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Suppliers
  createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Supplier>;
  getSuppliers(userId: string): Promise<Supplier[]>;
  updateSupplier(supplier: Supplier): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;

  // Account Transactions
  createAccountTransaction(transaction: Omit<AccountTransaction, 'id'>, userId: string): Promise<AccountTransaction>;
  getAccountTransactions(userId: string): Promise<AccountTransaction[]>;
  updateAccountTransaction(transaction: AccountTransaction): Promise<AccountTransaction>;
  deleteAccountTransaction(id: string): Promise<void>;

  // Payment Records
  createPaymentRecord(payment: Omit<PaymentRecord, 'id'>, userId: string): Promise<PaymentRecord>;
  getPaymentRecords(userId: string): Promise<PaymentRecord[]>;

  // Purchase History
  createPurchaseHistory(purchase: Omit<PurchaseHistory, 'id'>, userId: string): Promise<PurchaseHistory>;
  getPurchaseHistory(userId: string): Promise<PurchaseHistory[]>;

  // Order History
  createOrderHistory(order: Omit<OrderHistory, 'id'>, userId: string): Promise<OrderHistory>;
  getOrderHistory(userId: string): Promise<OrderHistory[]>;

  // Real-time subscriptions
  subscribeToChanges(userId: string, callbacks: {
    onProductChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', data: Product) => void;
    onCustomerChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', data: Customer) => void;
    onSupplierChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', data: Supplier) => void;
    onTransactionChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', data: AccountTransaction) => void;
  }): () => void; // Returns unsubscribe function

  // Health check
  isHealthy(): Promise<boolean>;
}

export type DatabaseProviderType = 'supabase' | 'firebase' | 'pocketbase';
