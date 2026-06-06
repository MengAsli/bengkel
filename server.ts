import express from "express";
import * as path from "path";
import * as fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.resolve("src/db/data_store.json");

// Read helper
function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Re-create if missing
      const initial = {
        roles: [],
        employees: [],
        customers: [],
        vehicle_categories: [],
        vehicles: [],
        spareparts: [],
        suppliers: [],
        variants: [],
        services: [],
        services_details: [],
        work_orders: [],
        main_receipts: [],
        detail_receipt_services: [],
        detail_receipt_spareparts: [],
        purchases: [],
        purchase_details: [],
        stock_movements: []
      };
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading db", error);
    return {};
  }
}

// Write helper
function writeDb(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db", error);
  }
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Dashboard analytics
app.get("/api/dashboard", (req, res) => {
  const db = readDb();
  
  // Total target counts
  const totalCustomers = db.customers.length;
  const totalVehicles = db.vehicles.length;
  const activeWorkOrdersCount = db.work_orders.filter((wo: any) => wo.status === "PENDING" || wo.status === "IN_PROGRESS").length;
  const lowStockCount = db.variants.filter((v: any) => v.stock < 5).length;
  
  // Financial calculation (Total income from main receipts)
  const totalRevenue = db.main_receipts.reduce((acc: number, r: any) => acc + (r.grandtotal || 0), 0);
  
  // Monthly revenue breakdown & transaction density for charts
  const monthlyRevenue: Record<string, number> = {};
  db.main_receipts.forEach((r: any) => {
    // extract Month-Year (YYYY-MM)
    if (r.date) {
      const month = r.date.substring(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (r.grandtotal || 0);
    }
  });

  // Recent 5 work orders
  const recentWorkOrders = db.work_orders.slice(-5).reverse().map((wo: any) => {
    const cust = db.customers.find((c: any) => c.customers_id === wo.customer_id);
    const veh = db.vehicles.find((v: any) => v.vehicle_id === wo.vehicle_id);
    return {
      ...wo,
      customer_name: cust ? cust.name : "Unknown",
      plate_number: veh ? veh.plate_number : "Unknown"
    };
  });

  // Recent 5 receipts
  const recentReceipts = db.main_receipts.slice(-5).reverse().map((r: any) => {
    const cust = db.customers.find((c: any) => c.customers_id === r.customer_id);
    return {
      ...r,
      customer_name: cust ? cust.name : "Unknown"
    };
  });

  // Hot Selling Spareparts
  const sparepartSales: Record<number, number> = {};
  db.detail_receipt_spareparts.forEach((dsp: any) => {
    sparepartSales[dsp.variant_id] = (sparepartSales[dsp.variant_id] || 0) + dsp.quantity;
  });

  const hotParts = Object.entries(sparepartSales)
    .map(([vid, qty]) => {
      const variant = db.variants.find((v: any) => v.variant_id === parseInt(vid));
      return {
        variant_id: parseInt(vid),
        name: variant ? variant.name : "Suku Cadang Lain",
        quantity: qty,
        revenue: qty * (variant ? variant.selling_price : 0)
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  res.json({
    totalCustomers,
    totalVehicles,
    activeWorkOrdersCount,
    lowStockCount,
    totalRevenue,
    recentWorkOrders,
    recentReceipts,
    hotParts,
    monthlyRevenue
  });
});

// Roles & Salary configuration
app.get("/api/roles", (req, res) => {
  const db = readDb();
  res.json(db.roles || []);
});

// Customers CRUD
app.get("/api/customers", (req, res) => {
  const db = readDb();
  res.json(db.customers.filter((c: any) => !c.deleted_at));
});

app.post("/api/customers", (req, res) => {
  const db = readDb();
  const nextId = db.customers.length > 0 ? Math.max(...db.customers.map((c: any) => c.customers_id)) + 1 : 1;
  const newCustomer = {
    customers_id: nextId,
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    email: req.body.email || "",
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.customers.push(newCustomer);
  writeDb(db);
  res.status(201).json(newCustomer);
});

app.put("/api/customers/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.customers.findIndex((c: any) => c.customers_id === id);
  if (index !== -1) {
    db.customers[index] = {
      ...db.customers[index],
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.customers[index]);
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.customers.findIndex((c: any) => c.customers_id === id);
  if (index !== -1) {
    db.customers[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});

// Vehicle Categories list
app.get("/api/vehicle-categories", (req, res) => {
  const db = readDb();
  res.json(db.vehicle_categories || []);
});

app.post("/api/vehicle-categories", (req, res) => {
  const db = readDb();
  const nextId = db.vehicle_categories.length > 0 ? Math.max(...db.vehicle_categories.map((c: any) => c.vehicle_category_id)) + 1 : 1;
  const newCat = {
    vehicle_category_id: nextId,
    brand: req.body.brand,
    model: req.body.model,
    year: parseInt(req.body.year) || 2024,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.vehicle_categories.push(newCat);
  writeDb(db);
  res.status(201).json(newCat);
});

// Vehicles CRUD
app.get("/api/vehicles", (req, res) => {
  const db = readDb();
  const list = db.vehicles.filter((v: any) => !v.deleted_at).map((v: any) => {
    const cust = db.customers.find((c: any) => c.customers_id === v.customer_id);
    const cat = db.vehicle_categories.find((c: any) => c.vehicle_category_id === v.vehicle_category_id);
    return {
      ...v,
      customer_name: cust ? cust.name : "Kustomer Tidak Dikenal",
      category_name: cat ? `${cat.brand} ${cat.model} (${cat.year})` : "Kategori Tidak Ditemukan"
    };
  });
  res.json(list);
});

app.post("/api/vehicles", (req, res) => {
  const db = readDb();
  const nextId = db.vehicles.length > 0 ? Math.max(...db.vehicles.map((v: any) => v.vehicle_id)) + 1 : 1;
  const newVehicle = {
    vehicle_id: nextId,
    customer_id: parseInt(req.body.customer_id),
    vehicle_category_id: parseInt(req.body.vehicle_category_id),
    plate_number: req.body.plate_number.toUpperCase(),
    engine_number: req.body.engine_number || "",
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.vehicles.push(newVehicle);
  writeDb(db);
  res.status(201).json(newVehicle);
});

app.put("/api/vehicles/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.vehicles.findIndex((v: any) => v.vehicle_id === id);
  if (index !== -1) {
    db.vehicles[index] = {
      ...db.vehicles[index],
      customer_id: parseInt(req.body.customer_id),
      vehicle_category_id: parseInt(req.body.vehicle_category_id),
      plate_number: req.body.plate_number.toUpperCase(),
      engine_number: req.body.engine_number,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.vehicles[index]);
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

app.delete("/api/vehicles/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.vehicles.findIndex((v: any) => v.vehicle_id === id);
  if (index !== -1) {
    db.vehicles[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

// Employees CRUD
app.get("/api/employees", (req, res) => {
  const db = readDb();
  const list = db.employees.filter((e: any) => !e.deleted_at).map((e: any) => {
    const role = db.roles.find((r: any) => r.role_id === e.role_id);
    return {
      ...e,
      role_name: role ? role.role_name : "Tidak ada role"
    };
  });
  res.json(list);
});

app.post("/api/employees", (req, res) => {
  const db = readDb();
  const nextId = db.employees.length > 0 ? Math.max(...db.employees.map((e: any) => e.employee_id)) + 1 : 1;
  const newEmp = {
    employee_id: nextId,
    role_id: parseInt(req.body.role_id),
    name: req.body.name,
    phone: req.body.phone,
    addrress: req.body.addrress || req.body.address || "",
    nik: req.body.nik,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.employees.push(newEmp);
  writeDb(db);
  res.status(201).json(newEmp);
});

app.put("/api/employees/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.employees.findIndex((e: any) => e.employee_id === id);
  if (index !== -1) {
    db.employees[index] = {
      ...db.employees[index],
      role_id: parseInt(req.body.role_id),
      name: req.body.name,
      phone: req.body.phone,
      addrress: req.body.addrress || req.body.address || "",
      nik: req.body.nik,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.employees[index]);
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

app.delete("/api/employees/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.employees.findIndex((e: any) => e.employee_id === id);
  if (index !== -1) {
    db.employees[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

// Suppliers CRUD
app.get("/api/suppliers", (req, res) => {
  const db = readDb();
  res.json(db.suppliers.filter((s: any) => !s.deleted_at));
});

app.post("/api/suppliers", (req, res) => {
  const db = readDb();
  const nextId = db.suppliers.length > 0 ? Math.max(...db.suppliers.map((s: any) => s.supplier_id)) + 1 : 1;
  const newSup = {
    supplier_id: nextId,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || "",
    address: req.body.address,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.suppliers.push(newSup);
  writeDb(db);
  res.status(201).json(newSup);
});

app.put("/api/suppliers/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.suppliers.findIndex((s: any) => s.supplier_id === id);
  if (index !== -1) {
    db.suppliers[index] = {
      ...db.suppliers[index],
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.suppliers[index]);
  } else {
    res.status(404).json({ error: "Supplier not found" });
  }
});

app.delete("/api/suppliers/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.suppliers.findIndex((s: any) => s.supplier_id === id);
  if (index !== -1) {
    db.suppliers[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Supplier not found" });
  }
});

// Spareparts CRUD
app.get("/api/spareparts", (req, res) => {
  const db = readDb();
  const list = db.spareparts.filter((sp: any) => !sp.deleted_at).map((sp: any) => {
    const cat = db.vehicle_categories.find((c: any) => c.vehicle_category_id === sp.vehicle_category_id);
    return {
      ...sp,
      category_name: cat ? `${cat.brand} ${cat.model} (${cat.year})` : "Kategori Sesuai"
    };
  });
  res.json(list);
});

app.post("/api/spareparts", (req, res) => {
  const db = readDb();
  const nextId = db.spareparts.length > 0 ? Math.max(...db.spareparts.map((s: any) => s.sparepart_id)) + 1 : 1;
  const newPart = {
    sparepart_id: nextId,
    vehicle_category_id: parseInt(req.body.vehicle_category_id),
    name: req.body.name,
    description: req.body.description || "",
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.spareparts.push(newPart);
  writeDb(db);
  res.status(201).json(newPart);
});

app.put("/api/spareparts/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.spareparts.findIndex((s: any) => s.sparepart_id === id);
  if (index !== -1) {
    db.spareparts[index] = {
      ...db.spareparts[index],
      vehicle_category_id: parseInt(req.body.vehicle_category_id),
      name: req.body.name,
      description: req.body.description,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.spareparts[index]);
  } else {
    res.status(404).json({ error: "Sparepart not found" });
  }
});

app.delete("/api/spareparts/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.spareparts.findIndex((s: any) => s.sparepart_id === id);
  if (index !== -1) {
    db.spareparts[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Sparepart not found" });
  }
});

// Variants CRUD (Specific Suku cadang items)
app.get("/api/variants", (req, res) => {
  const db = readDb();
  const list = db.variants.filter((v: any) => !v.deleted_at).map((v: any) => {
    const parentPart = db.spareparts.find((s: any) => s.sparepart_id === v.sparepart_id);
    const supplier = db.suppliers.find((s: any) => s.supplier_id === v.supplier_id);
    return {
      ...v,
      sparepart_name: parentPart ? parentPart.name : "Induk Suku Cadang Hilang",
      supplier_name: supplier ? supplier.name : "Supplier Hilang"
    };
  });
  res.json(list);
});

app.post("/api/variants", (req, res) => {
  const db = readDb();
  const nextId = db.variants.length > 0 ? Math.max(...db.variants.map((v: any) => v.variant_id)) + 1 : 1;
  const newVar = {
    variant_id: nextId,
    sparepart_id: parseInt(req.body.sparepart_id),
    supplier_id: parseInt(req.body.supplier_id),
    name: req.body.name,
    sku: req.body.sku,
    buying_price: parseFloat(req.body.buying_price),
    selling_price: parseFloat(req.body.selling_price),
    stock: parseInt(req.body.stock) || 0,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.variants.push(newVar);
  writeDb(db);
  res.status(201).json(newVar);
});

app.put("/api/variants/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.variants.findIndex((v: any) => v.variant_id === id);
  if (index !== -1) {
    db.variants[index] = {
      ...db.variants[index],
      sparepart_id: parseInt(req.body.sparepart_id),
      supplier_id: parseInt(req.body.supplier_id),
      name: req.body.name,
      sku: req.body.sku,
      buying_price: parseFloat(req.body.buying_price),
      selling_price: parseFloat(req.body.selling_price),
      stock: parseInt(req.body.stock),
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.variants[index]);
  } else {
    res.status(404).json({ error: "Variant not found" });
  }
});

app.delete("/api/variants/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.variants.findIndex((v: any) => v.variant_id === id);
  if (index !== -1) {
    db.variants[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Variant not found" });
  }
});

// Services CRUD
app.get("/api/services", (req, res) => {
  const db = readDb();
  res.json(db.services.filter((s: any) => !s.deleted_at));
});

app.post("/api/services", (req, res) => {
  const db = readDb();
  const nextId = db.services.length > 0 ? Math.max(...db.services.map((s: any) => s.service_id)) + 1 : 1;
  const newService = {
    service_id: nextId,
    name: req.body.name,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.services.push(newService);
  writeDb(db);
  res.status(201).json(newService);
});

app.put("/api/services/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.services.findIndex((s: any) => s.service_id === id);
  if (index !== -1) {
    db.services[index] = {
      ...db.services[index],
      name: req.body.name,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.services[index]);
  } else {
    res.status(404).json({ error: "Service not found" });
  }
});

app.delete("/api/services/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.services.findIndex((s: any) => s.service_id === id);
  if (index !== -1) {
    db.services[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Service not found" });
  }
});

// Services Details CRUD (Mapping service to vehicle models or variants and establishing prices)
app.get("/api/services-details", (req, res) => {
  const db = readDb();
  const list = db.services_details.filter((sd: any) => !sd.deleted_at).map((sd: any) => {
    const parent = db.services.find((s: any) => s.service_id === sd.services_id);
    const cat = db.vehicle_categories.find((c: any) => c.vehicle_category_id === sd.vehicle_category_id);
    const varItem = sd.variant_id ? db.variants.find((v: any) => v.variant_id === sd.variant_id) : null;
    return {
      ...sd,
      service_name: parent ? parent.name : "Servis Utama Hilang",
      category_name: cat ? `${cat.brand} ${cat.model} (${cat.year})` : "General",
      variant_name: varItem ? varItem.name : null
    };
  });
  res.json(list);
});

app.post("/api/services-details", (req, res) => {
  const db = readDb();
  const nextId = db.services_details.length > 0 ? Math.max(...db.services_details.map((s: any) => s.services_detail_id)) + 1 : 1;
  const newDetail = {
    services_detail_id: nextId,
    services_id: parseInt(req.body.services_id),
    vehicle_category_id: parseInt(req.body.vehicle_category_id),
    variant_id: req.body.variant_id ? parseInt(req.body.variant_id) : null,
    price: parseFloat(req.body.price),
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.services_details.push(newDetail);
  writeDb(db);
  res.status(201).json(newDetail);
});

app.put("/api/services-details/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.services_details.findIndex((s: any) => s.services_detail_id === id);
  if (index !== -1) {
    db.services_details[index] = {
      ...db.services_details[index],
      services_id: parseInt(req.body.services_id),
      vehicle_category_id: parseInt(req.body.vehicle_category_id),
      variant_id: req.body.variant_id ? parseInt(req.body.variant_id) : null,
      price: parseFloat(req.body.price),
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.services_details[index]);
  } else {
    res.status(404).json({ error: "Service Details mapping not found" });
  }
});

app.delete("/api/services-details/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.services_details.findIndex((s: any) => s.services_detail_id === id);
  if (index !== -1) {
    db.services_details[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Service Details not found" });
  }
});

// Work Orders CRUD
app.get("/api/work-orders", (req, res) => {
  const db = readDb();
  const list = db.work_orders.filter((wo: any) => !wo.deleted_at).map((wo: any) => {
    const cust = db.customers.find((c: any) => c.customers_id === wo.customer_id);
    const veh = db.vehicles.find((v: any) => v.vehicle_id === wo.vehicle_id);
    return {
      ...wo,
      customer_name: cust ? cust.name : "Kustomer Hilang",
      plate_number: veh ? veh.plate_number : "Tidak ada plat",
      vehicle_model: veh ? `${db.vehicle_categories.find((c: any) => c.vehicle_category_id === veh.vehicle_category_id)?.brand || ""} ${db.vehicle_categories.find((c: any) => c.vehicle_category_id === veh.vehicle_category_id)?.model || ""}` : "Motor Hilang"
    };
  });
  res.json(list);
});

app.post("/api/work-orders", (req, res) => {
  const db = readDb();
  const nextId = db.work_orders.length > 0 ? Math.max(...db.work_orders.map((wo: any) => wo.work_order_id)) + 1 : 1;
  const newWO = {
    work_order_id: nextId,
    customer_id: parseInt(req.body.customer_id),
    vehicle_id: parseInt(req.body.vehicle_id),
    request: req.body.request,
    status: req.body.status || "PENDING",
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };
  db.work_orders.push(newWO);
  writeDb(db);
  res.status(201).json(newWO);
});

app.put("/api/work-orders/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.work_orders.findIndex((wo: any) => wo.work_order_id === id);
  if (index !== -1) {
    db.work_orders[index] = {
      ...db.work_orders[index],
      customer_id: parseInt(req.body.customer_id),
      vehicle_id: parseInt(req.body.vehicle_id),
      request: req.body.request,
      status: req.body.status,
      updated_at: new Date().toISOString()
    };
    writeDb(db);
    res.json(db.work_orders[index]);
  } else {
    res.status(404).json({ error: "Work order not found" });
  }
});

app.delete("/api/work-orders/:id", (req, res) => {
  const db = readDb();
  const id = parseInt(req.params.id);
  const index = db.work_orders.findIndex((wo: any) => wo.work_order_id === id);
  if (index !== -1) {
    db.work_orders[index].deleted_at = new Date().toISOString();
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Work order not found" });
  }
});

// Receipts API - Generate transactions & decrease stocks and journal movements automatically
app.get("/api/receipts", (req, res) => {
  const db = readDb();
  const receipts = db.main_receipts.map((r: any) => {
    const cust = db.customers.find((c: any) => c.customers_id === r.customer_id);
    const mech = db.employees.find((e: any) => e.employee_id === r.employee_id);
    const veh = db.vehicles.find((v: any) => v.vehicle_id === r.vehicle_id);
    return {
      ...r,
      customer_name: cust ? cust.name : "General",
      plate_number: veh ? veh.plate_number : "Neutral",
      employee_name: mech ? mech.name : "Kasir"
    };
  });
  res.json(receipts);
});

// GET specific receipt details
app.get("/api/receipts/:id", (req, res) => {
  const db = readDb();
  const rNum = parseInt(req.params.id);
  const receipt = db.main_receipts.find((r: any) => r.receipt_number === rNum);
  if (!receipt) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  const cust = db.customers.find((c: any) => c.customers_id === receipt.customer_id);
  const mech = db.employees.find((e: any) => e.employee_id === receipt.employee_id);
  const veh = db.vehicles.find((v: any) => v.vehicle_id === receipt.vehicle_id);

  // Filter linked services and spareparts details
  const serviceDetails = db.detail_receipt_services.filter((ds: any) => ds.receipt_number === rNum).map((ds: any) => {
    const sDetail = db.services_details.find((sd: any) => sd.services_detail_id === ds.service_detail_id);
    const sName = sDetail ? db.services.find((s: any) => s.service_id === sDetail.services_id)?.name : "Servis Utama";
    return {
      ...ds,
      service_name: sName
    };
  });

  const sparepartDetails = db.detail_receipt_spareparts.filter((dsp: any) => dsp.receipt_number === rNum).map((dsp: any) => {
    const variant = db.variants.find((v: any) => v.variant_id === dsp.variant_id);
    return {
      ...dsp,
      variant_name: variant ? variant.name : "Suku Cadang"
    };
  });

  res.json({
    ...receipt,
    customer_name: cust ? cust.name : "Kustomer Umum",
    customer_phone: cust ? cust.phone : "-",
    plate_number: veh ? veh.plate_number : "-",
    employee_name: mech ? mech.name : "-",
    services: serviceDetails,
    spareparts: sparepartDetails
  });
});

// CREATE dynamic receipt with real physical side effects
app.post("/api/receipts", (req, res) => {
  const db = readDb();
  
  // Decide next receipt number
  const nextNumber = db.main_receipts.length > 0 
    ? Math.max(...db.main_receipts.map((r: any) => r.receipt_number)) + 1 
    : 1001;
  const dateStr = req.body.date || new Date().toISOString().split('T')[0];

  const receipt = {
    receipt_number: nextNumber,
    customer_id: parseInt(req.body.customer_id),
    vehicle_id: parseInt(req.body.vehicle_id),
    employee_id: parseInt(req.body.employee_id),
    work_order_id: req.body.work_order_id ? parseInt(req.body.work_order_id) : null,
    date: dateStr,
    sparepart_subtotal: parseFloat(req.body.sparepart_subtotal) || 0,
    services_subtotal: parseFloat(req.body.services_subtotal) || 0,
    subtotal: parseFloat(req.body.subtotal) || 0,
    discount: parseFloat(req.body.discount) || 0,
    grandtotal: parseFloat(req.body.grandtotal) || 0,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };

  // Add services detailing
  const servicesList = req.body.services || [];
  servicesList.forEach((s: any) => {
    const nextServiceId = db.detail_receipt_services.length > 0 
      ? Math.max(...db.detail_receipt_services.map((ds: any) => ds.receipt_services_id)) + 1 
      : 1;
    db.detail_receipt_services.push({
      receipt_services_id: nextServiceId,
      receipt_number: nextNumber,
      service_detail_id: parseInt(s.service_detail_id),
      price: parseFloat(s.price)
    });
  });

  // Add sparepart detailing and auto-decrement stocks and log STOCK MOVEMENT 'OUT'
  const sparepartsList = req.body.spareparts || [];
  sparepartsList.forEach((sp: any) => {
    const nextSparepartId = db.detail_receipt_spareparts.length > 0 
      ? Math.max(...db.detail_receipt_spareparts.map((dsp: any) => dsp.receipt_sparepart_id)) + 1 
      : 1;

    db.detail_receipt_spareparts.push({
      receipt_sparepart_id: nextSparepartId,
      receipt_number: nextNumber,
      variant_id: parseInt(sp.variant_id),
      quantity: parseInt(sp.quantity),
      unit_price: parseFloat(sp.unit_price),
      subtotal: parseFloat(sp.subtotal)
    });

    // Stock decrement
    const vIndex = db.variants.findIndex((v: any) => v.variant_id === parseInt(sp.variant_id));
    if (vIndex !== -1) {
      db.variants[vIndex].stock = Math.max(0, db.variants[vIndex].stock - parseInt(sp.quantity));
    }

    // Journal stock entry
    const nextMovId = db.stock_movements.length > 0 
      ? Math.max(...db.stock_movements.map((sm: any) => sm.movement_id)) + 1 
      : 1;
    db.stock_movements.push({
      movement_id: nextMovId,
      variant_id: parseInt(sp.variant_id),
      movement_type: "OUT",
      quantity: parseInt(sp.quantity),
      reference_type: "RECEIPT",
      reference_id: nextNumber,
      movement_date: dateStr,
      description: `Penjualan melalui receipt ${nextNumber}`,
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: null
    });
  });

  // If work order was completed, mark that Work Order as DONE
  if (req.body.work_order_id) {
    const woIndex = db.work_orders.findIndex((w: any) => w.work_order_id === parseInt(req.body.work_order_id));
    if (woIndex !== -1) {
      db.work_orders[woIndex].status = "DONE";
      db.work_orders[woIndex].updated_at = new Date().toISOString();
    }
  }

  db.main_receipts.push(receipt);
  writeDb(db);
  res.status(201).json(receipt);
});

// Purchases (Supplier orders)
app.get("/api/purchases", (req, res) => {
  const db = readDb();
  const list = db.purchases.map((p: any) => {
    const sup = db.suppliers.find((s: any) => s.supplier_id === p.supplier_id);
    return {
      ...p,
      supplier_name: sup ? sup.name : "Supplier Umum"
    };
  });
  res.json(list);
});

app.post("/api/purchases", (req, res) => {
  const db = readDb();
  const nextId = db.purchases.length > 0 ? Math.max(...db.purchases.map((p: any) => p.purchase_id)) + 1 : 1;
  const newPurchase = {
    purchase_id: nextId,
    supplier_id: parseInt(req.body.supplier_id),
    receipt_number: req.body.receipt_number || `PO-${nextId}-${new Date().getFullYear()}`,
    order_date: req.body.order_date || new Date().toISOString().split('T')[0],
    expected_date: req.body.expected_date || "",
    status: req.body.status || "PENDING",
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null
  };

  const items = req.body.items || [];
  items.forEach((item: any) => {
    const nextDetailId = db.purchase_details.length > 0 ? Math.max(...db.purchase_details.map((pd: any) => pd.purchase_detail_id)) + 1 : 1;
    db.purchase_details.push({
      purchase_detail_id: nextDetailId,
      purchase_id: nextId,
      variant_id: parseInt(item.variant_id),
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.unit_price),
      subtotal: parseInt(item.quantity) * parseFloat(item.unit_price),
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: null
    });
  });

  db.purchases.push(newPurchase);
  writeDb(db);
  res.status(201).json(newPurchase);
});

// Receive purchase order - triggers real physical inventory increment & log MOVEMENT 'IN'
app.put("/api/purchases/:id/status", (req, res) => {
  const db = readDb();
  const purchaseId = parseInt(req.params.id);
  const pIndex = db.purchases.findIndex((p: any) => p.purchase_id === purchaseId);
  if (pIndex === -1) {
    return res.status(404).json({ error: "Purchase not found" });
  }

  const oldStatus = db.purchases[pIndex].status;
  const targetStatus = req.body.status; // 'RECEIVED' or 'CANCELLED'

  db.purchases[pIndex].status = targetStatus;
  db.purchases[pIndex].updated_at = new Date().toISOString();

  // If transitioning to RECEIVED, increment appropriate sparepart variant stock
  if (targetStatus === "RECEIVED" && oldStatus !== "RECEIVED") {
    const details = db.purchase_details.filter((pd: any) => pd.purchase_id === purchaseId);
    
    details.forEach((pd: any) => {
      const vIndex = db.variants.findIndex((v: any) => v.variant_id === pd.variant_id);
      if (vIndex !== -1) {
        db.variants[vIndex].stock += pd.quantity;
      }

      // Record inventory journal entry (STOCK MOVEMENT 'IN')
      const nextMovId = db.stock_movements.length > 0 ? Math.max(...db.stock_movements.map((sm: any) => sm.movement_id)) + 1 : 1;
      db.stock_movements.push({
        movement_id: nextMovId,
        variant_id: pd.variant_id,
        movement_type: "IN",
        quantity: pd.quantity,
        reference_type: "PURCHASE",
        reference_id: purchaseId,
        movement_date: new Date().toISOString().split('T')[0],
        description: `Penerimaan stok dari Pesanan Pembelian PO #${purchaseId}`,
        created_at: new Date().toISOString(),
        updated_at: null,
        deleted_at: null
      });
    });
  }

  writeDb(db);
  res.json(db.purchases[pIndex]);
});

// Stock movements journal
app.get("/api/stock-movements", (req, res) => {
  const db = readDb();
  const movements = db.stock_movements.map((sm: any) => {
    const variant = db.variants.find((v: any) => v.variant_id === sm.variant_id);
    return {
      ...sm,
      variants_sku: variant ? variant.sku : "SKU",
      variant_name: variant ? variant.name : "Suku Cadang"
    };
  });
  res.json(movements.reverse());
});

// Manual stock adjustments
app.post("/api/stock-movements", (req, res) => {
  const db = readDb();
  const variantId = parseInt(req.body.variant_id);
  const type = req.body.movement_type; // 'IN' or 'OUT'
  const qty = parseInt(req.body.quantity);
  const desc = req.body.description || "Penyesuaian Manual";

  const vIndex = db.variants.findIndex((v: any) => v.variant_id === variantId);
  if (vIndex !== -1) {
    if (type === "IN") {
      db.variants[vIndex].stock += qty;
    } else {
      db.variants[vIndex].stock = Math.max(0, db.variants[vIndex].stock - qty);
    }

    const nextMovId = db.stock_movements.length > 0 ? Math.max(...db.stock_movements.map((sm: any) => sm.movement_id)) + 1 : 1;
    const movement = {
      movement_id: nextMovId,
      variant_id: variantId,
      movement_type: type,
      quantity: qty,
      reference_type: "MANUAL",
      reference_id: nextMovId,
      movement_date: new Date().toISOString().split('T')[0],
      description: desc,
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: null
    };

    db.stock_movements.push(movement);
    writeDb(db);
    res.status(201).json(movement);
  } else {
    res.status(404).json({ error: "Suku cadang variant tidak ditemukan" });
  }
});


// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve("dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server bengkel running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
