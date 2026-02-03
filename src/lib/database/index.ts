/**
 * Database Abstraction Layer - Main Entry Point
 *
 * This module provides a unified interface for database operations
 * that can work with multiple backend providers (Supabase, Firebase, etc.)
 *
 * Usage:
 * ```typescript
 * import { db } from '@/lib/database';
 * const product = await db.createProduct(productData, userId);
 * ```
 */

import { getDatabaseProvider, checkProviderHealth, switchProvider, getCurrentProviderName, getProviderHealth } from './factory';
import { DatabaseProvider, DatabaseProviderType } from './interface';

// Export types
export type { DatabaseProvider, DatabaseProviderType };
export { SupabaseProvider } from './supabase-provider';
export { FirebaseProvider } from './firebase-provider';

// Main database instance - automatically uses the configured provider
export const db: DatabaseProvider & {
  // Additional utility methods
  switchProvider: (provider: DatabaseProviderType) => Promise<boolean>;
  checkHealth: () => Promise<void>;
  getProviderName: () => string;
  getHealth: () => { name: string; healthy: boolean };
} = {
  // Delegate all database operations to current provider
  get name() {
    return getDatabaseProvider().name;
  },

  // Products
  createProduct: (...args) => getDatabaseProvider().createProduct(...args),
  getProducts: (...args) => getDatabaseProvider().getProducts(...args),
  updateProduct: (...args) => getDatabaseProvider().updateProduct(...args),
  deleteProduct: (...args) => getDatabaseProvider().deleteProduct(...args),

  // Customers
  createCustomer: (...args) => getDatabaseProvider().createCustomer(...args),
  getCustomers: (...args) => getDatabaseProvider().getCustomers(...args),
  updateCustomer: (...args) => getDatabaseProvider().updateCustomer(...args),
  deleteCustomer: (...args) => getDatabaseProvider().deleteCustomer(...args),

  // Suppliers
  createSupplier: (...args) => getDatabaseProvider().createSupplier(...args),
  getSuppliers: (...args) => getDatabaseProvider().getSuppliers(...args),
  updateSupplier: (...args) => getDatabaseProvider().updateSupplier(...args),
  deleteSupplier: (...args) => getDatabaseProvider().deleteSupplier(...args),

  // Account Transactions
  createAccountTransaction: (...args) => getDatabaseProvider().createAccountTransaction(...args),
  getAccountTransactions: (...args) => getDatabaseProvider().getAccountTransactions(...args),
  updateAccountTransaction: (...args) => getDatabaseProvider().updateAccountTransaction(...args),
  deleteAccountTransaction: (...args) => getDatabaseProvider().deleteAccountTransaction(...args),

  // Payment Records
  createPaymentRecord: (...args) => getDatabaseProvider().createPaymentRecord(...args),
  getPaymentRecords: (...args) => getDatabaseProvider().getPaymentRecords(...args),

  // Purchase History
  createPurchaseHistory: (...args) => getDatabaseProvider().createPurchaseHistory(...args),
  getPurchaseHistory: (...args) => getDatabaseProvider().getPurchaseHistory(...args),

  // Order History
  createOrderHistory: (...args) => getDatabaseProvider().createOrderHistory(...args),
  getOrderHistory: (...args) => getDatabaseProvider().getOrderHistory(...args),

  // Real-time
  subscribeToChanges: (...args) => getDatabaseProvider().subscribeToChanges(...args),
  isHealthy: () => getDatabaseProvider().isHealthy(),

  // Utility methods
  switchProvider,
  checkHealth: checkProviderHealth,
  getProviderName: getCurrentProviderName,
  getHealth: getProviderHealth,
};

// Auto health check on import
checkProviderHealth();

export default db;
