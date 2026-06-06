import React, { useState } from "react";
import { Supplier, Variant } from "../types";
import { Search, Plus, Edit2, Trash2, ShieldAlert, Phone, Mail, MapPin, X, Store, Calendar, Users } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface SuppliersProps {
  suppliers: Supplier[];
  variants: Variant[];
  onAdd: (sup: any) => Promise<any>;
  onEdit: (id: number, sup: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}

export default function Suppliers({ 
  suppliers, 
  variants, 
  onAdd, 
  onEdit, 
  onDelete 
}: SuppliersProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);

  // Deletion Confirm Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats: count how many product variants are supplied by this supplier
  const getProductCountForSupplier = (sId: number) => {
    return variants.filter(v => v.supplier_id === sId && !v.deleted_at).length;
  };

  const openAddModal = () => {
    setEditItem(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item: Supplier) => {
    setEditItem(item);
    setName(item.name);
    setPhone(item.phone);
    setEmail(item.email || "");
    setAddress(item.address || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama supplier wajib diisi!");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Nomor telepon supplier wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim()
      };

      if (editItem) {
        await onEdit(editItem.supplier_id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setErrorMsg("Gagal menyimpan data supplier.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    const productsCount = getProductCountForSupplier(id);
    if (productsCount > 0) {
      setWarningMessage(`Tidak bisa menghapus supplier ini karena masih mensuplai ${productsCount} item suku cadang aktif! Harap ubah/pindahkan item suku cadang tersebut terlebih dahulu.`);
      setWarningModalOpen(true);
      return;
    }

    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const executeDeleteData = async () => {
    if (idToDelete !== null) {
      try {
        await onDelete(idToDelete);
      } catch (err: any) {
        setWarningMessage(err.message || "Gagal menghapus supplier.");
        setWarningModalOpen(true);
      } finally {
        setIdToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Manajemen Supplier</h2>
          <p className="text-slate-500 text-sm mt-1">Daftarkan dan kelola supplier eksternal penyuplai suku cadang serta material Bikini Bottom Garage.</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-teal-50 text-teal-600 p-3 rounded-lg">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Supplier</h4>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{suppliers.length} Supplier</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Terhubung Suku Cadang</h4>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {suppliers.filter(s => getProductCountForSupplier(s.supplier_id) > 0).length} Supplier Aktif
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tanpa Suku Cadang</h4>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {suppliers.filter(s => getProductCountForSupplier(s.supplier_id) === 0).length} Supplier Baru
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari supplier, telpon, email, alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Supplier Baru
        </button>
      </div>

      {/* Suppliers List Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2 col-span-full">
            <Store className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-slate-500 font-medium font-display">Supplier tidak ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 w-16 text-center">ID</th>
                  <th className="p-4">Nama Supplier</th>
                  <th className="p-4">No Telepon / HP</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Alamat Kantor</th>
                  <th className="p-4 text-center w-40">Item Suku Cadang</th>
                  <th className="p-4 pr-6 text-right w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSuppliers.map((s) => (
                  <tr key={s.supplier_id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-450 font-mono text-xs">{s.supplier_id}</td>
                    <td className="p-4 font-bold text-slate-800">{s.name}</td>
                    <td className="p-4 text-slate-655 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {s.phone}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs">
                      {s.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {s.email}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {s.address ? (
                        <div className="flex items-center gap-1.5 max-w-[220px]">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{s.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center font-bold font-mono px-2.5 py-0.5 rounded-full text-xs ${getProductCountForSupplier(s.supplier_id) > 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
                        {getProductCountForSupplier(s.supplier_id)} Item
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(s)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.supplier_id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
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

      {/* ----------------------------------------------------
          MODAL WINDOW
          ---------------------------------------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-155">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editItem ? "Ubah Data Supplier" : "Tambah Supplier Baru"}
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
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Supplier *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Astra Otoparts"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor HP / Telepon *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890 atau 021-xxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Kantor</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: sales@astra-otoparts.co.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Kawasan Industri Pulogadung, Jakarta Timur"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier delete confirm modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Hapus Supplier"
        message="Apakah Anda yakin ingin menghapus data supplier ini dari sistem?"
        onConfirm={executeDeleteData}
        onCancel={() => {
          setConfirmOpen(false);
          setIdToDelete(null);
        }}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />

      {/* Supplier warning/restriction modal */}
      <ConfirmModal
        isOpen={warningModalOpen}
        title="Tindakan Ditolak"
        message={warningMessage}
        onConfirm={() => setWarningModalOpen(false)}
        onCancel={() => setWarningModalOpen(false)}
        confirmText="Dimengerti"
        cancelText="Tutup"
        variant="warning"
      />
    </div>
  );
}
