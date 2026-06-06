import React, { useState } from "react";
import { Vehicle, Customer, VehicleCategory } from "../types";
import { Search, Plus, Edit2, Trash2, Shield, Calendar, User, X, Hash } from "lucide-react";

interface VehiclesProps {
  vehicles: Vehicle[];
  customers: Customer[];
  categories: VehicleCategory[];
  onAdd: (veh: any) => Promise<any>;
  onEdit: (id: number, veh: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onAddCategory: (cat: any) => Promise<any>;
}

export default function Vehicles({ 
  vehicles, 
  customers, 
  categories, 
  onAdd, 
  onEdit, 
  onDelete,
  onAddCategory
}: VehiclesProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);

  // Vehicle Form fields
  const [customerId, setCustomerId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Category Simple Form fields
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [catErrorMsg, setCatErrorMsg] = useState("");

  const filtered = vehicles.filter(v => 
    v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    v.engine_number.toLowerCase().includes(search.toLowerCase()) ||
    (v.customer_name && v.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (v.category_name && v.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setEditItem(null);
    setCustomerId(customers.length > 0 ? customers[0].customers_id.toString() : "");
    setCategoryId(categories.length > 0 ? categories[0].vehicle_category_id.toString() : "");
    setPlateNumber("");
    setEngineNumber("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item: Vehicle) => {
    setEditItem(item);
    setCustomerId(item.customer_id.toString());
    setCategoryId(item.vehicle_category_id.toString());
    setPlateNumber(item.plate_number);
    setEngineNumber(item.engine_number);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !categoryId || !plateNumber.trim()) {
      setErrorMsg("Pelanggan, tipe kendaraan, dan nomor plat wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customer_id: parseInt(customerId),
        vehicle_category_id: parseInt(categoryId),
        plate_number: plateNumber.trim().toUpperCase(),
        engine_number: engineNumber.trim()
      };
      if (editItem) {
        await onEdit(editItem.vehicle_id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setErrorMsg("Gagal menyimpan data kendaraan.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !year) {
      setCatErrorMsg("Merk, Model, dan Tahun harus diisi!");
      return;
    }
    try {
      const nextCat = await onAddCategory({
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year)
      });
      if (nextCat) {
        setCategoryId(nextCat.vehicle_category_id.toString());
      }
      setCatModalOpen(false);
      setBrand("");
      setModel("");
    } catch (err) {
      setCatErrorMsg("Gagal membuat tipe motor baru.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data kendaraan ini?")) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and registration filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari plat nomor, nama pemilik, tipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-teal-105 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Kendaraan
        </button>
      </div>

      {/* Vehicles list representation tab */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-450 space-y-2">
            <Shield className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-slate-500 font-medium">Belum ada motor terdaftar</p>
            <p className="text-slate-400 text-xs text-center max-w-sm mx-auto">
              Silakan klik tombol "Daftarkan Kendaraan" untuk menghubungkan motor pelanggan dengan basis data servis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 w-16 text-center">No</th>
                  <th className="p-4">Plat Nomor</th>
                  <th className="p-4">Model & Merk Motor</th>
                  <th className="p-4">Pemilik (Kustomer)</th>
                  <th className="p-4">Nomor Mesin</th>
                  <th className="p-4 pr-6 text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((v, index) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-800 tracking-wider font-mono">
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-md text-xs">
                        {v.plate_number}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{v.category_name}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-650">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {v.customer_name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{v.engine_number || "-"}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(v)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          title="Ubah data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.vehicle_id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Hapus kendaraan"
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

      {/* Main Vehicle modal config */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editItem ? "Ubah Data Kendaraan" : "Registrasi Kendaraan Baru"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-55 text-rose-800 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Owner client selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemilik Motor *</label>
                {customers.length === 0 ? (
                  <div className="text-xs text-rose-500 py-1">
                    Silakan registrasikan kustomer terlebih dahulu di menu Pelanggan.
                  </div>
                ) : (
                  <select 
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    {customers.map(c => (
                      <option key={c.customers_id} value={c.customers_id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Motor specification categories */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model / Tipe Motor *</label>
                  <button 
                    type="button"
                    onClick={() => setCatModalOpen(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer underline"
                  >
                    + Buat Tipe Baru
                  </button>
                </div>
                {categories.length === 0 ? (
                  <div className="text-xs py-1 text-slate-400">Loading master tipe motor...</div>
                ) : (
                  <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.vehicle_category_id} value={cat.vehicle_category_id}>
                        {cat.brand} {cat.model} ({cat.year})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Plate registration number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor Plat Polisi *</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Contoh: B 1234 ABC"
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm font-semibold tracking-wider outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Engine code numbers */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor Mesin (Opsional)</label>
                <input 
                  type="text" 
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  placeholder="Contoh: JM51E-123456"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono uppercase"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading || customers.length === 0}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-450 rounded-xl transition-all cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Sub modal for adding brand/categories model */}
      {catModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-sm font-display">Registrasi Tipe/Kategori Motor</h4>
              <button 
                onClick={() => setCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-3">
              {catErrorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-800 text-xs rounded-lg font-medium">
                  {catErrorMsg}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Merk (Brand) *</label>
                <input 
                  type="text"
                  placeholder="Contoh: Honda, Yamaha, Suzuki"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Model Kendaraan *</label>
                <input 
                  type="text"
                  placeholder="Contoh: Beat, Vario 150, NMAX"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Tahun Perakitan *</label>
                <input 
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setCatModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-500 bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-teal-650 hover:bg-teal-700 text-white font-semibold rounded-lg"
                >
                  Buat Tipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
