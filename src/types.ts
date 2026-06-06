export interface Role {
  role_id: number;
  role_name: string;
  salary: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Employee {
  employee_id: number;
  role_id: number;
  name: string;
  phone: string;
  addrress: string; // matches db spelling 'addrress'
  nik: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper field
  role_name?: string;
}

export interface Customer {
  customers_id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface VehicleCategory {
  vehicle_category_id: number;
  brand: string;
  model: string;
  year: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Vehicle {
  vehicle_id: number;
  customer_id: number;
  vehicle_category_id: number;
  plate_number: string;
  engine_number: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper fields
  customer_name?: string;
  category_name?: string; // e.g. "Honda Beat (2024)"
}

export interface Sparepart {
  sparepart_id: number;
  vehicle_category_id: number;
  name: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper fields
  category_name?: string;
}

export interface Supplier {
  supplier_id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Variant {
  variant_id: number;
  sparepart_id: number;
  supplier_id: number;
  name: string;
  sku: string;
  buying_price: number;
  selling_price: number;
  stock: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper fields
  sparepart_name?: string;
  supplier_name?: string;
}

export interface Service {
  service_id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface ServiceDetail {
  services_detail_id: number;
  services_id: number;
  vehicle_category_id: number;
  variant_id: number | null;
  price: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper fields
  service_name?: string;
  category_name?: string;
  variant_name?: string | null;
}

export interface WorkOrder {
  work_order_id: number;
  customer_id: number;
  vehicle_id: number;
  request: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper fields
  customer_name?: string;
  plate_number?: string;
  vehicle_model?: string;
}

export interface MainReceipt {
  receipt_number: number;
  customer_id: number;
  vehicle_id: number;
  employee_id: number;
  work_order_id: number | null;
  date: string;
  sparepart_subtotal: number;
  services_subtotal: number;
  subtotal: number;
  discount: number;
  grandtotal: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join helper fields
  customer_name?: string;
  plate_number?: string;
  employee_name?: string;
}

export interface DetailReceiptService {
  receipt_services_id: number;
  receipt_number: number;
  service_detail_id: number;
  price: number;
  // Join helpers
  service_name?: string;
}

export interface DetailReceiptSparepart {
  receipt_sparepart_id: number;
  receipt_number: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  // Join helpers
  variant_name?: string;
}

export interface Purchase {
  purchase_id: number;
  supplier_id: number;
  receipt_number: string;
  order_date: string;
  expected_date: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join help
  supplier_name?: string;
}

export interface PurchaseDetail {
  purchase_detail_id: number;
  purchase_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join help
  variant_name?: string;
}

export interface StockMovement {
  movement_id: number;
  variant_id: number;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  reference_type: 'RECEIPT' | 'PURCHASE' | 'MANUAL';
  reference_id: number;
  movement_date: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  // Join help
  variants_sku?: string;
  variant_name?: string;
}
