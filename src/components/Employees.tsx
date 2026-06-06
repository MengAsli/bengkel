import React, { useState } from "react";
import { Employee, Role } from "../types";
import { Search, Plus, Edit2, Trash2, Users, Phone, Shield, CreditCard, X, User, Briefcase, DollarSign, Layers } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface EmployeesProps {
  employees: Employee[];
  roles: Role[];
  onAdd: (emp: any) => Promise<any>;
  onEdit: (id: number, emp: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
  onAddRole: (role: any) => Promise<any>;
  onEditRole: (id: number, role: any) => Promise<any>;
  onDeleteRole: (id: number) => Promise<any>;
}

export default function Employees({ 
  employees, 
  roles, 
  onAdd, 
  onEdit, 
  onDelete,
  onAddRole,
  onEditRole,
  onDeleteRole
}: EmployeesProps) {
  const [activeSubTab, setActiveSubTab] = useState<"employees" | "roles">("employees");
  const [loading, setLoading] = useState(false);

  // Deletion Confirm Modal States
  const [empConfirmOpen, setEmpConfirmOpen] = useState(false);
  const [empIdToDelete, setEmpIdToDelete] = useState<number | null>(null);
  
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [roleIdToDelete, setRoleIdToDelete] = useState<number | null>(null);
  
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ----------------------------------------------------
  // EMPLOYEE STATE & FORM
  // ----------------------------------------------------
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editEmployeeItem, setEditEmployeeItem] = useState<Employee | null>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nik, setNik] = useState("");
  const [roleId, setRoleId] = useState("");
  const [employeeErrorMsg, setEmployeeErrorMsg] = useState("");

  // ----------------------------------------------------
  // ROLE STATE & FORM
  // ----------------------------------------------------
  const [roleSearch, setRoleSearch] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editRoleItem, setEditRoleItem] = useState<Role | null>(null);

  const [roleName, setRoleName] = useState("");
  const [roleSalary, setRoleSalary] = useState("");
  const [roleErrorMsg, setRoleErrorMsg] = useState("");

  // Filter Employees
  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.phone.includes(employeeSearch) ||
    (e.nik && e.nik.includes(employeeSearch)) ||
    (e.role_name && e.role_name.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  // Filter Roles
  const filteredRoles = roles.filter(r => 
    r.role_name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  // Utility to find mapped employees count per role
  const getEmployeeCountForRole = (rId: number) => {
    return employees.filter(e => e.role_id === rId).length;
  };

  // ----------------------------------------------------
  // EMPLOYEE MODAL OPERATIONS
  // ----------------------------------------------------
  const openAddEmployeeModal = () => {
    setEditEmployeeItem(null);
    setName("");
    setPhone("");
    setAddress("");
    setNik("");
    setRoleId(roles.length > 0 ? roles[0].role_id.toString() : "");
    setEmployeeErrorMsg("");
    setEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (item: Employee) => {
    setEditEmployeeItem(item);
    setName(item.name);
    setPhone(item.phone);
    setAddress(item.addrress || "");
    setNik(item.nik || "");
    setRoleId(item.role_id.toString());
    setEmployeeErrorMsg("");
    setEmployeeModalOpen(true);
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !roleId) {
      setEmployeeErrorMsg("Nama, Nomor HP, dan Peran Karyawan wajib diisi!");
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

      if (editEmployeeItem) {
        await onEdit(editEmployeeItem.employee_id, payload);
      } else {
        await onAdd(payload);
      }
      setEmployeeModalOpen(false);
    } catch (err) {
      setEmployeeErrorMsg("Gagal menyimpan data karyawan.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeDelete = (id: number) => {
    setEmpIdToDelete(id);
    setEmpConfirmOpen(true);
  };

  const executeEmployeeDelete = async () => {
    if (empIdToDelete !== null) {
      try {
        await onDelete(empIdToDelete);
      } catch (err: any) {
        setWarningMessage(err.message || "Gagal menghapus karyawan.");
        setWarningModalOpen(true);
      } finally {
        setEmpIdToDelete(null);
      }
    }
  };

  const getSalaryInfo = (eRoleId: number) => {
    const roleObj = roles.find(r => r.role_id === eRoleId);
    return roleObj ? `Rp ${roleObj.salary.toLocaleString("id-ID")}` : "-";
  };

  // ----------------------------------------------------
  // ROLE MODAL OPERATIONS
  // ----------------------------------------------------
  const openAddRoleModal = () => {
    setEditRoleItem(null);
    setRoleName("");
    setRoleSalary("");
    setRoleErrorMsg("");
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (item: Role) => {
    setEditRoleItem(item);
    setRoleName(item.role_name);
    setRoleSalary(item.salary.toString());
    setRoleErrorMsg("");
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleSalary.trim()) {
      setRoleErrorMsg("Nama Peran dan Gaji Pokok wajib diisi!");
      return;
    }
    
    const salaryNum = parseFloat(roleSalary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      setRoleErrorMsg("Gaji Pokok harus diisi nilai angka positif!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role_name: roleName.trim(),
        salary: salaryNum
      };

      if (editRoleItem) {
        await onEditRole(editRoleItem.role_id, payload);
      } else {
        await onAddRole(payload);
      }
      setRoleModalOpen(false);
    } catch (err) {
      setRoleErrorMsg("Gagal menyimpan data peran.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleDelete = (id: number) => {
    const assignedCount = getEmployeeCountForRole(id);
    if (assignedCount > 0) {
      setWarningMessage(`Tidak bisa menghapus peran ini karena masih digunakan oleh ${assignedCount} karyawan aktif! Harap ubah dulu peran karyawan tersebut.`);
      setWarningModalOpen(true);
      return;
    }

    setRoleIdToDelete(id);
    setRoleConfirmOpen(true);
  };

  const executeRoleDelete = async () => {
    if (roleIdToDelete !== null) {
      try {
        setRoleErrorMsg("");
        await onDeleteRole(roleIdToDelete);
      } catch (err: any) {
        setRoleErrorMsg(err.message || "Gagal menghapus peran/role.");
      } finally {
        setRoleIdToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("employees")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "employees"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Karyawan
        </button>
        <button
          onClick={() => setActiveSubTab("roles")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "roles"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Manajemen Peran & Gaji
        </button>
      </div>

      {activeSubTab === "employees" ? (
        <>
          {/* Header Employee Stats */}
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
                  {employees.filter(e => e.role_id === 2 || (roles.find(r => r.role_id === e.role_id)?.role_name.toLowerCase().includes("mekanik"))).length} Mekanik
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimasi Gaji Pokok</h4>
                <div className="text-lg font-bold text-slate-800 mt-0.5">
                  Rp {employees.reduce((acc, e) => {
                    const roleObj = roles.find(r => r.role_id === e.role_id);
                    return acc + (roleObj ? roleObj.salary : 0);
                  }, 0).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>

          {/* Control Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder="Cari staf, peran, nomor NIK..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
              />
            </div>
            <button 
              onClick={openAddEmployeeModal}
              disabled={roles.length === 0}
              className={`flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center ${roles.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Plus className="w-4 h-4" />
              Tambah Staf Baru
            </button>
          </div>

          {/* Create Roles Warning */}
          {roles.length === 0 && (
            <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 font-medium">
              Database belum memiliki definisi peran (role). Harap tambahkan Peran baru di tab <strong>"Manajemen Peran & Gaji"</strong> terlebih dahulu agar dapat mendaftarkan karyawan.
            </div>
          )}

          {/* Employee list Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredEmployees.length === 0 ? (
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
                    {filteredEmployees.map((e) => (
                      <tr key={e.employee_id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{e.employee_id}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{e.name}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{e.addrress || "-"}</div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {e.role_name}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 flex items-center gap-1.5 mt-2.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {e.phone}
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{e.nik || "-"}</td>
                        <td className="p-4 font-semibold text-slate-700">{getSalaryInfo(e.role_id)}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openEditEmployeeModal(e)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEmployeeDelete(e.employee_id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
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
        </>
      ) : (
        <>
          {/* Header Roles Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-teal-50 text-teal-600 p-3 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Definisi Peran</h4>
                <div className="text-xl font-bold text-slate-800 mt-0.5">{roles.length} Posisi</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rata-rata Gaji</h4>
                <div className="text-xl font-bold text-slate-800 mt-0.5 font-sans">
                  Rp {roles.length > 0 ? Math.round(roles.reduce((acc, r) => acc + r.salary, 0) / roles.length).toLocaleString("id-ID") : "0"}
                </div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Maksimal Gaji</h4>
                <div className="text-lg font-bold text-slate-800 mt-0.5 font-sans">
                  Rp {roles.length > 0 ? Math.max(...roles.map(r => r.salary)).toLocaleString("id-ID") : "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Control Filter Bar for roles */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder="Cari peran..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
              />
            </div>
            <button 
              onClick={openAddRoleModal}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Tambah Peran (Role) Baru
            </button>
          </div>

          {roleErrorMsg && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm font-semibold flex justify-between items-center animate-in fade-in duration-200">
              <span>{roleErrorMsg}</span>
              <button onClick={() => setRoleErrorMsg("")} className="text-rose-500 hover:text-rose-700 font-mono text-base px-2">×</button>
            </div>
          )}

          {/* Roles list Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredRoles.length === 0 ? (
              <div className="text-center py-16 text-slate-450 space-y-2">
                <Briefcase className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
                <p className="text-slate-500 font-medium font-display">Peran tidak ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-4 pl-6 w-20 text-center">ID</th>
                      <th className="p-4">Nama Peran / Posisi</th>
                      <th className="p-4">Gaji Pokok Bulanan</th>
                      <th className="p-4 text-center w-40">Jumlah Staf Aktif</th>
                      <th className="p-4 pr-6 text-right w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredRoles.map((r) => (
                      <tr key={r.role_id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{r.role_id}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{r.role_name}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          Rp {r.salary.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center justify-center font-bold font-mono px-2.5 py-0.5 rounded-full text-xs ${getEmployeeCountForRole(r.role_id) > 0 ? "bg-teal-55 text-teal-800" : "bg-slate-100 text-slate-400"}`}>
                            {getEmployeeCountForRole(r.role_id)} Orang
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openEditRoleModal(r)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRoleDelete(r.role_id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
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
        </>
      )}

      {/* ----------------------------------------------------
          EMPLOYEE MODAL WINDOW
          ---------------------------------------------------- */}
      {employeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-155">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editEmployeeItem ? "Ubah Staf Bengkel" : "Tambah Karyawan Baru"}
              </h3>
              <button 
                onClick={() => setEmployeeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-4">
              {employeeErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-semibold">
                  {employeeErrorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap Karyawan *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No HP / WhatsApp *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
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
                    <option key={r.role_id} value={r.role_id}>{r.role_name} (Gaji: Rp {r.salary.toLocaleString("id-ID")})</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Tinggal</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Suka Ramai No 5, Tangerang"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEmployeeModalOpen(false)}
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

      {/* ----------------------------------------------------
          ROLE MODAL WINDOW
          ---------------------------------------------------- */}
      {roleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-155">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                {editRoleItem ? "Ubah Peran (Role)" : "Tambah Peran (Role) Baru"}
              </h3>
              <button 
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRoleSubmit} className="p-6 space-y-4">
              {roleErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-semibold">
                  {roleErrorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Peran / Jabatan *</label>
                <input 
                  type="text" 
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Contoh: Mekanik Senior, Kasir Malam"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gaji Pokok Bulanan (IDR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">Rp</span>
                  <input 
                    type="number" 
                    value={roleSalary}
                    onChange={(e) => setRoleSalary(e.target.value)}
                    placeholder="Contoh: 3500000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Peran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Deletion Confirm */}
      <ConfirmModal
        isOpen={empConfirmOpen}
        title="Pemberhentian Karyawan"
        message="Apakah Anda yakin ingin menonaktifkan atau memberhentikan karyawan ini dari sistem?"
        onConfirm={executeEmployeeDelete}
        onCancel={() => {
          setEmpConfirmOpen(false);
          setEmpIdToDelete(null);
        }}
        confirmText="Ya, Berhentikan"
        cancelText="Batal"
        variant="danger"
      />

      {/* Role Deletion Confirm */}
      <ConfirmModal
        isOpen={roleConfirmOpen}
        title="Hapus Peran (Role)"
        message="Apakah Anda yakin ingin menghapus peran/role ini dari database? Tindakan ini permanen."
        onConfirm={executeRoleDelete}
        onCancel={() => {
          setRoleConfirmOpen(false);
          setRoleIdToDelete(null);
        }}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />

      {/* Warning/Restriction Modal */}
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
