import React, { useState } from "react";
import { 
  Role, Employee, Customer, VehicleCategory, Vehicle, 
  Sparepart, Supplier, Variant, Service, ServiceDetail, 
  WorkOrder, MainReceipt, DetailReceiptService, 
  DetailReceiptSparepart, Purchase, PurchaseDetail, StockMovement 
} from "../types";
import { Database, FileCode2, Copy, Check, Download, AlertCircle, BookOpen, Layers, Terminal } from "lucide-react";

interface SupabaseExportProps {
  roles: Role[];
  employees: Employee[];
  customers: Customer[];
  categories: VehicleCategory[];
  vehicles: Vehicle[];
  spareparts: Sparepart[];
  suppliers: Supplier[];
  variants: Variant[];
  services: Service[];
  services_details: ServiceDetail[];
  work_orders: WorkOrder[];
  main_receipts: MainReceipt[];
  detail_receipt_services: DetailReceiptService[];
  detail_receipt_spareparts: DetailReceiptSparepart[];
  purchases: Purchase[];
  purchase_details: PurchaseDetail[];
  stock_movements: StockMovement[];
}

export default function SupabaseExport({
  roles,
  employees,
  customers,
  categories,
  vehicles,
  spareparts,
  suppliers,
  variants,
  services,
  services_details,
  work_orders,
  main_receipts,
  detail_receipt_services,
  detail_receipt_spareparts,
  purchases,
  purchase_details,
  stock_movements
}: SupabaseExportProps) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"ddl" | "seed" | "guide">("ddl");

  // SQL DDL Generator
  const getDdlSql = () => {
    return `-- ====================================================================
-- BIKINI BOTTOM GARAGE - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Tanggal Pembuatan: ${new Date().toLocaleDateString("id-ID")}
-- Salin dan jalankan script ini di "SQL Editor" pada Dashboard Supabase Anda.
-- ====================================================================

-- Jalankan di satu transaksi
BEGIN;

-- Hapus tabel jika sudah ada sebelumnya (opsional, untuk mencegah error replikasi)
-- DROP TABLE IF EXISTS stock_movements CASCADE;
-- DROP TABLE IF EXISTS purchase_details CASCADE;
-- DROP TABLE IF EXISTS purchases CASCADE;
-- DROP TABLE IF EXISTS detail_receipt_spareparts CASCADE;
-- DROP TABLE IF EXISTS detail_receipt_services CASCADE;
-- DROP TABLE IF EXISTS main_receipts CASCADE;
-- DROP TABLE IF EXISTS work_orders CASCADE;
-- DROP TABLE IF EXISTS services_details CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS variants CASCADE;
-- DROP TABLE IF EXISTS suppliers CASCADE;
-- DROP TABLE IF EXISTS spareparts CASCADE;
-- DROP TABLE IF EXISTS vehicles CASCADE;
-- DROP TABLE IF EXISTS vehicle_categories CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;

-- --------------------------------------------------------------------
-- 1. TABEL: roles
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) NOT NULL,
  salary NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 2. TABEL: employees
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 3. TABEL: customers
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 4. TABEL: vehicle_categories
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_categories (
  vehicle_category_id SERIAL PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 5. TABEL: vehicles
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 6. TABEL: spareparts
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spareparts (
  sparepart_id SERIAL PRIMARY KEY,
  vehicle_category_id INT REFERENCES vehicle_categories(vehicle_category_id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 7. TABEL: suppliers
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 8. TABEL: variants
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 9. TABEL: services
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  service_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 10. TABEL: services_details
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 11. TABEL: work_orders
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 12. TABEL: main_receipts
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 13. TABEL: detail_receipt_services
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detail_receipt_services (
  receipt_services_id SERIAL PRIMARY KEY,
  receipt_number INT REFERENCES main_receipts(receipt_number) ON DELETE CASCADE,
  service_detail_id INT REFERENCES services_details(services_detail_id) ON DELETE RESTRICT,
  price NUMERIC(15, 2) DEFAULT 0
);

-- --------------------------------------------------------------------
-- 14. TABEL: detail_receipt_spareparts
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detail_receipt_spareparts (
  receipt_sparepart_id SERIAL PRIMARY KEY,
  receipt_number INT REFERENCES main_receipts(receipt_number) ON DELETE CASCADE,
  variant_id INT REFERENCES variants(variant_id) ON DELETE RESTRICT,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(15, 2) DEFAULT 0,
  subtotal NUMERIC(15, 2) DEFAULT 0
);

-- --------------------------------------------------------------------
-- 15. TABEL: purchases
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 16. TABEL: purchase_details
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 17. TABEL: stock_movements
-- --------------------------------------------------------------------
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

-- Indeks Tambahan untuk Optimalisasi Query Transaksi & Inventaris
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_variants_sparepart ON variants(sparepart_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);
CREATE INDEX IF NOT EXISTS idx_services_details_services ON services_details(services_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_main_receipts_customer ON main_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);

COMMIT;
`;
  };

  // SQL Seed Generator - converts current system's live JSON data into raw SQL seed INSERT queries!
  const getSeedSql = () => {
    let sql = `-- ====================================================================
-- SEED DATA - BIKINI BOTTOM GARAGE LIVE DATASET
-- Ekspor data langsung dari database instans runtime aplikasi Anda.
-- ====================================================================

-- Mulai Transaksi Penaburan Data (Seeding)
BEGIN;

-- Matikan cek foreign key sementara agar bisa mengisi data tanpa konflik silsilah (opsional)
SET CONSTRAINTS ALL DEFERRED;

`;

    // 1. Roles
    if (roles.length > 0) {
      sql += `-- 1. SEEDING ROLES\n`;
      roles.forEach(r => {
        sql += `INSERT INTO roles (role_id, role_name, salary, created_at) VALUES (${r.role_id}, '${r.role_name.replace(/'/g, "''")}', ${r.salary}, ${r.created_at ? `'${r.created_at}'` : 'NOW()'}) ON CONFLICT (role_id) DO UPDATE SET role_name = EXCLUDED.role_name, salary = EXCLUDED.salary;\n`;
      });
      sql += `\n`;
    }

    // 2. Employees
    if (employees.length > 0) {
      sql += `-- 2. SEEDING EMPLOYEES\n`;
      employees.forEach(e => {
        sql += `INSERT INTO employees (employee_id, role_id, name, phone, addrress, nik, created_at) VALUES (${e.employee_id}, ${e.role_id}, '${e.name.replace(/'/g, "''")}', '${e.phone}', ${e.addrress ? `'${e.addrress.replace(/'/g, "''")}'` : 'NULL'}, ${e.nik ? `'${e.nik}'` : 'NULL'}, ${e.created_at ? `'${e.created_at}'` : 'NOW()'}) ON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, addrress = EXCLUDED.addrress;\n`;
      });
      sql += `\n`;
    }

    // 3. Customers
    if (customers.length > 0) {
      sql += `-- 3. SEEDING CUSTOMERS\n`;
      customers.forEach(c => {
        sql += `INSERT INTO customers (customers_id, name, phone, address, email, created_at) VALUES (${c.customers_id}, '${c.name.replace(/'/g, "''")}', '${c.phone}', ${c.address ? `'${c.address.replace(/'/g, "''")}'` : 'NULL'}, ${c.email ? `'${c.email.replace(/'/g, "''")}'` : 'NULL'}, ${c.created_at ? `'${c.created_at}'` : 'NOW()'}) ON CONFLICT (customers_id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address, email = EXCLUDED.email;\n`;
      });
      sql += `\n`;
    }

    // 4. Vehicle Categories
    if (categories.length > 0) {
      sql += `-- 4. SEEDING VEHICLE CATEGORIES\n`;
      categories.forEach(vc => {
        sql += `INSERT INTO vehicle_categories (vehicle_category_id, brand, model, year, created_at) VALUES (${vc.vehicle_category_id}, '${vc.brand.replace(/'/g, "''")}', '${vc.model.replace(/'/g, "''")}', ${vc.year}, ${vc.created_at ? `'${vc.created_at}'` : 'NOW()'}) ON CONFLICT (vehicle_category_id) DO UPDATE SET brand = EXCLUDED.brand, model = EXCLUDED.model;\n`;
      });
      sql += `\n`;
    }

    // 5. Vehicles
    if (vehicles.length > 0) {
      sql += `-- 5. SEEDING VEHICLES\n`;
      vehicles.forEach(v => {
        sql += `INSERT INTO vehicles (vehicle_id, customer_id, vehicle_category_id, plate_number, engine_number, created_at) VALUES (${v.vehicle_id}, ${v.customer_id}, ${v.vehicle_category_id}, '${v.plate_number}', ${v.engine_number ? `'${v.engine_number}'` : 'NULL'}, ${v.created_at ? `'${v.created_at}'` : 'NOW()'}) ON CONFLICT (vehicle_id) DO UPDATE SET plate_number = EXCLUDED.plate_number, engine_number = EXCLUDED.engine_number;\n`;
      });
      sql += `\n`;
    }

    // 6. Spareparts
    if (spareparts.length > 0) {
      sql += `-- 6. SEEDING SPAREPARTS\n`;
      spareparts.forEach(sp => {
        sql += `INSERT INTO spareparts (sparepart_id, vehicle_category_id, name, description, created_at) VALUES (${sp.sparepart_id}, ${sp.vehicle_category_id}, '${sp.name.replace(/'/g, "''")}', ${sp.description ? `'${sp.description.replace(/'/g, "''")}'` : 'NULL'}, ${sp.created_at ? `'${sp.created_at}'` : 'NOW()'}) ON CONFLICT (sparepart_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;\n`;
      });
      sql += `\n`;
    }

    // 7. Suppliers
    if (suppliers.length > 0) {
      sql += `-- 7. SEEDING SUPPLIERS\n`;
      suppliers.forEach(s => {
        sql += `INSERT INTO suppliers (supplier_id, name, phone, email, address, created_at) VALUES (${s.supplier_id}, '${s.name.replace(/'/g, "''")}', '${s.phone}', ${s.email ? `'${s.email.replace(/'/g, "''")}'` : 'NULL'}, ${s.address ? `'${s.address.replace(/'/g, "''")}'` : 'NULL'}, ${s.created_at ? `'${s.created_at}'` : 'NOW()'}) ON CONFLICT (supplier_id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, email = EXCLUDED.email, address = EXCLUDED.address;\n`;
      });
      sql += `\n`;
    }

    // 8. Variants
    if (variants.length > 0) {
      sql += `-- 8. SEEDING VARIANTS\n`;
      variants.forEach(vr => {
        sql += `INSERT INTO variants (variant_id, sparepart_id, supplier_id, name, sku, buying_price, selling_price, stock, created_at) VALUES (${vr.variant_id}, ${vr.sparepart_id}, ${vr.supplier_id}, '${vr.name.replace(/'/g, "''")}', '${vr.sku}', ${vr.buying_price}, ${vr.selling_price}, ${vr.stock}, ${vr.created_at ? `'${vr.created_at}'` : 'NOW()'}) ON CONFLICT (variant_id) DO UPDATE SET name = EXCLUDED.name, sku = EXCLUDED.sku, stock = EXCLUDED.stock, selling_price = EXCLUDED.selling_price;\n`;
      });
      sql += `\n`;
    }

    // 9. Services
    if (services.length > 0) {
      sql += `-- 9. SEEDING SERVICES\n`;
      services.forEach(se => {
        sql += `INSERT INTO services (service_id, name, created_at) VALUES (${se.service_id}, '${se.name.replace(/'/g, "''")}', ${se.created_at ? `'${se.created_at}'` : 'NOW()'}) ON CONFLICT (service_id) DO UPDATE SET name = EXCLUDED.name;\n`;
      });
      sql += `\n`;
    }

    // 10. Services Details
    if (services_details.length > 0) {
      sql += `-- 10. SEEDING SERVICES DETAILS\n`;
      services_details.forEach(sd => {
        sql += `INSERT INTO services_details (services_detail_id, services_id, vehicle_category_id, variant_id, price, created_at) VALUES (${sd.services_detail_id}, ${sd.services_id}, ${sd.vehicle_category_id}, ${sd.variant_id ? sd.variant_id : 'NULL'}, ${sd.price}, ${sd.created_at ? `'${sd.created_at}'` : 'NOW()'}) ON CONFLICT (services_detail_id) DO UPDATE SET price = EXCLUDED.price;\n`;
      });
      sql += `\n`;
    }

    // Reset sequence generators so SERIAL integers work correctly on next inserts
    sql += `-- 11. RESET SEQUENCE GENERATORS (To match max values)\n`;
    sql += `SELECT setval('roles_role_id_seq', COALESCE((SELECT MAX(role_id) FROM roles), 1));\n`;
    sql += `SELECT setval('employees_employee_id_seq', COALESCE((SELECT MAX(employee_id) FROM employees), 1));\n`;
    sql += `SELECT setval('customers_customers_id_seq', COALESCE((SELECT MAX(customers_id) FROM customers), 1));\n`;
    sql += `SELECT setval('vehicle_categories_vehicle_category_id_seq', COALESCE((SELECT MAX(vehicle_category_id) FROM vehicle_categories), 1));\n`;
    sql += `SELECT setval('vehicles_vehicle_id_seq', COALESCE((SELECT MAX(vehicle_id) FROM vehicles), 1));\n`;
    sql += `SELECT setval('spareparts_sparepart_id_seq', COALESCE((SELECT MAX(sparepart_id) FROM spareparts), 1));\n`;
    sql += `SELECT setval('suppliers_supplier_id_seq', COALESCE((SELECT MAX(supplier_id) FROM suppliers), 1));\n`;
    sql += `SELECT setval('variants_variant_id_seq', COALESCE((SELECT MAX(variant_id) FROM variants), 1));\n`;
    sql += `SELECT setval('services_service_id_seq', COALESCE((SELECT MAX(service_id) FROM services), 1));\n`;
    sql += `SELECT setval('services_details_services_detail_id_seq', COALESCE((SELECT MAX(services_detail_id) FROM services_details), 1));\n`;

    sql += `\nCOMMIT;\n`;
    return sql;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSqlFile = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-teal-550 text-white p-3 rounded-2xl shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-800">Koneksi Ekspor Supabase</h2>
            <p className="text-slate-500 text-sm mt-1">Sediakan dan sinkronkan keseluruhan database motor bengkel Anda ke instance cloud server Supabase.</p>
          </div>
        </div>
      </div>

      {/* Selector Subtabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("ddl")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "ddl"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Script DDL Schema (.SQL)
        </button>
        <button
          onClick={() => setActiveSubTab("seed")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "seed"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Terminal className="w-4 h-4" />
          Script Seed Data Aktif
        </button>
        <button
          onClick={() => setActiveSubTab("guide")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "guide"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Panduan Setup Supabase
        </button>
      </div>

      {/* Main Content Area */}
      {activeSubTab === "ddl" && (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold">Info Integrasi PostgreSQL / Supabase:</p>
              <p>Script ini melambangkan skema relasional 17 tabel lengkap Bikini Bottom Garage. Jalankan script ini langsung di panel SQL Editor Supabase untuk membangun struktur relasi yang aman, rapi, dan cepat.</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
            {/* Header copy buttons */}
            <div className="bg-slate-950 px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono font-bold text-teal-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block animate-pulse"></span>
                supabase_schema_tables.sql
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy(getDdlSql())}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 text-slate-350 cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin!" : "Salin SQL"}
                </button>
                <button 
                  onClick={() => downloadSqlFile("supabase_schema.sql", getDdlSql())}
                  className="flex items-center gap-1 bg-teal-650 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh .SQL
                </button>
              </div>
            </div>

            {/* Code viewport */}
            <div className="p-5 overflow-auto max-h-[480px] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre bg-slate-900/90 [scrollbar-width:thin]">
              {getDdlSql()}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "seed" && (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3.5">
            <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed space-y-1">
              <p className="font-bold">Pembuat Seed Data Dinamis (DML):</p>
              <p>Aplikasi mengonversi entitas aktif Anda di workspace local saat ini (seperti <strong>{roles.length}</strong> Peran/Role, <strong>{employees.length}</strong> Karyawan, <strong>{customers.length}</strong> Pelanggan, <strong>{suppliers.length}</strong> Supplier, dsb) secara dinamis menjadi data baris SQL INSERT agar instance Supabase Anda terisi persis seperti data lokal Anda!</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
            <div className="bg-slate-950 px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                supabase_seed_active_data.sql
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy(getSeedSql())}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 hover:text-white px-3 py-1.5 rounded-lg border border-white/5 text-slate-350 cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin!" : "Salin Seed"}
                </button>
                <button 
                  onClick={() => downloadSqlFile("supabase_seed.sql", getSeedSql())}
                  className="flex items-center gap-1 bg-teal-650 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh .SQL
                </button>
              </div>
            </div>

            <div className="p-5 overflow-auto max-h-[480px] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre bg-slate-900/90 [scrollbar-width:thin]">
              {getSeedSql()}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "guide" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2.5 text-base">
              <span className="bg-teal-50 text-teal-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm">1</span>
              Membuat Proyek di Supabase
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Daftar / Masuk ke akun <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-600 font-semibold underline">Supabase</a> dan buat proyek database baru (New Project). Atur nama proyek menjadi <strong>Bikini Bottom Garage</strong> dan setel password database yang tangguh.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2.5 text-base">
              <span className="bg-teal-50 text-teal-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm">2</span>
              Inisialisasi Tabel Melalui SQL Editor
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Di sidebar dashboard Supabase Anda, masuklah ke tab <strong>"SQL Editor"</strong>, klik <strong>"New Query"</strong>, rekatkan seluruh kode dari tab <em>"Script DDL Schema (.SQL)"</em> di atas, dan klik tombol <strong>"Run"</strong> untuk menyematkan relasi tabel secara instan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2.5 text-base">
              <span className="bg-teal-50 text-teal-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm">3</span>
              Penyemaian Data Awal (Optional Seeding)
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Setelah tabel-tabel utama terbentuk, Anda juga bisa menyalin script dari tab <em>"Script Seed Data Aktif"</em> dan menjalankannya di SQL Editor untuk menaruh seluruh data mekanik, roles, kategori, dan pelanggan aktif ke cloud seketika.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2.5 text-base">
              <span className="bg-teal-50 text-teal-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm">4</span>
              Konfigurasi RLS & Hak Akses
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Supabase secara default mengaktifkan RLS (Row Level Security) untuk perlindungan data. Jika Anda ingin data dapat dibaca/ditulis langsung via REST API/SDK client-side, Anda bisa mengatur kebijakan akses (Enable RLS policies) langsung di menu <strong>"Table Editor"</strong>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
