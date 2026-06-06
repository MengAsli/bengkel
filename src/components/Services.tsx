import React, { useState } from "react";
import { Service, ServiceDetail, VehicleCategory } from "../types";
import { Search, Plus, Edit2, Trash2, ShieldCheck, Heart, X, Sparkles } from "lucide-react";

interface ServicesProps {
  services: Service[];
  details: ServiceDetail[];
  categories: VehicleCategory[];
  onAddService: (payload: any) => Promise<any>;
  onEditService: (id: number, payload: any) => Promise<any>;
  onDeleteService: (id: number) => Promise<any>;
  onAddDetail: (payload: any) => Promise<any>;
  onEditDetail: (id: number, payload: any) => Promise<any>;
  onDeleteDetail: (id: number) => Promise<any>;
}

export default function Services({
  services,
  details,
  categories,
  onAddService,
  onEditService,
  onDeleteService,
  onAddDetail,
  onEditDetail,
  onDeleteDetail
}: ServicesProps) {
  const [subTab, setSubTab] = useState<"pricing" | "master">("pricing");
  const [search, setSearch] = useState("");
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editDetail, setEditDetail] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Master Service form fields
  const [serviceName, setServiceName] = useState("");
  const [serviceError, setServiceError] = useState("");

  // Pricing Detail form fields
  const [detailServiceId, setDetailServiceId] = useState("");
  const [detailCategoryId, setDetailCategoryId] = useState("");
  const [detailPrice, setDetailPrice] = useState("");
  const [detailError, setDetailError] = useState("");

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDetails = details.filter(d => 
    (d.service_name && d.service_name.toLowerCase().includes(search.toLowerCase())) ||
    (d.category_name && d.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddService = () => {
    setEditService(null);
    setServiceName("");
    setServiceError("");
    setServiceModalOpen(true);
  };

  const openEditService = (s: Service) => {
    setEditService(s);
    setServiceName(s.name);
    setServiceError("");
    setServiceModalOpen(true);
  };

  const openAddDetail = () => {
    setEditDetail(null);
    setDetailServiceId(services.length > 0 ? services[0].service_id.toString() : "");
    setDetailCategoryId(categories.length > 0 ? categories[0].vehicle_category_id.toString() : "");
    setDetailPrice("");
    setDetailError("");
    setDetailModalOpen(true);
  };

  const openEditDetail = (d: ServiceDetail) => {
    setEditDetail(d);
    setDetailServiceId(d.services_id.toString());
    setDetailCategoryId(d.vehicle_category_id.toString());
    setDetailPrice(d.price.toString());
    setDetailError("");
    setDetailModalOpen(true);
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setServiceError("Nama jasa servis wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      if (editService) {
        await onEditService(editService.service_id, { name: serviceName.trim() });
      } else {
        await onAddService({ name: serviceName.trim() });
      }
      setServiceModalOpen(false);
    } catch {
      setServiceError("Gagal menyimpan nama paket jasa.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailServiceId || !detailCategoryId || !detailPrice) {
      setDetailError("Seluruh kolom bertanda bintang (*) wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        services_id: parseInt(detailServiceId),
        vehicle_category_id: parseInt(detailCategoryId),
        price: parseFloat(detailPrice),
        variant_id: null
      };
      if (editDetail) {
        await onEditDetail(editDetail.services_detail_id, payload);
      } else {
        await onAddDetail(payload);
      }
      setDetailModalOpen(false);
    } catch {
      setDetailError("Gagal menetapkan tarif jasa.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm("Hapus grup paket layanan jasa ini?")) {
      await onDeleteService(id);
    }
  };

  const handleDeleteDetail = async (id: number) => {
    if (confirm("Hapus pemetaan tarif jasa ini?")) {
      await onDeleteDetail(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab switch bar */}
      <div className="flex border-b border-slate-100 bg-white p-2 rounded-xl shadow-sm gap-2">
        <button
          onClick={() => { setSubTab("pricing"); setSearch(""); }}
          className={`flex-1 sm:flex-none text-center px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === "pricing" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Konfigurasi Tarif Jasa
        </button>
        <button
          onClick={() => { setSubTab("master"); setSearch(""); }}
          className={`flex-1 sm:flex-none text-center px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === "master" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Grup Paket Jasa Servis (Master)
        </button>
      </div>

      {/* Control bar filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm font-display">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder={subTab === "pricing" ? "Cari jasa atau model motor..." : "Cari master jasa..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        
        {subTab === "pricing" ? (
          <button 
            disabled={services.length === 0}
            onClick={openAddDetail}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Tetapkan Harga Jasa Baru
          </button>
        ) : (
          <button 
            onClick={openAddService}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Buat Jasa Servis Master
          </button>
        )}
      </div>

      {/* PRICING TAB - Detailed rates */}
      {subTab === "pricing" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredDetails.length === 0 ? (
            <div className="text-center py-16 text-slate-450 space-y-2">
              <Sparkles className="w-12 h-12 stroke-1 mx-auto text-slate-350" />
              <p className="text-slate-500 font-medium">Harga jasa belum dikonfigurasi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6 text-center w-16">ID</th>
                    <th className="p-4">Jenis Layanan</th>
                    <th className="p-4">Kompatibilitas Model Motor</th>
                    <th className="p-4 text-emerald-755 font-bold">Biaya Jasa Bengkel (Labor Rate)</th>
                    <th className="p-4 pr-6 text-right w-24">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredDetails.map((d) => (
                    <tr key={d.services_detail_id} className="hover:bg-slate-50/55 transition-colors">
                      <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{d.services_detail_id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{d.service_name}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium">
                          {d.category_name || "Semua Motor"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800 font-mono">
                        Rp {d.price.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openEditDetail(d)}
                            className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDetail(d.services_detail_id)}
                            className="p-2 text-slate-400 hover:text-rose-650 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MASTER TAB - Master Service definitions */}
      {subTab === "master" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 text-slate-450 space-y-2">
              <Heart className="w-12 h-12 stroke-1 mx-auto text-slate-350" />
              <p className="text-slate-500 font-medium">Layanan jasa kosong</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6 text-center w-16">ID Jasa</th>
                    <th className="p-4">Nama Grup Paket Jasa</th>
                    <th className="p-4 pr-6 text-right w-24">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredServices.map((s) => (
                    <tr key={s.service_id} className="hover:bg-slate-50/55 transition-colors">
                      <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{s.service_id}</td>
                      <td className="p-4 font-bold text-slate-800">{s.name}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openEditService(s)}
                            className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(s.service_id)}
                            className="p-2 text-slate-400 hover:text-rose-650 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Service Master Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editService ? "Ubah Grup Jasa" : "Buat Master Jasa Servis"}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitService} className="p-6 space-y-4">
              {serviceError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">{serviceError}</div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Nama Jasa Servis *</label>
                <input 
                  type="text" 
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Contoh: Ganti Ban, Kuras Rem, Servis Berat"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Simpan Jasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Rate Mapper Modal */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editDetail ? "Ubah Tarif Layanan" : "Tetapkan Tarif Jasa Baru"}
              </h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitDetail} className="p-6 space-y-4">
              {detailError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">{detailError}</div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Jenis Jasa Utama *</label>
                <select 
                  value={detailServiceId}
                  onChange={(e) => setDetailServiceId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {services.map(s => (
                    <option key={s.service_id} value={s.service_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Batas Tipe Motor Kompatibilitas *</label>
                <select 
                  value={detailCategoryId}
                  onChange={(e) => setDetailCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {categories.map(cat => (
                    <option key={cat.vehicle_category_id} value={cat.vehicle_category_id}>
                      {cat.brand} {cat.model} ({cat.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase font-display">Tarif Harga Jasa * (Rupiah)</label>
                <input 
                  type="number" 
                  value={detailPrice}
                  onChange={(e) => setDetailPrice(e.target.value)}
                  placeholder="Contoh: 25000"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-705 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Terapkan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
