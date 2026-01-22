import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Product, Customer, Supplier, View, SystemSettings, AccountTransaction, PaymentRecord, PurchaseHistory, OrderHistory } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type AppAction =
  | { type: 'SET_VIEW'; payload: View }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'SET_ACCOUNT_TRANSACTIONS'; payload: AccountTransaction[] }
  | { type: 'ADD_ACCOUNT_TRANSACTION'; payload: AccountTransaction }
  | { type: 'UPDATE_ACCOUNT_TRANSACTION'; payload: AccountTransaction }
  | { type: 'DELETE_ACCOUNT_TRANSACTION'; payload: string }
  | { type: 'SET_PAYMENT_RECORDS'; payload: PaymentRecord[] }
  | { type: 'ADD_PAYMENT_RECORD'; payload: PaymentRecord }
  | { type: 'SET_PURCHASE_HISTORY'; payload: PurchaseHistory[] }
  | { type: 'ADD_PURCHASE'; payload: PurchaseHistory }
  | { type: 'SET_ORDER_HISTORY'; payload: OrderHistory[] }
  | { type: 'ADD_ORDER'; payload: OrderHistory }
  | { type: 'UPDATE_ORDER'; payload: OrderHistory }
  | { type: 'SET_SETTINGS'; payload: SystemSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SystemSettings> }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'es' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

const defaultSettings: SystemSettings = {
  currency: 'MXN',
  language: 'es',
  timezone: 'America/Mexico_City',
  dateFormat: 'DD/MM/YYYY',
  businessHours: {
    start: '09:00',
    end: '18:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  holidays: [],
  emailNotifications: {
    lowStock: true,
    overduePayments: true,
    customerReminders: true,
    supplierOrders: true
  },
  backupSettings: {
    autoBackup: true,
    frequency: 'daily',
    location: 'cloud'
  },
  customFields: {
    customers: [],
    suppliers: [],
    products: []
  }
};

const initialState: AppState = {
  currentView: 'dashboard',
  products: [],
  customers: [],
  suppliers: [],
  payments: [],
  accountTransactions: [],
  paymentRecords: [],
  purchaseHistory: [],
  orderHistory: [],
  user: null,
  users: [],
  settings: defaultSettings,
  isOffline: false,
  language: 'es',
  isLoading: false,
  searchQuery: '',
  showTutorial: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadData: () => Promise<void>;
} | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c)
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload)
      };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s)
      };
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(s => s.id !== action.payload)
      };
    case 'SET_ACCOUNT_TRANSACTIONS':
      return { ...state, accountTransactions: action.payload };
    case 'ADD_ACCOUNT_TRANSACTION':
      return { ...state, accountTransactions: [...state.accountTransactions, action.payload] };
    case 'UPDATE_ACCOUNT_TRANSACTION':
      return {
        ...state,
        accountTransactions: state.accountTransactions.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_ACCOUNT_TRANSACTION':
      return {
        ...state,
        accountTransactions: state.accountTransactions.filter(t => t.id !== action.payload)
      };
    case 'SET_PAYMENT_RECORDS':
      return { ...state, paymentRecords: action.payload };
    case 'ADD_PAYMENT_RECORD':
      return { ...state, paymentRecords: [...state.paymentRecords, action.payload] };
    case 'SET_PURCHASE_HISTORY':
      return { ...state, purchaseHistory: action.payload };
    case 'ADD_PURCHASE':
      return { ...state, purchaseHistory: [...state.purchaseHistory, action.payload] };
    case 'SET_ORDER_HISTORY':
      return { ...state, orderHistory: action.payload };
    case 'ADD_ORDER':
      return { ...state, orderHistory: [...state.orderHistory, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orderHistory: state.orderHistory.map(o => o.id === action.payload.id ? action.payload : o)
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload, settings: { ...state.settings, language: action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  const hasLoadedData = React.useRef(false);
  const currentUserId = React.useRef<string | null>(null);
  const isLoadingData = React.useRef(false);

  const loadData = async () => {
    if (!user) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingData.current) {
      console.log('⏸️ Load already in progress, skipping...');
      return;
    }

    try {
      isLoadingData.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });

      // Use fetch directly since supabase client has issues with queries
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Get token from localStorage (where supabase stores it)
      const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);
      let token = supabaseKey;
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          token = parsed.access_token || supabaseKey;
        } catch (e) {
          // Use anon key as fallback
        }
      }
      
      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const fetchTable = async (table: string) => {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/${table}?user_id=eq.${user.id}&select=*`,
          { headers }
        );
        if (!response.ok) {
          console.error(`Error fetching ${table}:`, response.status, response.statusText);
          return [];
        }
        return response.json();
      };

      const [
        productsData,
        customersData,
        suppliersData,
        transactionsData,
        paymentRecordsData,
        purchaseHistoryData,
        orderHistoryData
      ] = await Promise.all([
        fetchTable('products'),
        fetchTable('customers'),
        fetchTable('suppliers'),
        fetchTable('account_transactions'),
        fetchTable('payment_records'),
        fetchTable('purchase_history'),
        fetchTable('order_history')
      ]);

      // Create response-like objects for compatibility with rest of code
      const productsRes = { data: productsData, error: null };
      const customersRes = { data: customersData, error: null };
      const suppliersRes = { data: suppliersData, error: null };
      const transactionsRes = { data: transactionsData, error: null };
      const paymentRecordsRes = { data: paymentRecordsData, error: null };
      const purchaseHistoryRes = { data: purchaseHistoryData, error: null };
      const orderHistoryRes = { data: orderHistoryData, error: null };

      // Map database records to app types
      if (productsRes.data) {
        const products: Product[] = productsRes.data.map(p => ({
          id: p.id,
          name: p.name,
          image: p.image,
          quantity: p.quantity,
          price: Number(p.price),
          category: p.category,
          lowStockThreshold: p.low_stock_threshold,
          notes: p.notes,
          barcode: p.barcode,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at)
        }));
        dispatch({ type: 'SET_PRODUCTS', payload: products });
      }

      if (customersRes.data) {
        const customers: Customer[] = customersRes.data.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          photo: c.photo,
          address: c.address,
          totalDebt: Number(c.total_debt),
          category: c.category as any,
          rating: c.rating,
          preferences: c.preferences,
          notes: c.notes,
          lastPurchase: c.last_purchase ? new Date(c.last_purchase) : undefined,
          totalPurchases: c.total_purchases,
          followUpDate: c.follow_up_date ? new Date(c.follow_up_date) : undefined,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at)
        }));
        dispatch({ type: 'SET_CUSTOMERS', payload: customers });
      }

      if (suppliersRes.data) {
        const suppliers: Supplier[] = suppliersRes.data.map(s => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          address: s.address,
          totalOwed: Number(s.total_owed),
          rating: s.rating,
          contractTerms: s.contract_terms,
          paymentTerms: s.payment_terms,
          deliverySchedule: s.delivery_schedule,
          notes: s.notes,
          lastOrder: s.last_order ? new Date(s.last_order) : undefined,
          totalOrders: s.total_orders,
          performance: {
            onTimeDelivery: s.on_time_delivery,
            qualityRating: s.quality_rating,
            communicationRating: s.communication_rating
          },
          autoReorderEnabled: s.auto_reorder_enabled,
          reorderThreshold: s.reorder_threshold,
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at)
        }));
        dispatch({ type: 'SET_SUPPLIERS', payload: suppliers });
      }

      if (transactionsRes.data) {
        const transactions: AccountTransaction[] = transactionsRes.data.map(t => ({
          id: t.id,
          type: t.type as any,
          customerId: t.customer_id,
          supplierId: t.supplier_id,
          customerName: t.customer_name,
          supplierName: t.supplier_name,
          products: t.products,
          totalAmount: Number(t.total_amount),
          paidAmount: Number(t.paid_amount),
          remainingAmount: Number(t.remaining_amount),
          dueDate: new Date(t.due_date),
          lastPaymentDate: t.last_payment_date ? new Date(t.last_payment_date) : undefined,
          status: t.status as any,
          paymentTerms: t.payment_terms,
          notes: t.notes,
          invoiceNumber: t.invoice_number,
          reference: t.reference,
          createdDate: new Date(t.created_at)
        }));
        dispatch({ type: 'SET_ACCOUNT_TRANSACTIONS', payload: transactions });
      }

      if (paymentRecordsRes.data) {
        const paymentRecords: PaymentRecord[] = paymentRecordsRes.data.map(p => ({
          id: p.id,
          transactionId: p.transaction_id,
          amount: Number(p.amount),
          paymentDate: new Date(p.payment_date),
          paymentMethod: p.payment_method as any,
          reference: p.reference,
          notes: p.notes,
          createdBy: p.created_by
        }));
        dispatch({ type: 'SET_PAYMENT_RECORDS', payload: paymentRecords });
      }

      if (purchaseHistoryRes.data) {
        const purchaseHistory: PurchaseHistory[] = purchaseHistoryRes.data.map(p => ({
          id: p.id,
          customerId: p.customer_id,
          products: p.products,
          total: Number(p.total),
          date: new Date(p.created_at),
          notes: p.notes
        }));
        dispatch({ type: 'SET_PURCHASE_HISTORY', payload: purchaseHistory });
      }

      if (orderHistoryRes.data) {
        const orderHistory: OrderHistory[] = orderHistoryRes.data.map(o => ({
          id: o.id,
          supplierId: o.supplier_id,
          products: o.products,
          total: Number(o.total),
          orderDate: new Date(o.order_date),
          expectedDelivery: new Date(o.expected_delivery),
          actualDelivery: o.actual_delivery ? new Date(o.actual_delivery) : undefined,
          status: o.status as any,
          notes: o.notes
        }));
        dispatch({ type: 'SET_ORDER_HISTORY', payload: orderHistory });
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      isLoadingData.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    // Only load data when user changes (not just the user object reference)
    if (user && (!hasLoadedData.current || currentUserId.current !== user.id)) {
      currentUserId.current = user.id;
      hasLoadedData.current = true;
      loadData();
    } else if (!user) {
      // Reset when user logs out
      hasLoadedData.current = false;
      currentUserId.current = null;
    }
  }, [user?.id]);

  const value = {
    state,
    dispatch,
    loadData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
