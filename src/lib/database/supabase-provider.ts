/**
 * Supabase Database Provider (Current Implementation)
 * Wraps existing Supabase code in the DatabaseProvider interface
 */

import { DatabaseProvider } from './interface';
import { Product, Customer, Supplier, AccountTransaction, PaymentRecord, PurchaseHistory, OrderHistory } from '../../types';
import * as legacyDb from '../database'; // Import existing database functions

export class SupabaseProvider implements DatabaseProvider {
  name = 'supabase';

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Product> {
    return legacyDb.createProduct(product, userId);
  }

  async getProducts(userId: string): Promise<Product[]> {
    // Will be used when we refactor data loading
    throw new Error('Use legacy data loading for now');
  }

  async updateProduct(product: Product): Promise<Product> {
    return legacyDb.updateProduct(product);
  }

  async deleteProduct(id: string): Promise<void> {
    return legacyDb.deleteProduct(id);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Customer> {
    return legacyDb.createCustomer(customer, userId);
  }

  async getCustomers(userId: string): Promise<Customer[]> {
    throw new Error('Use legacy data loading for now');
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    return legacyDb.updateCustomer(customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    return legacyDb.deleteCustomer(id);
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Supplier> {
    return legacyDb.createSupplier(supplier, userId);
  }

  async getSuppliers(userId: string): Promise<Supplier[]> {
    throw new Error('Use legacy data loading for now');
  }

  async updateSupplier(supplier: Supplier): Promise<Supplier> {
    return legacyDb.updateSupplier(supplier);
  }

  async deleteSupplier(id: string): Promise<void> {
    return legacyDb.deleteSupplier(id);
  }

  async createAccountTransaction(transaction: Omit<AccountTransaction, 'id'>, userId: string): Promise<AccountTransaction> {
    return legacyDb.createAccountTransaction(transaction as any, userId);
  }

  async getAccountTransactions(userId: string): Promise<AccountTransaction[]> {
    throw new Error('Use legacy data loading for now');
  }

  async updateAccountTransaction(transaction: AccountTransaction): Promise<AccountTransaction> {
    return legacyDb.updateAccountTransaction(transaction);
  }

  async deleteAccountTransaction(id: string): Promise<void> {
    return legacyDb.deleteAccountTransaction(id);
  }

  async createPaymentRecord(payment: Omit<PaymentRecord, 'id'>, userId: string): Promise<PaymentRecord> {
    return legacyDb.createPaymentRecord(payment, userId);
  }

  async getPaymentRecords(userId: string): Promise<PaymentRecord[]> {
    throw new Error('Use legacy data loading for now');
  }

  async createPurchaseHistory(purchase: Omit<PurchaseHistory, 'id'>, userId: string): Promise<PurchaseHistory> {
    return legacyDb.createPurchaseHistory(purchase, userId);
  }

  async getPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
    throw new Error('Use legacy data loading for now');
  }

  async createOrderHistory(order: Omit<OrderHistory, 'id'>, userId: string): Promise<OrderHistory> {
    return legacyDb.createOrderHistory(order, userId);
  }

  async getOrderHistory(userId: string): Promise<OrderHistory[]> {
    throw new Error('Use legacy data loading for now');
  }

  subscribeToChanges(userId: string, callbacks: any): () => void {
    // Real-time subscriptions are handled in AppContext for now
    console.log('📡 Supabase: Subscriptions handled in AppContext');
    return () => {};
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Simple health check - try to query a table
      const { error } = await (await import('../supabase')).supabase
        .from('products')
        .select('id')
        .limit(1);
      return !error;
    } catch (err) {
      console.error('Supabase health check failed:', err);
      return false;
    }
  }
}
