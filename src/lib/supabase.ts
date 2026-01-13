import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: 'admin' | 'manager' | 'staff';
          language: 'en' | 'es';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          image: string;
          price: number;
          quantity: number;
          category: string;
          low_stock_threshold: number;
          notes: string;
          barcode: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          photo: string;
          address: string;
          total_debt: number;
          category: 'VIP' | 'Regular' | 'New' | 'Inactive';
          rating: number;
          preferences: string;
          notes: string;
          last_purchase: string | null;
          total_purchases: number;
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      suppliers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          total_owed: number;
          rating: number;
          contract_terms: string;
          payment_terms: string;
          delivery_schedule: string;
          notes: string;
          last_order: string | null;
          total_orders: number;
          on_time_delivery: number;
          quality_rating: number;
          communication_rating: number;
          auto_reorder_enabled: boolean;
          reorder_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>;
      };
      account_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'receivable' | 'payable';
          customer_id: string | null;
          supplier_id: string | null;
          customer_name: string | null;
          supplier_name: string | null;
          products: any;
          total_amount: number;
          paid_amount: number;
          remaining_amount: number;
          due_date: string;
          last_payment_date: string | null;
          status: 'pending' | 'partial' | 'paid' | 'overdue';
          payment_terms: string;
          notes: string;
          invoice_number: string;
          reference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['account_transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['account_transactions']['Insert']>;
      };
      payment_records: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string;
          amount: number;
          payment_date: string;
          payment_method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
          reference: string;
          notes: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_records']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_records']['Insert']>;
      };
      purchase_history: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          products: any;
          total: number;
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchase_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['purchase_history']['Insert']>;
      };
      order_history: {
        Row: {
          id: string;
          user_id: string;
          supplier_id: string;
          products: any;
          total: number;
          order_date: string;
          expected_delivery: string;
          actual_delivery: string | null;
          status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_history']['Insert']>;
      };
    };
  };
};
