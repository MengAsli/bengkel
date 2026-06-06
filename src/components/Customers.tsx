import React, { useState } from "react";
import { Customer } from "../types";
import { Search, Plus, Edit2, Trash2, Mail, Phone, MapPin, X, User } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface CustomersProps {
  customers: Customer[];
  onAdd: (cust: any) => Promise<any>;
  onEdit: (id: number, cust: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}

export default function Customers({ customers, onAdd, onEdit, onDelete }: CustomersProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  // Deletion Confirm Modal States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditItem(null);
    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item: Customer) => {
    setEditItem(item);
    setName(item.name);
    setPhone(item.phone);
    setAddress(item.address);
    setEmail(item.email || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("Nama, Nomor HP, dan Alamat harus diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = { name, phone, address, email };
      if (editItem) {
        await onEdit(editItem.customers_id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg("Terjadi kegagalan memproses data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const executeDeleteData = async () => {
    if (idToDelete !== null) {
      await onDelete(idToDelete);
      setIdToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari nama, nomor HP, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-teal-100 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Registrasi Pelanggan
        </button>
      </div>

      {/* Main Customers List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-450 space-y-2">
            <User className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-slate-500 font-medium">Belum ada pelanggan terdaftar</p>
            <p className="text-slate-400 text-xs text-center max-w-sm mx-auto">Klik tombol "Registrasi Pelanggan" untuk memasukkan data pelanggan baru ke sistem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 text-center w-12">ID</th>
                  <th className="p-4">Informasi Pelanggan</th>
                  <th className="p-4">Nomor Kontak (HP)</th>
                  <th className="p-4">Alamat Domisili</th>
                  <th className="p-4 pr-6 text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((c) => (
                  <tr key={c.customers_id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{c.customers_id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-850">{c.name}</div>
                      {c.email && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-300" />
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        {c.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-1.5 text-slate-600 max-w-xs">
                        <MapPin className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{c.address}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(c)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          title="Ubah pelanggan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.customers_id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Hapus pelanggan"
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

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editItem ? "Ubah Data Pelanggan" : "Registrasi Pelanggan Baru"}
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Pelanggan *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Andi Wijaya"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor HP / WhatsApp *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Email (Opsional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: andi@gmail.com"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Domisili *</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jln. Merdeka No 12, Tangerang"
                  rows={3}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
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
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 rounded-xl transition-all cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Hapus Pelanggan"
        message="Apakah Anda yakin ingin menghapus pelanggan ini dari sistem? Tindakan ini tidak dapat dibatalkan secara langsung."
        onConfirm={executeDeleteData}
        onCancel={() => {
          setConfirmOpen(false);
          setIdToDelete(null);
        }}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
