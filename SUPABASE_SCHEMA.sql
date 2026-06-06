-- ====================================================================
-- BIKINI BOTTOM GARAGE - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Created: 2026-06-06
-- Paste this script directly in your Supabase SQL Editor to initialize all 17 tables!
-- ====================================================================

BEGIN;

-- 1. TABEL: roles
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) NOT NULL,
  salary NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. TABEL: employees
CREATE TABLE IF NOT EXISTS employees (
  employee_id SERIAL PRIMARY KEY,
  role_id INT REFERENCES roles(role_id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  addrress TEXT, -- Penulisan 'addrress' demi kontinuitas database
  nik VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. TABEL: customers
CREATE TABLE IF NOT EXISTS customers (
  customers_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. TABEL: vehicle_categories
CREATE TABLE IF NOT EXISTS vehicle_categories (
  vehicle_category_id SERIAL PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. TABEL: vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(customers_id) ON DELETE CASCADE,
  vehicle_category_id INT REFERENCES vehicle_categories(vehicle_category_id) ON DELETE RESTRICT,
  plate_number VARCHAR(50) NOT NULL,
  engine_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. TABEL: spareparts
CREATE TABLE IF NOT EXISTS spareparts (
  sparepart_id SERIAL PRIMARY KEY,
  vehicle_category_id INT REFERENCES vehicle_categories(vehicle_category_id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 7. TABEL: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 8. TABEL: variants
CREATE TABLE IF NOT EXISTS variants (
  variant_id SERIAL PRIMARY KEY,
  sparepart_id INT REFERENCES spareparts(sparepart_id) ON DELETE CASCADE,
  supplier_id INT REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  buying_price NUMERIC(15, 2) DEFAULT 0,
  selling_price NUMERIC(15, 2) DEFAULT 0,
  stock INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 9. TABEL: services
CREATE TABLE IF NOT EXISTS services (
  service_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 10. TABEL: services_details
CREATE TABLE IF NOT EXISTS services_details (
  services_detail_id SERIAL PRIMARY KEY,
  services_id INT REFERENCES services(service_id) ON DELETE CASCADE,
  vehicle_category_id INT REFERENCES vehicle_categories(vehicle_category_id) ON DELETE RESTRICT,
  variant_id INT REFERENCES variants(variant_id) ON DELETE SET NULL,
  price NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 11. TABEL: work_orders
CREATE TABLE IF NOT EXISTS work_orders (
  work_order_id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(customers_id) ON DELETE RESTRICT,
  vehicle_id INT REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
  request TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 12. TABEL: main_receipts
CREATE TABLE IF NOT EXISTS main_receipts (
  receipt_number SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(customers_id) ON DELETE RESTRICT,
  vehicle_id INT REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
  employee_id INT REFERENCES employees(employee_id) ON DELETE RESTRICT,
  work_order_id INT REFERENCES work_orders(work_order_id) ON DELETE SET NULL,
  date DATE NOT NULL,
  sparepart_subtotal NUMERIC(15, 2) DEFAULT 0,
  services_subtotal NUMERIC(15, 2) DEFAULT 0,
  subtotal NUMERIC(15, 2) DEFAULT 0,
  discount NUMERIC(15, 2) DEFAULT 0,
  grandtotal NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 13. TABEL: detail_receipt_services
CREATE TABLE IF NOT EXISTS detail_receipt_services (
  receipt_services_id SERIAL PRIMARY KEY,
  receipt_number INT REFERENCES main_receipts(receipt_number) ON DELETE CASCADE,
  service_detail_id INT REFERENCES services_details(services_detail_id) ON DELETE RESTRICT,
  price NUMERIC(15, 2) DEFAULT 0
);

-- 14. TABEL: detail_receipt_spareparts
CREATE TABLE IF NOT EXISTS detail_receipt_spareparts (
  receipt_sparepart_id SERIAL PRIMARY KEY,
  receipt_number INT REFERENCES main_receipts(receipt_number) ON DELETE CASCADE,
  variant_id INT REFERENCES variants(variant_id) ON DELETE RESTRICT,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(15, 2) DEFAULT 0,
  subtotal NUMERIC(15, 2) DEFAULT 0
);

-- 15. TABEL: purchases
CREATE TABLE IF NOT EXISTS purchases (
  purchase_id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
  receipt_number VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,
  expected_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 16. TABEL: purchase_details
CREATE TABLE IF NOT EXISTS purchase_details (
  purchase_detail_id SERIAL PRIMARY KEY,
  purchase_id INT REFERENCES purchases(purchase_id) ON DELETE CASCADE,
  variant_id INT REFERENCES variants(variant_id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_price NUMERIC(15, 2) DEFAULT 0,
  subtotal NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 17. TABEL: stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
  movement_id SERIAL PRIMARY KEY,
  variant_id INT REFERENCES variants(variant_id) ON DELETE RESTRICT,
  movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  quantity INT NOT NULL,
  reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('RECEIPT', 'PURCHASE', 'MANUAL')),
  reference_id INT,
  movement_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index lists
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_variants_sparepart ON variants(sparepart_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);
CREATE INDEX IF NOT EXISTS idx_services_details_services ON services_details(services_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_main_receipts_customer ON main_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);

COMMIT;
