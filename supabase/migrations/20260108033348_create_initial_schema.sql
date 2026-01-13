/*
  # Sistema de Gestión Empresarial - Schema Inicial

  ## Resumen
  Este migration crea el schema completo para el sistema de gestión de inventario y finanzas,
  incluyendo productos, clientes, proveedores, transacciones y configuraciones.

  ## 1. Nuevas Tablas
  
  ### `profiles`
  - `id` (uuid, FK a auth.users) - ID del usuario
  - `name` (text) - Nombre completo
  - `role` (text) - Rol (admin, manager, staff)
  - `language` (text) - Idioma preferido
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización

  ### `products`
  - `id` (uuid, PK) - ID único del producto
  - `user_id` (uuid, FK) - Propietario del producto
  - `name` (text) - Nombre del producto
  - `image` (text) - URL de la imagen
  - `price` (numeric) - Precio unitario
  - `quantity` (integer) - Cantidad en stock
  - `category` (text) - Categoría del producto
  - `low_stock_threshold` (integer) - Umbral de stock bajo
  - `notes` (text) - Notas adicionales
  - `barcode` (text) - Código de barras
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización

  ### `customers`
  - `id` (uuid, PK) - ID único del cliente
  - `user_id` (uuid, FK) - Propietario del registro
  - `name` (text) - Nombre del cliente
  - `email` (text) - Email
  - `phone` (text) - Teléfono
  - `photo` (text) - URL de la foto
  - `address` (text) - Dirección
  - `total_debt` (numeric) - Deuda total
  - `category` (text) - Categoría (VIP, Regular, New, Inactive)
  - `rating` (integer) - Calificación (1-5)
  - `preferences` (text) - Preferencias del cliente
  - `notes` (text) - Notas
  - `last_purchase` (timestamptz) - Última compra
  - `total_purchases` (integer) - Total de compras
  - `follow_up_date` (timestamptz) - Fecha de seguimiento
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización

  ### `suppliers`
  - `id` (uuid, PK) - ID único del proveedor
  - `user_id` (uuid, FK) - Propietario del registro
  - `name` (text) - Nombre del proveedor
  - `email` (text) - Email
  - `phone` (text) - Teléfono
  - `address` (text) - Dirección
  - `total_owed` (numeric) - Total adeudado
  - `rating` (integer) - Calificación
  - `contract_terms` (text) - Términos del contrato
  - `payment_terms` (text) - Términos de pago
  - `delivery_schedule` (text) - Horario de entrega
  - `notes` (text) - Notas
  - `last_order` (timestamptz) - Último pedido
  - `total_orders` (integer) - Total de pedidos
  - `on_time_delivery` (integer) - Calificación de entrega
  - `quality_rating` (integer) - Calificación de calidad
  - `communication_rating` (integer) - Calificación de comunicación
  - `auto_reorder_enabled` (boolean) - Reorden automático habilitado
  - `reorder_threshold` (integer) - Umbral de reorden
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización

  ### `account_transactions`
  - `id` (uuid, PK) - ID único de la transacción
  - `user_id` (uuid, FK) - Propietario del registro
  - `type` (text) - Tipo (receivable, payable)
  - `customer_id` (uuid, FK) - ID del cliente (si aplica)
  - `supplier_id` (uuid, FK) - ID del proveedor (si aplica)
  - `customer_name` (text) - Nombre del cliente
  - `supplier_name` (text) - Nombre del proveedor
  - `products` (jsonb) - Productos incluidos
  - `total_amount` (numeric) - Monto total
  - `paid_amount` (numeric) - Monto pagado
  - `remaining_amount` (numeric) - Monto pendiente
  - `due_date` (timestamptz) - Fecha de vencimiento
  - `last_payment_date` (timestamptz) - Último pago
  - `status` (text) - Estado (pending, partial, paid, overdue)
  - `payment_terms` (text) - Términos de pago
  - `notes` (text) - Notas
  - `invoice_number` (text) - Número de factura
  - `reference` (text) - Referencia
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización

  ### `payment_records`
  - `id` (uuid, PK) - ID único del pago
  - `user_id` (uuid, FK) - Propietario del registro
  - `transaction_id` (uuid, FK) - ID de la transacción
  - `amount` (numeric) - Monto del pago
  - `payment_date` (timestamptz) - Fecha de pago
  - `payment_method` (text) - Método de pago
  - `reference` (text) - Referencia
  - `notes` (text) - Notas
  - `created_by` (text) - Creado por
  - `created_at` (timestamptz) - Fecha de creación

  ### `purchase_history`
  - `id` (uuid, PK) - ID único de la compra
  - `user_id` (uuid, FK) - Propietario del registro
  - `customer_id` (uuid, FK) - ID del cliente
  - `products` (jsonb) - Productos comprados
  - `total` (numeric) - Total de la compra
  - `notes` (text) - Notas
  - `created_at` (timestamptz) - Fecha de compra

  ### `order_history`
  - `id` (uuid, PK) - ID único del pedido
  - `user_id` (uuid, FK) - Propietario del registro
  - `supplier_id` (uuid, FK) - ID del proveedor
  - `products` (jsonb) - Productos pedidos
  - `total` (numeric) - Total del pedido
  - `order_date` (timestamptz) - Fecha del pedido
  - `expected_delivery` (timestamptz) - Entrega esperada
  - `actual_delivery` (timestamptz) - Entrega real
  - `status` (text) - Estado del pedido
  - `notes` (text) - Notas
  - `created_at` (timestamptz) - Fecha de creación

  ## 2. Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas: Los usuarios solo pueden ver y modificar sus propios datos
  - Los datos están completamente aislados por usuario

  ## 3. Índices
  - Índices en campos de búsqueda frecuente
  - Índices en foreign keys para mejor rendimiento

  ## 4. Triggers
  - Actualización automática de `updated_at`
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  language text NOT NULL DEFAULT 'es' CHECK (language IN ('en', 'es')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  image text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'other',
  low_stock_threshold integer NOT NULL DEFAULT 5,
  notes text DEFAULT '',
  barcode text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  photo text DEFAULT '',
  address text DEFAULT '',
  total_debt numeric(10,2) DEFAULT 0,
  category text NOT NULL DEFAULT 'Regular' CHECK (category IN ('VIP', 'Regular', 'New', 'Inactive')),
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  preferences text DEFAULT '',
  notes text DEFAULT '',
  last_purchase timestamptz,
  total_purchases integer DEFAULT 0,
  follow_up_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text DEFAULT '',
  total_owed numeric(10,2) DEFAULT 0,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  contract_terms text DEFAULT '',
  payment_terms text DEFAULT '',
  delivery_schedule text DEFAULT '',
  notes text DEFAULT '',
  last_order timestamptz,
  total_orders integer DEFAULT 0,
  on_time_delivery integer DEFAULT 5 CHECK (on_time_delivery >= 1 AND on_time_delivery <= 5),
  quality_rating integer DEFAULT 5 CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating integer DEFAULT 5 CHECK (communication_rating >= 1 AND communication_rating <= 5),
  auto_reorder_enabled boolean DEFAULT false,
  reorder_threshold integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account_transactions table
CREATE TABLE IF NOT EXISTS account_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('receivable', 'payable')),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  customer_name text,
  supplier_name text,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  paid_amount numeric(10,2) NOT NULL DEFAULT 0,
  remaining_amount numeric(10,2) NOT NULL DEFAULT 0,
  due_date timestamptz NOT NULL,
  last_payment_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_terms text DEFAULT '',
  notes text DEFAULT '',
  invoice_number text DEFAULT '',
  reference text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES account_transactions(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'check', 'other')),
  reference text DEFAULT '',
  notes text DEFAULT '',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create purchase_history table
CREATE TABLE IF NOT EXISTS purchase_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create order_history table
CREATE TABLE IF NOT EXISTS order_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL,
  order_date timestamptz NOT NULL DEFAULT now(),
  expected_delivery timestamptz NOT NULL,
  actual_delivery timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_user_id ON account_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_customer_id ON account_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_supplier_id ON account_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_transaction_id ON payment_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_customer_id ON purchase_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_history_supplier_id ON order_history(supplier_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_account_transactions_updated_at BEFORE UPDATE ON account_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Suppliers policies
CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Account transactions policies
CREATE POLICY "Users can view own transactions"
  ON account_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON account_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON account_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON account_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Payment records policies
CREATE POLICY "Users can view own payment records"
  ON payment_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment records"
  ON payment_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Purchase history policies
CREATE POLICY "Users can view own purchase history"
  ON purchase_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase history"
  ON purchase_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order history policies
CREATE POLICY "Users can view own order history"
  ON order_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order history"
  ON order_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order history"
  ON order_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);