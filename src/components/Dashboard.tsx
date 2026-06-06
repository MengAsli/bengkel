import React from "react";
import { 
  TrendingUp, 
  Users, 
  Wrench, 
  AlertTriangle, 
  ArrowRight, 
  Receipt, 
  ShoppingBag, 
  History,
  RotateCcw
} from "lucide-react";

interface DashboardProps {
  stats: {
    totalCustomers: number;
    totalVehicles: number;
    activeWorkOrdersCount: number;
    lowStockCount: number;
    totalRevenue: number;
    recentWorkOrders: any[];
    recentReceipts: any[];
    hotParts: any[];
    monthlyRevenue: Record<string, number>;
  };
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Dashboard({ stats, onNavigate, onRefresh, loading }: DashboardProps) {
  // Convert monthlyRevenue into sorted list
  const monthlyData = Object.entries(stats.monthlyRevenue || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6); // Last 6 months

  const maxVal = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d[1])) : 100000;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">MenkAsliRilOri</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau kinerja keuangan, daftar mekanik, dan suku cadang Bikini Bottom Garage Anda.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-55"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Cards Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Total Pendapatan</span>
            <p className="text-xl font-bold font-display text-emerald-600">
              Rp {stats.totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active repairs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Servis Aktif</span>
            <p className="text-2xl font-bold text-slate-800">{stats.activeWorkOrdersCount} Kendaraan</p>
          </div>
          <div className="bg-teal-50 text-teal-600 p-3 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Stok Menipis (&lt;5)</span>
            <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
              {stats.lowStockCount} Suku Cadang
            </p>
          </div>
          <div className={`${stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'} p-3 rounded-xl`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Total Pelanggan</span>
            <p className="text-2xl font-bold text-slate-800">{stats.totalCustomers} Orang</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Graphs & Charts Dashboard panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytical monthly graph */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 font-display mb-4">Grafik Tren Pendapatan Bulanan</h3>
          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <TrendingUp className="w-12 h-12 stroke-1 mb-2" />
              <p className="text-sm">Belum ada data transaksi bulanan</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="h-48 flex items-end justify-between gap-2.5 pt-4">
                {monthlyData.map(([month, val]) => {
                  const percent = val > 0 ? (val / maxVal) * 100 : 5;
                  const monthName = new Date(month + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Price tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-1.5 rounded shadow absolute mb-[44px] pointer-events-none translate-y-[-100%]">
                        Rp {val.toLocaleString("id-ID")}
                      </div>
                      <div 
                        style={{ height: `${percent}%` }} 
                        className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-all"
                      ></div>
                      <span className="text-[10px] text-slate-400 font-medium">{monthName}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-100 pt-4 flex gap-6 text-[11px] text-slate-500 font-medium justify-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm"></span>
                  Pendapatan Bruto (Rp)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hot selling parts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 font-display mb-4">Suku Cadang Terlaris</h3>
          {stats.hotParts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
              <p className="text-sm">Belum ada barang terjual</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.hotParts.map((item, index) => (
                <div key={item.variant_id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-400">{item.quantity} unit terjual</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    Rp {item.revenue.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dual Columns lists: Recent Work orders and transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent repairs orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Perintah Kerja Terbaru (Work Order)</h3>
            <button 
              onClick={() => onNavigate("work-orders")}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats.recentWorkOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Belum ada perintah kerja servis</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentWorkOrders.map((wo) => (
                <div key={wo.work_order_id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-800">{wo.request}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Pelanggan: <span className="text-slate-600 font-medium">{wo.customer_name}</span> • Plat: <span className="text-slate-600 font-medium">{wo.plate_number}</span>
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    wo.status === "DONE" ? "bg-emerald-100 text-emerald-800" :
                    wo.status === "IN_PROGRESS" ? "bg-indigo-100 text-indigo-800" :
                    wo.status === "CANCELLED" ? "bg-rose-100 text-rose-800" :
                    "bg-amber-100 text-amber-850"
                  }`}>
                    {wo.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions lists */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Transaksi Selesai</h3>
            <button 
              onClick={() => onNavigate("receipts")}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              Lihat Histori <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats.recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Belum ada slip pembayaran</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentReceipts.map((r) => (
                <div key={r.receipt_number} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 text-slate-700 p-2.5 rounded-xl">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">Nota #{r.receipt_number}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{r.customer_name} • {new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Rp {r.grandtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
