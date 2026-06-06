import React, { useState } from "react";
import { Sparepart, Variant, VehicleCategory, Supplier } from "../types";
import { Search, Plus, Edit2, Trash2, Box, RefreshCw, BarChart2, ShieldAlert, X } from "lucide-react";

interface SparepartsProps {
  spareparts: Sparepart[];
  variants: Variant[];
  categories: VehicleCategory[];
  suppliers: Supplier[];
  onAddPart: (part: any) => Promise<any>;
  onEditPart: (id: number, part: any) => Promise<any>;
  onDeletePart: (id: number) => Promise<any>;
  onAddVariant: (v: any) => Promise<any>;
  onEditVariant: (id: number, v: any) => Promise<any>;
  onDeleteVariant: (id: number) => Promise<any>;
  onAdjustStock: (payload: { variant_id: number; movement_type: 'IN' | 'OUT'; quantity: number; description: string }) => Promise<any>;
}

export default function Spareparts({
  spareparts,
  variants,
  categories,
  suppliers,
  onAddPart,
  onEditPart,
  onDeletePart,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onAdjustStock
}: SparepartsProps) {
  const [subTab, setSubTab] = useState<"variants" | "master">("variants");
  const [search, setSearch] = useState("");
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  
  // Selection/Edits target pointers
  const [editPart, setEditPart] = useState<Sparepart | null>(null);
  const [editVariant, setEditVariant] = useState<Variant | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Variant | null>(null);

  const [loading, setLoading] = useState(false);

  // Sparepart Master form fields
  const [partName, setPartName] = useState("");
  const [partDesc, setPartDesc] = useState("");
  const [partCatId, setPartCatId] = useState("");
  const [partError, setPartError] = useState("");

  // Variant form fields
  const [varPartId, setVarPartId] = useState("");
  const [varSupId, setVarSupId] = useState("");
  const [varName, setVarName] = useState("");
  const [varSku, setVarSku] = useState("");
  const [varBuying, setVarBuying] = useState("");
  const [varSelling, setVarSelling] = useState("0");
  const [varStock, setVarStock] = useState("0");
  const [varError, setVarError] = useState("");

  // Stock Adjustment form fields
  const [adjType, setAdjType] = useState<"IN" | "OUT">("IN");
  const [adjQty, setAdjQty] = useState("1");
  const [adjDesc, setAdjDesc] = useState("");
  const [adjError, setAdjError] = useState("");

  // Filtering
  const filteredParts = spareparts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVariants = variants.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.sku.toLowerCase().includes(search.toLowerCase()) ||
    (v.sparepart_name && v.sparepart_name.toLowerCase().includes(search.toLowerCase())) ||
    (v.supplier_name && v.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  // Open modal handlers
  const openAddPart = () => {
    setEditPart(null);
    setPartName("");
    setPartDesc("");
    setPartCatId(categories.length > 0 ? categories[0].vehicle_category_id.toString() : "");
    setPartError("");
    setPartModalOpen(true);
  };

  const openEditPart = (p: Sparepart) => {
    setEditPart(p);
    setPartName(p.name);
    setPartDesc(p.description);
    setPartCatId(p.vehicle_category_id.toString());
    setPartError("");
    setPartModalOpen(true);
  };

  const openAddVariant = () => {
    setEditVariant(null);
    setVarPartId(spareparts.length > 0 ? spareparts[0].sparepart_id.toString() : "");
    setVarSupId(suppliers.length > 0 ? suppliers[0].supplier_id.toString() : "");
    setVarName("");
    setVarSku("");
    setVarBuying("");
    setVarSelling("");
    setVarStock("0");
    setVarError("");
    setVariantModalOpen(true);
  };

  const openEditVariant = (v: Variant) => {
    setEditVariant(v);
    setVarPartId(v.sparepart_id.toString());
    setVarSupId(v.supplier_id.toString());
    setVarName(v.name);
    setVarSku(v.sku);
    setVarBuying(v.buying_price.toString());
    setVarSelling(v.selling_price.toString());
    setVarStock(v.stock.toString());
    setVarError("");
    setVariantModalOpen(true);
  };

  const openAdjustStock = (v: Variant) => {
    setAdjustTarget(v);
    setAdjType("IN");
    setAdjQty("1");
    setAdjDesc("Penyesuaian Manual Stok");
    setAdjError("");
    setAdjustModalOpen(true);
  };

  // Submit operations
  const handleSubmitPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !partCatId) {
      setPartError("Nama suku cadang utama dan kategori wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: partName.trim(),
        description: partDesc.trim(),
        vehicle_category_id: parseInt(partCatId)
      };
      if (editPart) {
        await onEditPart(editPart.sparepart_id, payload);
      } else {
        await onAddPart(payload);
      }
      setPartModalOpen(false);
    } catch {
      setPartError("Kegagalan menyimpan data kualifikasi ban/rem.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varPartId || !varSupId || !varName.trim() || !varSku.trim() || !varBuying || !varSelling) {
      setVarError("Seluruh kolom bertanda bintang (*) harus diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        sparepart_id: parseInt(varPartId),
        supplier_id: parseInt(varSupId),
        name: varName.trim(),
        sku: varSku.trim().toUpperCase(),
        buying_price: parseFloat(varBuying),
        selling_price: parseFloat(varSelling),
        stock: parseInt(varStock) || 0
      };
      if (editVariant) {
        await onEditVariant(editVariant.variant_id, payload);
      } else {
        await onAddVariant(payload);
      }
      setVariantModalOpen(false);
    } catch {
      setVarError("Struktur SKU ini mungkin sudah terpakai.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    if (!adjQty || parseInt(adjQty) <= 0) {
      setAdjError("Jumlah penyesuaian harus bernilai positif!");
      return;
    }
    setLoading(true);
    try {
      await onAdjustStock({
        variant_id: adjustTarget.variant_id,
        movement_type: adjType,
        quantity: parseInt(adjQty),
        description: adjDesc
      });
      setAdjustModalOpen(false);
    } catch {
      setAdjError("Terjadi error memproses pemindahan stok.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePart = async (id: number) => {
    if (confirm("Hapus master grup suku cadang ini?")) {
      await onDeletePart(id);
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (confirm("Hapus item spesifik suku cadang ini?")) {
      await onDeleteVariant(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs configuration */}
      <div className="flex border-b border-slate-100 bg-white p-2 rounded-xl shadow-sm gap-2">
        <button
          onClick={() => { setSubTab("variants"); setSearch(""); }}
          className={`flex-1 sm:flex-none text-center px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === "variants" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Daftar Suku Cadang & Stok
        </button>
        <button
          onClick={() => { setSubTab("master"); setSearch(""); }}
          className={`flex-1 sm:flex-none text-center px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            subTab === "master" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Master Kategori Suku Cadang
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder={subTab === "variants" ? "Cari nama, SKU, merk, atau supplier..." : "Cari klasifikasi suku cadang..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        
        {subTab === "variants" ? (
          <button 
            disabled={spareparts.length === 0}
            onClick={openAddVariant}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Tambah Item & Stok Suku Cadang
          </button>
        ) : (
          <button 
            onClick={openAddPart}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Buat Master Suku Cadang
          </button>
        )}
      </div>

      {/* Variants (Specific Models) List View */}
      {subTab === "variants" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredVariants.length === 0 ? (
            <div className="text-center py-16 text-slate-450 space-y-2">
              <Box className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium">Suku cadang belum tersedia</p>
              <p className="text-slate-450 text-xs">Isi master kategori suku cadang terlebih dahulu, lalu tambahkan item & stok penjualan di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6">Kode SKU</th>
                    <th className="p-4">Nama Suku Cadang</th>
                    <th className="p-4">Supplier Utama</th>
                    <th className="p-4">Harga Beli / Jual</th>
                    <th className="p-4 text-center">Stok Fisik</th>
                    <th className="p-4 pr-6 text-right w-44">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVariants.map((v) => (
                    <tr key={v.variant_id} className="hover:bg-slate-50/55">
                      <td className="p-4 pl-6 font-mono text-xs font-semibold text-slate-700">{v.sku}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-850">{v.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Himpunan: {v.sparepart_name}</div>
                      </td>
                      <td className="p-4 text-slate-550">{v.supplier_name || "-"}</td>
                      <td className="p-4">
                        <div className="text-xs text-slate-450">Beli: Rp {v.buying_price.toLocaleString("id-ID")}</div>
                        <div className="font-semibold text-emerald-600 mt-0.5">Jual: Rp {v.selling_price.toLocaleString("id-ID")}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                            v.stock === 0 ? "bg-rose-100 text-rose-800" :
                            v.stock < 5 ? "bg-amber-100 text-amber-800" :
                            "bg-teal-50 text-teal-800"
                          }`}>
                            {v.stock} unit
                          </span>
                          {v.stock < 5 && (
                            <span className="text-[9px] text-amber-650 flex items-center gap-0.5 mt-1 font-semibold">
                              <ShieldAlert className="w-2.5 h-2.5" /> Menipis
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openAdjustStock(v)}
                            className="p-1 px-2.5 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="Penyesuaian stok manual"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Adjust
                          </button>
                          <button 
                            onClick={() => openEditVariant(v)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVariant(v.variant_id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Sparepart Master Category View */}
      {subTab === "master" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredParts.length === 0 ? (
            <div className="text-center py-16 text-slate-450 space-y-2">
              <BarChart2 className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium">Master suku cadang masih kosong</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 pl-6 w-16 text-center">ID</th>
                    <th className="p-4">Nama Klasifikasi Suku Cadang</th>
                    <th className="p-4">Kompatibilitas Model Motor</th>
                    <th className="p-4">Informasi Deskripsi</th>
                    <th className="p-4 pr-6 text-right w-24">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredParts.map((p) => (
                    <tr key={p.sparepart_id} className="hover:bg-slate-50/55">
                      <td className="p-4 pl-6 text-center text-slate-450 font-mono text-xs">{p.sparepart_id}</td>
                      <td className="p-4 font-bold text-slate-800">{p.name}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          {p.category_name || "Semua Motor"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-xs truncate max-w-sm">{p.description || "-"}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openEditPart(p)}
                            className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePart(p.sparepart_id)}
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

      {/* Part Master Modal */}
      {partModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editPart ? "Ubah Master Suku Cadang" : "Buat Master Suku Cadang"}
              </h3>
              <button onClick={() => setPartModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitPart} className="p-6 space-y-4">
              {partError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">{partError}</div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Nama Klasifikasi *</label>
                <input 
                  type="text" 
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="Contoh: Oli Mesin, Kampas Rem, Ban Luar"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Kompatibilitas Tipe Motor *</label>
                <select 
                  value={partCatId}
                  onChange={(e) => setPartCatId(e.target.value)}
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
                <label className="text-xs font-semibold text-slate-500 uppercase">Perincian / Deskripsi</label>
                <textarea 
                  value={partDesc}
                  onChange={(e) => setPartDesc(e.target.value)}
                  placeholder="Contoh: Suku cadang khusus rem cakram depan"
                  rows={3}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setPartModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {variantModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editVariant ? "Ubah Item Suku Cadang" : "Tambah Item Suku Cadang Baru"}
              </h3>
              <button onClick={() => setVariantModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitVariant} className="p-6 space-y-4">
              {varError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">{varError}</div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Grup Master Suku Cadang *</label>
                <select 
                  value={varPartId}
                  onChange={(e) => setVarPartId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                >
                  {spareparts.map(sp => (
                    <option key={sp.sparepart_id} value={sp.sparepart_id}>{sp.name} - ({sp.category_name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Supplier Utama *</label>
                <select 
                  value={varSupId}
                  onChange={(e) => setVarSupId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Nama Produk Suku Cadang (Variant) *</label>
                <input 
                  type="text" 
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  placeholder="Contoh: Yamalube 0.8L, Castrol Power1 1L"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Kode SKU Toko / Serial Barcode *</label>
                <input 
                  type="text" 
                  value={varSku}
                  onChange={(e) => setVarSku(e.target.value)}
                  placeholder="Contoh: OLI-YAM-08L"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm uppercase outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-display">Harga Beli Bengkel *</label>
                  <input 
                    type="number" 
                    value={varBuying}
                    onChange={(e) => setVarBuying(e.target.value)}
                    placeholder="Contoh: 45000"
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-display">Harga Jual Kustomer *</label>
                  <input 
                    type="number" 
                    value={varSelling}
                    onChange={(e) => setVarSelling(e.target.value)}
                    placeholder="Contoh: 60000"
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-teal-700 font-mono"
                  />
                </div>
              </div>

              {!editVariant && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Stok Awal Fisik (Unit)</label>
                  <input 
                    type="number" 
                    value={varStock}
                    onChange={(e) => setVarStock(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold font-mono"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setVariantModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instant Inventory Adjust Modal */}
      {adjustModalOpen && adjustTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 font-display">
                Penyesuaian Stok Gudang
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAdjustment} className="p-5 space-y-4">
              <div className="bg-slate-100 p-3 rounded-lg text-xs space-y-1 mb-2">
                <div className="font-semibold text-slate-800">{adjustTarget.name}</div>
                <div className="text-slate-500">Stok Berjalan: <span className="font-bold text-slate-700">{adjustTarget.stock} unit</span></div>
              </div>

              {adjError && (
                <div className="p-2.5 bg-rose-50 text-rose-800 text-xs rounded-lg">{adjError}</div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arah Gerakan Stok *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType("IN")}
                    className={`p-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                      adjType === "IN" 
                        ? "bg-teal-50 text-teal-700 border-teal-550" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Masuk (Stock IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType("OUT")}
                    className={`p-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                      adjType === "OUT" 
                        ? "bg-rose-50 text-rose-700 border-rose-300" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Keluar (Stock OUT)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Jumlah Unit Penyesuaian *</label>
                <input 
                  type="number" 
                  min={1}
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Alasan Penyesuaian *</label>
                <input 
                  type="text" 
                  value={adjDesc}
                  onChange={(e) => setAdjDesc(e.target.value)}
                  placeholder="Contoh: Selisih audit stock opname, Barang rusak"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Koreksi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
