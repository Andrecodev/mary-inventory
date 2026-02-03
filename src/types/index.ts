export interface Product {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  purchasePrice: number;
  category: string;
  lowStockThreshold: number;
  notes: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  address: string;
  totalDebt: number;
  category: 'VIP' | 'Regular' | 'New' | 'Inactive';
  rating: number;
  preferences: string;
  notes: string;
  lastPurchase?: Date;
  totalPurchases: number;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOwed: number;
  rating: number;
  contractTerms: string;
  paymentTerms: string;
  deliverySchedule: string;
  notes: string;
  lastOrder?: Date;
  totalOrders: number;
  performance: {
    onTimeDelivery: number;
    qualityRating: number;
    communicationRating: number;
  };
  autoReorderEnabled: boolean;
  reorderThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  customerId?: string;
  supplierId?: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  products?: { productId: string; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountTransaction {
  id: string;
  type: 'receivable' | 'payable';
  customerId?: string;
  supplierId?: string;
  customerName?: string;
  supplierName?: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  createdDate: Date;
  lastPaymentDate?: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentTerms: string;
  notes: string;
  invoiceNumber?: string;
  reference?: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  reference?: string;
  notes?: string;
  createdBy: string;
}

export interface PurchaseHistory {
  id: string;
  customerId: string;
  products: { productId: string; quantity: number; price: number }[];
  total: number;
  date: Date;
  notes?: string;
}

export interface OrderHistory {
  id: string;
  supplierId: string;
  products: { productId: string; quantity: number; cost: number }[];
  total: number;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  language: 'en' | 'es';
  pin?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface SystemSettings {
  currency: string;
  language: 'en' | 'es';
  timezone: string;
  dateFormat: string;
  businessHours: {
    start: string;
    end: string;
    days: string[];
  };
  holidays: Date[];
  emailNotifications: {
    lowStock: boolean;
    overduePayments: boolean;
    customerReminders: boolean;
    supplierOrders: boolean;
  };
  backupSettings: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    location: 'local' | 'cloud';
  };
  customFields: {
    customers: { name: string; type: string; required: boolean }[];
    suppliers: { name: string; type: string; required: boolean }[];
    products: { name: string; type: string; required: boolean }[];
  };
}

export type View = 'dashboard' | 'inventory' | 'customers' | 'suppliers' | 'accounts' | 'settings' | 'reports';

export interface AppState {
  currentView: View;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  payments: Payment[];
  accountTransactions: AccountTransaction[];
  paymentRecords: PaymentRecord[];
  purchaseHistory: PurchaseHistory[];
  orderHistory: OrderHistory[];
  user: User | null;
  users: User[];
  settings: SystemSettings;
  isOffline: boolean;
  language: 'en' | 'es';
  isLoading: boolean;
  searchQuery: string;
  showTutorial: boolean;
}

export interface Feedback {
  id: string;
  user_id: string;
  email?: string;
  feedback_text: string;
  category?: string;
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  created_at: Date;
  updated_at: Date;
}