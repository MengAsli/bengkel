import React, { useState, useEffect } from "react";
import { MainReceipt, Customer, Vehicle, Employee, Variant, ServiceDetail } from "../types";
import { Search, Plus, Receipt, Printer, X, Trash2, Tag, Calendar, User, ShoppingCart } from "lucide-react";

interface ReceiptsProps {
  receipts: MainReceipt[];
  customers: Customer[];
  vehicles: Vehicle[];
  employees: Employee[];
  variants: Variant[];
  servicesDetails: ServiceDetail[];
  onCreateReceipt: (payload: any) => Promise<any>;
  // To allow opening from other tabs with custom values (e.g. from WorkOrders)
  posPreload: any | null;
  clearPosPreload: () => void;
}

export default function Receipts({
  receipts,
  customers,
  vehicles,
  employees,
  variants,
  servicesDetails,
  onCreateReceipt,
  posPreload,
  clearPosPreload
}: ReceiptsProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "pos">("list");
  const [viewDetail, setViewDetail] = useState<any | null>(null);

  // POS State fields
  const [posCustomerId, setPosCustomerId] = useState("");
  const [posVehicleId, setPosVehicleId] = useState("");
  const [posEmployeeId, setPosEmployeeId] = useState("");
  const [posWorkOrderId, setPosWorkOrderId] = useState<number | null>(null);
  
  // Dynamic lists of items in invoice
  const [selectedSpareparts, setSelectedSpareparts] = useState<Array<{ variant_id: number; quantity: number; unit_price: number; subtotal: number }>>([]);
  const [selectedServices, setSelectedServices] = useState<Array<{ service_detail_id: number; price: number }>>([]);
  const [discount, setDiscount] = useState("0");
  const [posError, setPosError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Temporary selectors in POS
  const [tempSparepartId, setTempSparepartId] = useState("");
  const [tempSparepartQty, setTempSparepartQty] = useState("1");
  const [tempServiceId, setTempServiceId] = useState("");

  // Handle POS Preload immediately on tab change/load
  useEffect(() => {
    if (posPreload) {
      setPosCustomerId(posPreload.customer_id.toString());
      setPosVehicleId(posPreload.vehicle_id.toString());
      setPosWorkOrderId(posPreload.work_order_id);
      
      // Select first employee as placeholder
      if (employees.length > 0) {
        setPosEmployeeId(employees[0].employee_id.toString());
      }
      
      // Auto switch to POS view
      setActiveTab("pos");
      clearPosPreload();
    }
  }, [posPreload]);

  // Adjust POS sub-selection options
  const posCustomerVehicles = vehicles.filter(v => v.customer_id === parseInt(posCustomerId));

  // Spareparts available list with stock filter
  const activeVariants = variants.filter(v => v.stock > 0);

  // Sum totals dynamically
  const sparepartsSubtotal = selectedSpareparts.reduce((acc, sp) => acc + sp.subtotal, 0);
  const servicesSubtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const subtotalSum = sparepartsSubtotal + servicesSubtotal;
  const discountVal = parseFloat(discount) || 0;
  const grandtotalSum = Math.max(0, subtotalSum - discountVal);

  const addSparepartToInvoice = () => {
    if (!tempSparepartId) return;
    const variantId = parseInt(tempSparepartId);
    const qty = parseInt(tempSparepartQty) || 1;
    const variantItem = variants.find(v => v.variant_id === variantId);
    if (!variantItem) return;

    if (qty > variantItem.stock) {
      alert(`Stok tidak mencukupi! Persediaan tersisa: ${variantItem.stock} unit.`);
      return;
    }

    // Check if copy already exists in current list
    const existingIndex = selectedSpareparts.findIndex(sp => sp.variant_id === variantId);
    if (existingIndex !== -1) {
      const updated = [...selectedSpareparts];
      const newQty = updated[existingIndex].quantity + qty;
      if (newQty > variantItem.stock) {
        alert(`Jumlah gabungan melebihi sisa stok (${variantItem.stock} unit).`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * updated[existingIndex].unit_price;
      setSelectedSpareparts(updated);
    } else {
      setSelectedSpareparts([
        ...selectedSpareparts,
        {
          variant_id: variantId,
          quantity: qty,
          unit_price: variantItem.selling_price,
          subtotal: qty * variantItem.selling_price
        }
      ]);
    }
    setTempSparepartId("");
    setTempSparepartQty("1");
  };

  const removeSparepartFromInvoice = (index: number) => {
    setSelectedSpareparts(selectedSpareparts.filter((_, i) => i !== index));
  };

  const addServiceToInvoice = () => {
    if (!tempServiceId) return;
    const sDetailId = parseInt(tempServiceId);
    const detailObj = servicesDetails.find(sd => sd.services_detail_id === sDetailId);
    if (!detailObj) return;

    // Prevent duplicates in same invoice
    if (selectedServices.some(s => s.service_detail_id === sDetailId)) {
      alert("Servis ini sudah dimasukkan ke dalam daftar!");
      return;
    }

    setSelectedServices([
      ...selectedServices,
      {
        service_detail_id: sDetailId,
        price: detailObj.price
      }
    ]);
    setTempServiceId("");
  };

  const removeServiceFromInvoice = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posCustomerId || !posVehicleId || !posEmployeeId) {
      setPosError("Pelanggan, Motor, dan Mekanik penanggung jawab harus dipilih!");
      return;
    }
    if (selectedSpareparts.length === 0 && selectedServices.length === 0) {
      setPosError("Invoice tidak boleh kosong! Tambahkan minimal satu suku cadang atau satu jasa servis.");
      return;
    }

    setSubmitting(true);
    setPosError("");
    try {
      const resultObj = await onCreateReceipt({
        customer_id: parseInt(posCustomerId),
        vehicle_id: parseInt(posVehicleId),
        employee_id: parseInt(posEmployeeId),
        work_order_id: posWorkOrderId,
        sparepart_subtotal: sparepartsSubtotal,
        services_subtotal: servicesSubtotal,
        subtotal: subtotalSum,
        discount: discountVal,
        grandtotal: grandtotalSum,
        spareparts: selectedSpareparts,
        services: selectedServices
      });

      // Clear everything and return to receipt ledger
      setSelectedSpareparts([]);
      setSelectedServices([]);
      setDiscount("0");
      setPosCustomerId("");
      setPosVehicleId("");
      setPosEmployeeId("");
      setPosWorkOrderId(null);
      setActiveTab("list");
      
      // Auto open detailed print preview
      handleOpenDetail(resultObj.receipt_number);
    } catch {
      setPosError("Gagal memproses pembuatan tagihan transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = async (receiptNum: number) => {
    try {
      const res = await fetch(`/api/receipts/${receiptNum}`);
      const data = await res.json();
      setViewDetail(data);
    } catch {
      alert("Gagal mematangkan data nota detail.");
    }
  };

  const printReceipt = () => {
    window.print();
  };

  // Filter receipt lists
  const filteredReceipts = receipts.filter(r => 
    r.receipt_number.toString().includes(search) ||
    (r.customer_name && r.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (r.plate_number && r.plate_number.toLowerCase().includes(search.toLowerCase()))
  ).reverse();

  return (
    <div className="space-y-6">
      {/* Tab controls */}
      <div className="flex border-b border-slate-100 bg-white p-2 rounded-xl shadow-sm gap-2 print:hidden">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 sm:flex-none text-center px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "list" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Bukti & Histori Transaksi
        </button>
        <button
          onClick={() => {
            setActiveTab("pos");
            // Set first selects if empty
            if (customers.length > 0 && !posCustomerId) setPosCustomerId(customers[0].customers_id.toString());
            if (employees.length > 0 && !posEmployeeId) setPosEmployeeId(employees[0].employee_id.toString());
          }}
          className={`flex-1 sm:flex-none text-center px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "pos" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Mesin Kasir (POS Bengkel)
        </button>
      </div>

      {/* RENDER MASTER INVOICES LIST */}
      {activeTab === "list" && (
        <div className="space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="relative w-full sm:w-85">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder="Cari nomor nota, pemilik, plat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
              />
            </div>
            
            <button 
              onClick={() => {
                if (customers.length > 0) setPosCustomerId(customers[0].customers_id.toString());
                if (employees.length > 0) setPosEmployeeId(employees[0].employee_id.toString());
                setActiveTab("pos");
              }}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Buka Tagihan Baru
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-16 text-slate-450 space-y-2">
                <Receipt className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
                <p className="text-slate-500 font-medium font-display">Belum ada nota transaksi</p>
                <p className="text-slate-400 text-xs text-center max-w-sm mx-auto">Masuk ke sub-menu "Mesin Kasir" untuk mengeluarkan struk pembayaran pertama.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                      <th className="p-4 pl-6 text-center w-24">No. Nota</th>
                      <th className="p-4">Tanggal Pembayaran</th>
                      <th className="p-4">Pemilik & Plat Motor</th>
                      <th className="p-4">Penanggung Jawab (Mekanik)</th>
                      <th className="p-4 text-right">Potongan</th>
                      <th className="p-4 text-right">Total Akhir (Grandtotal)</th>
                      <th className="p-4 pr-6 text-right w-24">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredReceipts.map((r) => (
                      <tr key={r.receipt_number} className="hover:bg-slate-55/60 transition-colors">
                        <td className="p-4 pl-6 text-center font-mono font-bold text-slate-800">#{r.receipt_number}</td>
                        <td className="p-4 text-slate-500 text-xs">
                          {new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-850">{r.customer_name}</div>
                          <div className="text-[10px] font-bold text-indigo-650 mt-0.5 tracking-wider">{r.plate_number}</div>
                        </td>
                        <td className="p-4 text-slate-600 font-semibold">{r.employee_name || "-"}</td>
                        <td className="p-4 text-right text-rose-600 font-mono text-xs">
                          {r.discount > 0 ? `-Rp ${r.discount.toLocaleString("id-ID")}` : "-"}
                        </td>
                        <td className="p-4 text-right font-bold text-teal-700 font-mono">
                          Rp {r.grandtotal.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleOpenDetail(r.receipt_number)}
                            className="bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 p-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <Printer className="w-3.5 h-3.5" /> Cetak
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER POS INVOICE CREATOR */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          {/* LEFT SIDE: POS SETUP & ATTACHMENT */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer & Vehicle Selectors */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 font-display flex items-center gap-1.5 pb-2 border-b border-slate-50">
                <ShoppingCart className="w-5 h-5 text-teal-600" /> Pengaturan POS & Identitas Kendaraan
              </h3>

              {posError && (
                <div className="p-3 bg-rose-55 text-rose-800 text-xs font-semibold rounded-xl">{posError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select client */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Pelanggan Sasar *</label>
                  <select
                    value={posCustomerId}
                    onChange={(e) => {
                      setPosCustomerId(e.target.value);
                      const matchingV = vehicles.find(v => v.customer_id === parseInt(e.target.value));
                      setPosVehicleId(matchingV ? matchingV.vehicle_id.toString() : "");
                    }}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.customers_id} value={c.customers_id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                {/* Selected client motor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Motor Pelanggan *</label>
                  {posCustomerVehicles.length === 0 ? (
                    <div className="text-xs text-rose-500 p-2.5 bg-rose-50 rounded-xl font-medium">Pelanggan ini belum mendaftarkan motor!</div>
                  ) : (
                    <select
                      value={posVehicleId}
                      onChange={(e) => setPosVehicleId(e.target.value)}
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                    >
                      {posCustomerVehicles.map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>{v.plate_number} - {v.category_name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Employee mekanik selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Mekanik Penanggung Jawab *</label>
                  <select
                    value={posEmployeeId}
                    onChange={(e) => setPosEmployeeId(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    {employees.map(e => (
                      <option key={e.employee_id} value={e.employee_id}>{e.name} ({e.role_name})</option>
                    ))}
                  </select>
                </div>

                {/* Work order linking information */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Referensi Kerja (Work Order)</label>
                  <div className="bg-slate-100 px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-655 flex items-center justify-between">
                    <span>{posWorkOrderId ? `WO #${posWorkOrderId} terhubung` : "Penjualan Umum (No WO)"}</span>
                    {posWorkOrderId && (
                      <button 
                        type="button" 
                        onClick={() => setPosWorkOrderId(null)}
                        className="text-slate-450 hover:text-slate-700 underline text-[10px]"
                      >
                        Hapus Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoicing adders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Variant Addition */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 font-display text-sm">Tambahkan Suku Cadang & Oli</h4>
                {activeVariants.length === 0 ? (
                  <p className="text-xs text-slate-400">Seluruh persediaan suku cadang berjalan habis</p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-405 font-bold uppercase">Nama Suku Cadang *</label>
                      <select 
                        value={tempSparepartId}
                        onChange={(e) => setTempSparepartId(e.target.value)}
                        className="w-full bg-slate-50 p-2 rounded-lg text-xs outline-none"
                      >
                        <option value="">-- Pilih Suku Cadang --</option>
                        {activeVariants.map(v => (
                          <option key={v.variant_id} value={v.variant_id}>
                            {v.name} ({v.sku}) - Rp {v.selling_price.toLocaleString("id-ID")} [Sisa: {v.stock} unit]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-slate-405 font-bold uppercase">Jumlah Unit</label>
                        <input
                          type="number"
                          min={1}
                          value={tempSparepartQty}
                          onChange={(e) => setTempSparepartQty(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addSparepartToInvoice}
                        className="mt-5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold py-2 cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Labor addition */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 font-display text-sm">Tambahkan Jasa Perbaikan (Labor)</h4>
                {servicesDetails.length === 0 ? (
                  <p className="text-xs text-slate-400">Jasa servis tidak tersedia</p>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-405 font-bold uppercase">Nama Jenis Servis *</label>
                      <select 
                        value={tempServiceId}
                        onChange={(e) => setTempServiceId(e.target.value)}
                        className="w-full bg-slate-50 p-2 rounded-lg text-xs outline-none"
                      >
                        <option value="">-- Pilih Jasa Servis --</option>
                        {servicesDetails.map(sd => (
                          <option key={sd.services_detail_id} value={sd.services_detail_id}>
                            {sd.service_name} ({sd.category_name}) - Rp {sd.price.toLocaleString("id-ID")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addServiceToInvoice}
                      className="w-full bg-slate-800 hover:bg-slate-905 text-white rounded-lg text-xs font-semibold py-2 cursor-pointer"
                    >
                      + Tambah Jasa Ke Invoice
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Current Item breakdown list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 font-display text-sm">Keranjang Transaksi Berjalan</h4>
              
              {selectedSpareparts.length === 0 && selectedServices.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">Belum ada item ditambahkan ke keranjang POS ini.</p>
              ) : (
                <div className="space-y-4">
                  {/* Suku cadang items */}
                  {selectedSpareparts.length > 0 && (
                    <div className="space-y-2.5">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Barang Suku Cadang</h5>
                      {selectedSpareparts.map((sp, idx) => {
                        const originalVar = variants.find(v => v.variant_id === sp.variant_id);
                        return (
                          <div key={sp.variant_id} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl">
                            <div>
                              <div className="font-bold text-slate-800">{originalVar ? originalVar.name : "Sparepart"}</div>
                              <div className="text-slate-450 mt-0.5">{sp.quantity} unit x Rp {sp.unit_price.toLocaleString("id-ID")}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-700">Rp {sp.subtotal.toLocaleString("id-ID")}</span>
                              <button 
                                type="button" 
                                onClick={() => removeSparepartFromInvoice(idx)}
                                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Jasa service items */}
                  {selectedServices.length > 0 && (
                    <div className="space-y-2.5">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Biaya Jasa Mekanik / Labor</h5>
                      {selectedServices.map((s, idx) => {
                        const originalSDetails = servicesDetails.find(sd => sd.services_detail_id === s.service_detail_id);
                        return (
                          <div key={s.service_detail_id} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl">
                            <div>
                              <div className="font-bold text-slate-800">{originalSDetails ? originalSDetails.service_name : "Servis"}</div>
                              <div className="text-slate-400 mt-0.5">{originalSDetails ? originalSDetails.category_name : ""}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-705">Rp {s.price.toLocaleString("id-ID")}</span>
                              <button 
                                type="button" 
                                onClick={() => removeServiceFromInvoice(idx)}
                                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: POS TOTAL BILL CALCULATOR */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg h-fit space-y-6">
            <div className="space-y-6">
              <h3 className="font-bold text-white font-display text-sm pb-3 border-b border-white/10 flex items-center justify-between">
                <span>Rangkuman Pembayaran</span>
                <span className="text-[10px] bg-teal-500 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded">Bengkel POS</span>
              </h3>

              <div className="space-y-3.5 text-xs text-white/80">
                <div className="flex justify-between">
                  <span>Subtotal Suku Cadang:</span>
                  <span className="font-mono">Rp {sparepartsSubtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Jasa Reparasi:</span>
                  <span className="font-mono">Rp {servicesSubtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-white/10 pt-3.5 flex justify-between">
                  <span>Jumlah Subtotal:</span>
                  <span className="font-mono font-bold text-white">Rp {subtotalSum.toLocaleString("id-ID")}</span>
                </div>

                {/* Discount inputs */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Potongan Manual (Discount Rupiah)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 p-2.5 rounded-xl font-mono text-center text-sm font-bold text-white outline-none focus:border-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Grandtotal and checkout save */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="space-y-1 text-center">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Grandtotal Tagihan</span>
                <div className="text-2xl font-bold font-mono text-teal-400">
                  Rp {grandtotalSum.toLocaleString("id-ID")}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateInvoiceSubmit}
                disabled={submitting || (selectedSpareparts.length === 0 && selectedServices.length === 0)}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 text-slate-900 font-bold font-display py-3.5 rounded-xl text-center text-sm tracking-wide transition-all uppercase cursor-pointer shadow-lg shadow-teal-500/20 disabled:fill-none"
              >
                {submitting ? "Memproses..." : "Simpan & Cetak Nota"}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* RENDER INVOICE DETAIL / PRINT DIALOG POPUP */}
      {viewDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200 my-8">
            
            {/* Header controls (print/close) */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
              <span className="font-bold text-slate-700 text-xs">SLIP KWITANSI PEMBAYARAN BENGKEL</span>
              <div className="flex gap-2">
                <button 
                  onClick={printReceipt} 
                  className="bg-teal-605 bg-teal-600 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Nota
                </button>
                <button 
                  onClick={() => setViewDetail(null)}
                  className="bg-slate-205 bg-slate-250 bg-slate-200 text-slate-700 px-3 py-1 text-xs rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Area content */}
            <div className="p-8 space-y-6 printable-invoice font-sans" id="printable-area bg-white text-slate-900">
              
              {/* Workshop brand info */}
              <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-300">
                <h2 className="text-lg font-bold uppercase tracking-widest text-slate-800">Bikini Bottom Garage</h2>
                <p className="text-[11px] text-slate-500">Tangerang, Banten • No HP: 08123456789</p>
                <div className="text-md font-mono font-bold text-slate-700 mt-2">NOTA INVOICE TR-#{viewDetail.receipt_number}</div>
              </div>

              {/* Transactions metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div><span className="text-slate-450 uppercase tracking-wider text-[10px]">Pelanggan:</span></div>
                  <div className="font-bold text-slate-700">{viewDetail.customer_name}</div>
                  <div className="text-slate-500">{viewDetail.customer_phone || "-"}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div><span className="text-slate-450 uppercase tracking-wider text-[10px]">Informasi:</span></div>
                  <div>Tanggal: <span className="font-semibold text-slate-700">{viewDetail.date}</span></div>
                  <div>Plat Nomor: <span className="font-mono font-bold text-indigo-750">{viewDetail.plate_number}</span></div>
                  <div>Mekanik: <span className="font-semibold text-slate-700">{viewDetail.employee_name}</span></div>
                </div>
              </div>

              {/* Item tables */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b pb-1.5">Rincian Pembelian & Perbaikan</h4>
                
                <div className="space-y-2.5 text-xs">
                  {/* Spareparts list */}
                  {viewDetail.spareparts && viewDetail.spareparts.map((sp: any) => (
                    <div key={sp.receipt_sparepart_id} className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-800">{sp.variant_name}</div>
                        <div className="text-slate-450 text-[11px] mt-0.5">{sp.quantity} unit x Rp {sp.unit_price.toLocaleString("id-ID")}</div>
                      </div>
                      <span className="font-mono text-slate-700 font-semibold text-right">Rp {sp.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                  ))}

                  {/* Services list */}
                  {viewDetail.services && viewDetail.services.map((srv: any) => (
                    <div key={srv.receipt_services_id} className="flex justify-between items-start pt-1.5 border-t border-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800">Jasa: {srv.service_name}</div>
                        <div className="text-[10px] text-slate-400">Jasa perbaikan mekanik profesional</div>
                      </div>
                      <span className="font-mono text-slate-700 font-semibold text-right">Rp {srv.price.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bills final summary breakdown */}
              <div className="border-t border-dashed border-slate-300 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-550">
                  <span>Subtotal Sparepart:</span>
                  <span className="font-mono">Rp {viewDetail.sparepart_subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-slate-550">
                  <span>Subtotal Jasa Servis:</span>
                  <span className="font-mono">Rp {viewDetail.services_subtotal.toLocaleString("id-ID")}</span>
                </div>
                {viewDetail.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Diskon / Potongan:</span>
                    <span className="font-mono">-Rp {viewDetail.discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-2">
                  <span>TOTAL AKHIR:</span>
                  <span className="font-mono text-teal-700">Rp {viewDetail.grandtotal.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Footer thank notes */}
              <div className="text-center pt-6 border-t border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">Terima Kasih Atas Kepercayaan Anda</p>
                <p className="text-[9px] text-slate-400">Oli bekas Anda kami salurkan untuk keseimbangan limbah yang ramah lingkungan.</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
