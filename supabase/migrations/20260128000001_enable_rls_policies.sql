/*
  # Enable Row Level Security (RLS) Policies

  This migration enables RLS and creates policies for all tables to ensure:
  - Users can only access their own data
  - Authenticated users can perform all CRUD operations on their data
  - Data isolation between different users
*/

-- ============================================
-- PRODUCTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- Create policies
CREATE POLICY "Users can insert own products"
ON products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own products"
ON products FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
ON products FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
ON products FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own customers" ON customers;

CREATE POLICY "Users can manage own customers"
ON customers FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SUPPLIERS TABLE
-- ============================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own suppliers" ON suppliers;

CREATE POLICY "Users can manage own suppliers"
ON suppliers FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ACCOUNT_TRANSACTIONS TABLE
-- ============================================

ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own transactions" ON account_transactions;

CREATE POLICY "Users can manage own transactions"
ON account_transactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PAYMENT_RECORDS TABLE
-- ============================================

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own payment records" ON payment_records;

CREATE POLICY "Users can manage own payment records"
ON payment_records FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PURCHASE_HISTORY TABLE
-- ============================================

ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own purchase history" ON purchase_history;

CREATE POLICY "Users can manage own purchase history"
ON purchase_history FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ORDER_HISTORY TABLE
-- ============================================

ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own order history" ON order_history;

CREATE POLICY "Users can manage own order history"
ON order_history FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Add comments for documentation
COMMENT ON TABLE products IS 'Products table with RLS enabled - users can only access their own products';
COMMENT ON TABLE customers IS 'Customers table with RLS enabled - users can only access their own customers';
COMMENT ON TABLE suppliers IS 'Suppliers table with RLS enabled - users can only access their own suppliers';
COMMENT ON TABLE account_transactions IS 'Account transactions with RLS enabled - users can only access their own transactions';
COMMENT ON TABLE payment_records IS 'Payment records with RLS enabled - users can only access their own payment records';
COMMENT ON TABLE purchase_history IS 'Purchase history with RLS enabled - users can only access their own purchase history';
COMMENT ON TABLE order_history IS 'Order history with RLS enabled - users can only access their own order history';
