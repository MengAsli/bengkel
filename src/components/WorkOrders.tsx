import React, { useState } from "react";
import { WorkOrder, Customer, Vehicle } from "../types";
import { Search, Plus, Play, CheckCircle, Ban, Clock, X, AlertCircle } from "lucide-react";

interface WorkOrdersProps {
  workOrders: WorkOrder[];
  customers: Customer[];
  vehicles: Vehicle[];
  onAdd: (wo: any) => Promise<any>;
  onEdit: (id: number, wo: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onOpenPOS: (wo: WorkOrder) => void;
}

export default function WorkOrders({ 
  workOrders, 
  customers, 
  vehicles, 
  onAdd, 
  onEdit, 
  onDelete,
  onOpenPOS
}: WorkOrdersProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'>("PENDING");
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = workOrders.filter(wo => 
    wo.request.toLowerCase().includes(search.toLowerCase()) ||
    (wo.customer_name && wo.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (wo.plate_number && wo.plate_number.toLowerCase().includes(search.toLowerCase()))
  );

  // List of vehicles matching selected customer
  const availableVehicles = vehicles.filter(v => v.customer_id === parseInt(customerId));

  const handleCustomerChange = (cId: string) => {
    setCustomerId(cId);
    const firstVeh = vehicles.find(v => v.customer_id === parseInt(cId));
    setVehicleId(firstVeh ? firstVeh.vehicle_id.toString() : "");
  };

  const openAddModal = () => {
    const firstCust = customers[0];
    const initialCustId = firstCust ? firstCust.customers_id.toString() : "";
    
    setCustomerId(initialCustId);
    const firstVeh = vehicles.find(v => v.customer_id === parseInt(initialCustId));
    setVehicleId(firstVeh ? firstVeh.vehicle_id.toString() : "");
    setRequest("");
    setStatus("PENDING");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !vehicleId || !request.trim()) {
      setErrorMsg("Pelanggan, kendaraan, dan detail keluhan wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      await onAdd({
        customer_id: parseInt(customerId),
        vehicle_id: parseInt(vehicleId),
        request: request.trim(),
        status
      });
      setModalOpen(false);
    } catch {
      setErrorMsg("Gagal mendaftarkan service order.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (wo: WorkOrder, targetStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED') => {
    try {
      await onEdit(wo.work_order_id, {
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        request: wo.request,
        status: targetStatus
      });
    } catch {
      alert("Gagal merubah status servis.");
    }
  };

  // Group work orders by status for boards
  const pendingOrders = filtered.filter(w => w.status === "PENDING");
  const ongoingOrders = filtered.filter(w => w.status === "IN_PROGRESS");
  const finishedOrders = filtered.filter(w => w.status === "DONE" || w.status === "CANCELLED");

  return (
    <div className="space-y-6">
      {/* Control panel and quick register */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari keluhan mekanik atau plat nomor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-55 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button 
          disabled={customers.length === 0 || vehicles.length === 0}
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Buka Perintah Kerja Baru (WO)
        </button>
      </div>

      {vehicles.length === 0 && (
        <div className="p-4 bg-amber-50 text-amber-850 rounded-xl flex items-center gap-2.5 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Tampaknya belum ada kendaraan terdaftar. Daftarkan kendaraan kustomer di tab <strong>"Kendaraan"</strong> sebelum mulai membuat Perintah Kerja.</span>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PENDING COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 py-3 rounded-xl border border-slate-150 border-l-4 border-l-amber-500 shadow-xs">
            <span className="font-bold text-slate-700 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Antrean Servis ({pendingOrders.length})
            </span>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {pendingOrders.length === 0 ? (
              <div className="p-6 bg-slate-50 text-center rounded-xl text-slate-400 text-xs border border-dashed">Belum ada antrean masuk</div>
            ) : (
              pendingOrders.map(wo => (
                <div key={wo.work_order_id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3.5 hover:shadow transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded-md font-mono">WO #{wo.work_order_id}</span>
                    <h4 className="font-semibold text-slate-800 text-sm pt-1">{wo.request}</h4>
                    <p className="text-xs text-slate-450 pt-0.5">Pemilik: {wo.customer_name} ({wo.plate_number})</p>
                  </div>
                  <div className="pt-2 border-t border-slate-50 flex justify-end gap-2">
                    <button 
                      onClick={() => updateStatus(wo, "IN_PROGRESS")}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Play className="w-3 h-3 fill-white" /> Kerjakan
                    </button>
                    <button 
                      onClick={() => updateStatus(wo, "CANCELLED")}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Batalkan WO"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 py-3 rounded-xl border border-slate-150 border-l-4 border-l-indigo-600 shadow-xs">
            <span className="font-bold text-slate-700 font-display flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-505" /> Sedang Dikerjakan ({ongoingOrders.length})
            </span>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {ongoingOrders.length === 0 ? (
              <div className="p-6 bg-slate-50 text-center rounded-xl text-slate-400 text-xs border border-dashed">Belum ada motor di bongkar</div>
            ) : (
              ongoingOrders.map(wo => (
                <div key={wo.work_order_id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3.5 hover:shadow transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-50 font-bold text-indigo-700 px-2 py-0.5 rounded-md font-mono">AKTIF • WO #{wo.work_order_id}</span>
                    <h4 className="font-semibold text-slate-800 text-sm pt-1">{wo.request}</h4>
                    <p className="text-xs text-slate-450 pt-0.5">Pemilik: {wo.customer_name} ({wo.plate_number})</p>
                    <p className="text-[10px] text-indigo-600 font-semibold">{wo.vehicle_model}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-50 flex justify-between gap-2 items-center">
                    <button 
                      onClick={() => updateStatus(wo, "PENDING")}
                      className="text-xs text-slate-450 hover:text-slate-600 underline"
                    >
                      Kembalikan ke Antrean
                    </button>
                    <button 
                      onClick={() => onOpenPOS(wo)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> BuatInvoice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DONE / CANCELLED COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 py-3 rounded-xl border border-slate-150 border-l-4 border-l-emerald-600 shadow-xs">
            <span className="font-bold text-slate-700 font-display flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Histori Penyelesaian ({finishedOrders.length})
            </span>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {finishedOrders.length === 0 ? (
              <div className="p-6 bg-slate-50 text-center rounded-xl text-slate-400 text-xs border border-dashed">Belum ada penyelesaian hari ini</div>
            ) : (
              finishedOrders.map(wo => (
                <div key={wo.work_order_id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-85 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded-md font-mono">WO #{wo.work_order_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      wo.status === "DONE" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {wo.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-700 text-sm mt-3">{wo.request}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Pemilik: {wo.customer_name} ({wo.plate_number})</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Perintah Kerja Creator modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-120">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                Buat Perintah Kerja (Servis Baru)
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">{errorMsg}</div>
              )}

              {/* Cust list selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pilih Pelanggan *</label>
                <select 
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map(c => (
                    <option key={c.customers_id} value={c.customers_id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Vehicle filtering selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pilih Motor Yang Diservis *</label>
                {!customerId ? (
                  <div className="text-xs text-slate-400 py-1">Pilih pelanggan terlebih dahulu</div>
                ) : availableVehicles.length === 0 ? (
                  <div className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-lg flex items-center gap-1">
                    Pelanggan ini belum mendaftarkan motor! Silakan daftarkan motor milik sang kustomer terlebih dahulu di tab Kendaraan.
                  </div>
                ) : (
                  <select 
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  >
                    <option value="">-- Pilih Motor Pemilik --</option>
                    {availableVehicles.map(v => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.plate_number} - {v.category_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Job request / keluhan pelanggan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail Keluhan & Permasalahan *</label>
                <textarea 
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="Contoh: Suara mesin kasar saat melaju pelan, ganti oli mesin Yamalube, cek tekanan angin."
                  rows={4}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !vehicleId}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-350 rounded-xl cursor-pointer"
                >
                  Kirim ke Antrean
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
