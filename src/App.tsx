import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Compass, 
  Box, 
  History, 
  ShoppingBag, 
  TrendingUp, 
  Users2, 
  Receipt,
  Menu,
  X,
  Sparkles,
  Server,
  LogOut,
  Settings,
  Truck,
  Database
} from "lucide-react";

// Import modular panels
import Dashboard from "./components/Dashboard";
import SupabaseExport from "./components/SupabaseExport";
import Customers from "./components/Customers";
import Vehicles from "./components/Vehicles";
import Employees from "./components/Employees";
import Spareparts from "./components/Spareparts";
import WorkOrders from "./components/WorkOrders";
import Receipts from "./components/Receipts";
import Purchases from "./components/Purchases";
import StockMovements from "./components/StockMovements";
import Services from "./components/Services";
import Suppliers from "./components/Suppliers";
import garageLogo from "./assets/images/garage_logo_1780761158501.png";

import { 
  Customer, 
  Vehicle, 
  VehicleCategory, 
  Employee, 
  Role, 
  Sparepart, 
  Variant, 
  Supplier, 
  Service, 
  ServiceDetail, 
  WorkOrder, 
  MainReceipt, 
  Purchase, 
  StockMovement 
} from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // App data states
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    activeWorkOrdersCount: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    recentWorkOrders: [],
    recentReceipts: [],
    hotParts: [],
    monthlyRevenue: {}
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesDetails, setServicesDetails] = useState<ServiceDetail[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [receipts, setReceipts] = useState<MainReceipt[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Cross-component pre-loader states (e.g. WorkOrder triggers POS bill creation)
  const [posPreload, setPosPreload] = useState<any | null>(null);

  // Fetch everything initially
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        resStats,
        resCust,
        resVeh,
        resCat,
        resEmp,
        resRoles,
        resParts,
        resVars,
        resSups,
        resServs,
        resSDetails,
        resWOs,
        resReceipts,
        resPurchases,
        resMovements
      ] = await Promise.all([
        fetch("/api/dashboard").then(r => r.json()),
        fetch("/api/customers").then(r => r.json()),
        fetch("/api/vehicles").then(r => r.json()),
        fetch("/api/vehicle-categories").then(r => r.json()),
        fetch("/api/employees").then(r => r.json()),
        fetch("/api/roles").then(r => r.json()),
        fetch("/api/spareparts").then(r => r.json()),
        fetch("/api/variants").then(r => r.json()),
        fetch("/api/suppliers").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/services-details").then(r => r.json()),
        fetch("/api/work-orders").then(r => r.json()),
        fetch("/api/receipts").then(r => r.json()),
        fetch("/api/purchases").then(r => r.json()),
        fetch("/api/stock-movements").then(r => r.json())
      ]);

      setStats(resStats);
      setCustomers(resCust);
      setVehicles(resVeh);
      setCategories(resCat);
      setEmployees(resEmp);
      setRoles(resRoles);
      setSpareparts(resParts);
      setVariants(resVars);
      setSuppliers(resSups);
      setServices(resServs);
      setServicesDetails(resSDetails);
      setWorkOrders(resWOs);
      setReceipts(resReceipts);
      setPurchases(resPurchases);
      setMovements(resMovements);
    } catch (err) {
      console.error("Gagal melakukan pencadangan data sinkronisasi awal bengkel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // API Call wraps inside React
  const executePost = async (url: string, payload: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const parsed = await res.json();
    await loadAllData();
    return parsed;
  };

  const executePut = async (url: string, payload: any) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const parsed = await res.json();
    await loadAllData();
    return parsed;
  };

  const executeDelete = async (url: string) => {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Gagal menghapus data.");
    }
    await loadAllData();
  };

  // Helper mapping navigation functions
  const openPOSFromWorkOrder = (wo: WorkOrder) => {
    setPosPreload({
      customer_id: wo.customer_id,
      vehicle_id: wo.vehicle_id,
      work_order_id: wo.work_order_id
    });
    setActiveTab("receipts");
  };

  // Menu lists
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "work-orders", label: "Perintah Kerja (WO)", icon: Wrench },
    { id: "customers", label: "Pelanggan", icon: Users2 },
    { id: "suppliers", label: "Supplier", icon: Truck },
    { id: "vehicles", label: "Armada Motor", icon: Compass },
    { id: "services", label: "Jasa & Tarif", icon: Settings },
    { id: "spareparts", label: "Suku Cadang & Stok", icon: Box },
    { id: "purchases", label: "Pengadaan (PO)", icon: ShoppingBag },
    { id: "receipts", label: "Kasir POS & Nota", icon: Receipt },
    { id: "stock-movements", label: "Buku Mutasi Stok", icon: History },
    { id: "employees", label: "Karyawan & Gaji", icon: Users },
    { id: "supabase", label: "Integrasi Supabase", icon: Database }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 relative">
      
      {/* SIDEBAR NAVIGATION - DESKTOP VIEW */}
      <aside className="hidden lg:block w-72 bg-slate-900 text-white shrink-0 shadow-lg relative flex flex-col justify-between">
        <div className="p-6 space-y-8 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-white/10">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow border border-teal-500/20 flex-shrink-0 bg-slate-800">
                <img src={garageLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-none">Bikini Bottom Garage</h1>
                <span className="text-[10px] text-teal-400/85 tracking-wider font-semibold font-mono">WORKSPACE LIVE v1.0</span>
              </div>
            </div>

            {/* Link nodes */}
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      active 
                        ? "bg-teal-500 text-slate-900 shadow-md shadow-teal-500/10" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile metadata info */}
          <div className="pt-6 border-t border-white/10 space-y-3.5">
            <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl">
              <div className="bg-teal-500/20 text-teal-300 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase font-display">
                O
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs truncate">Owner/Kasir</p>
                <p className="text-[10px] text-white/40 truncate">jojomario33@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER RESPONSIVE TOGGLES */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex justify-between items-center px-4 shadow-md z-40 print:hidden">
        <div className="flex items-center gap-2.5">
          <img src={garageLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-teal-500/20" referrerPolicy="no-referrer" />
          <h1 className="font-bold font-display text-sm">Bikini Bottom Garage</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 hover:bg-white/10 rounded-lg"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* MOBILE DRAWER WINDOW */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden font-display animate-in fade-in duration-100">
          <div className="w-72 bg-slate-900 text-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-150">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-teal-500" />
                  <span className="font-bold text-sm tracking-wide">Navigasi Bengkel</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active 
                          ? "bg-teal-500 text-slate-900 shadow-md" 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 bg-white/5 rounded-xl flex items-center gap-2 text-xs">
              <div className="bg-teal-500/20 text-teal-350 w-7 h-7 rounded-full flex items-center justify-center font-bold">O</div>
              <span className="truncate max-w-[150px]">jojomario33@gmail.com</span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC CANVAS */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Global loading indicators */}
        {loading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-semibold">Mensinkronisasikan basis data...</p>
          </div>
        ) : (
          <>
            {/* View selectors routing */}
            {activeTab === "dashboard" && (
              <Dashboard 
                stats={stats} 
                onNavigate={(tab) => setActiveTab(tab)} 
                onRefresh={loadAllData} 
                loading={loading}
              />
            )}

            {activeTab === "customers" && (
              <Customers
                customers={customers}
                onAdd={(p) => executePost("/api/customers", p)}
                onEdit={(id, p) => executePut(`/api/customers/${id}`, p)}
                onDelete={(id) => executeDelete(`/api/customers/${id}`)}
              />
            )}

            {activeTab === "suppliers" && (
              <Suppliers
                suppliers={suppliers}
                variants={variants}
                onAdd={(p) => executePost("/api/suppliers", p)}
                onEdit={(id, p) => executePut(`/api/suppliers/${id}`, p)}
                onDelete={(id) => executeDelete(`/api/suppliers/${id}`)}
              />
            )}

            {activeTab === "vehicles" && (
              <Vehicles
                vehicles={vehicles}
                customers={customers}
                categories={categories}
                onAdd={(p) => executePost("/api/vehicles", p)}
                onEdit={(id, p) => executePut(`/api/vehicles/${id}`, p)}
                onDelete={(id) => executeDelete(`/api/vehicles/${id}`)}
                onAddCategory={(p) => executePost("/api/vehicle-categories", p)}
              />
            )}

            {activeTab === "employees" && (
              <Employees
                employees={employees}
                roles={roles}
                onAdd={(p) => executePost("/api/employees", p)}
                onEdit={(id, p) => executePut(`/api/employees/${id}`, p)}
                onDelete={(id) => executeDelete(`/api/employees/${id}`)}
                onAddRole={(p) => executePost("/api/roles", p)}
                onEditRole={(id, p) => executePut(`/api/roles/${id}`, p)}
                onDeleteRole={(id) => executeDelete(`/api/roles/${id}`)}
              />
            )}

            {activeTab === "spareparts" && (
              <Spareparts
                spareparts={spareparts}
                variants={variants}
                categories={categories}
                suppliers={suppliers}
                onAddPart={(p) => executePost("/api/spareparts", p)}
                onEditPart={(id, p) => executePut(`/api/spareparts/${id}`, p)}
                onDeletePart={(id) => executeDelete(`/api/spareparts/${id}`)}
                onAddVariant={(p) => executePost("/api/variants", p)}
                onEditVariant={(id, p) => executePut(`/api/variants/${id}`, p)}
                onDeleteVariant={(id) => executeDelete(`/api/variants/${id}`)}
                onAdjustStock={(p) => executePost("/api/stock-movements", p)}
              />
            )}

            {activeTab === "work-orders" && (
              <WorkOrders
                workOrders={workOrders}
                customers={customers}
                vehicles={vehicles}
                onAdd={(p) => executePost("/api/work-orders", p)}
                onEdit={(id, p) => executePut(`/api/work-orders/${id}`, p)}
                onDelete={(id) => executeDelete(`/api/work-orders/${id}`)}
                onOpenPOS={openPOSFromWorkOrder}
              />
            )}

            {activeTab === "receipts" && (
              <Receipts
                receipts={receipts}
                customers={customers}
                vehicles={vehicles}
                employees={employees}
                variants={variants}
                servicesDetails={servicesDetails}
                onCreateReceipt={(p) => executePost("/api/receipts", p)}
                posPreload={posPreload}
                clearPosPreload={() => setPosPreload(null)}
              />
            )}

            {activeTab === "purchases" && (
              <Purchases
                purchases={purchases}
                suppliers={suppliers}
                variants={variants}
                onCreatePurchase={(p) => executePost("/api/purchases", p)}
                onReceivePurchase={(id) => executePut(`/api/purchases/${id}/status`, { status: "RECEIVED" })}
              />
            )}

            {activeTab === "stock-movements" && (
              <StockMovements movements={movements} />
            )}

            {activeTab === "services" && (
              <Services
                services={services}
                details={servicesDetails}
                categories={categories}
                onAddService={(p) => executePost("/api/services", p)}
                onEditService={(id, p) => executePut(`/api/services/${id}`, p)}
                onDeleteService={(id) => executeDelete(`/api/services/${id}`)}
                onAddDetail={(p) => executePost("/api/services-details", p)}
                onEditDetail={(id, p) => executePut(`/api/services-details/${id}`, p)}
                onDeleteDetail={(id) => executeDelete(`/api/services-details/${id}`)}
              />
            )}

            {activeTab === "supabase" && (
              <SupabaseExport
                roles={roles}
                employees={employees}
                customers={customers}
                categories={categories}
                vehicles={vehicles}
                spareparts={spareparts}
                suppliers={suppliers}
                variants={variants}
                services={services}
                services_details={servicesDetails}
                work_orders={workOrders}
                main_receipts={receipts}
                detail_receipt_services={[]}
                detail_receipt_spareparts={[]}
                purchases={purchases}
                purchase_details={[]}
                stock_movements={movements}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
