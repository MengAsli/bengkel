import React, { useState } from "react";
import { Employee, Role } from "../types";
import { Search, Plus, Edit2, Trash2, Users, Phone, Shield, CreditCard, X, User } from "lucide-react";

interface EmployeesProps {
  employees: Employee[];
  roles: Role[];
  onAdd: (emp: any) => Promise<any>;
  onEdit: (id: number, emp: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}

export default function Employees({ employees, roles, onAdd, onEdit, onDelete }: EmployeesProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nik, setNik] = useState("");
  const [roleId, setRoleId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.phone.includes(search) ||
    (e.nik && e.nik.includes(search)) ||
    (e.role_name && e.role_name.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setEditItem(null);
    setName("");
    setPhone("");
    setAddress("");
    setNik("");
    setRoleId(roles.length > 0 ? roles[0].role_id.toString() : "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item: Employee) => {
    setEditItem(item);
    setName(item.name);
    setPhone(item.phone);
    setAddress(item.addrress || "");
    setNik(item.nik || "");
    setRoleId(item.role_id.toString());
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !roleId) {
      setErrorMsg("Nama, Nomor HP, dan Peran Karyawan wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        addrress: address.trim(),
        nik: nik.trim(),
        role_id: parseInt(roleId)
      };

      if (editItem) {
        await onEdit(editItem.employee_id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setErrorMsg("Gagal menyimpan data karyawan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah anda yakin ingin memberhentikan karyawan ini dari sistem?")) {
      await onDelete(id);
    }
  };

  // Find salary for each role to display clearly
  const getSalaryInfo = (eRoleId: number) => {
    const roleObj = roles.find(r => r.role_id === eRoleId);
    return roleObj ? `Rp ${roleObj.salary.toLocaleString("id-ID")}` : "-";
  };

  return (
    <div className="space-y-6">
      {/* Header quick facts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-teal-50 text-teal-600 p-3 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Staf</h4>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{employees.length} Orang</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mekanik Handal</h4>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {employees.filter(e => e.role_id === 2).length} Mekanik
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimasi Gaji Pokok Bulg</h4>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              Rp {employees.reduce((acc, e) => {
                const roleObj = roles.find(r => r.role_id === e.role_id);
                return acc + (roleObj ? roleObj.salary : 0);
              }, 0).toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* Control buttons and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari staf, peran, nomor NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Staf Baru
        </button>
      </div>

      {/* Main Employee list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-450 space-y-2">
            <User className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-slate-500 font-medium font-display">Karyawan tidak ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 w-16 text-center">ID</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Peran (Role)</th>
                  <th className="p-4">Nomor HP</th>
                  <th className="p-4">NIK (KTP)</th>
                  <th className="p-4">Gaji Pokok</th>
                  <th className="p-4 pr-6 text-right w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((e) => (
                  <tr key={e.employee_id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{e.employee_id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-850">{e.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{e.addrress || "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        e.role_id === 1 ? "bg-amber-100 text-amber-800" :
                        e.role_id === 2 ? "bg-indigo-100 text-indigo-850" :
                        "bg-emerald-100 text-emerald-850"
                      }`}>
                        {e.role_name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-650 flex items-center gap-1.5 mt-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {e.phone}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{e.nik || "-"}</td>
                    <td className="p-4 font-semibold text-slate-700">{getSalaryInfo(e.role_id)}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(e)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(e.employee_id)}
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

      {/* Employee form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editItem ? "Ubah Staf Bengkel" : "Tambah Karyawan Baru"}
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
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap Karyawan *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No HP / WhatsApp *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peran (Position / Role) *</label>
                <select 
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  {roles.map(r => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name} ({`Gaji: Rp ${r.salary.toLocaleString("id-ID")}`})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIK (Sesuai KTP) (16 Digit)</label>
                <input 
                  type="text" 
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Contoh: 33140xxxxxxxxxxx"
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Tinggal</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Suka Ramai No 5, Tangerang"
                  rows={2}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 resize-none"
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
