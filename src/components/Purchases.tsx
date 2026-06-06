import React, { useState } from "react";
import { Purchase, Supplier, Variant } from "../types";
import { Search, Plus, Check, MapPin, Inbox, X, Calendar, Clipboard, ListPlus, Trash2 } from "lucide-react";

interface PurchasesProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  variants: Variant[];
  onCreatePurchase: (payload: any) => Promise<any>;
  onReceivePurchase: (id: number) => Promise<any>;
}

export default function Purchases({
  purchases,
  suppliers,
  variants,
  onCreatePurchase,
  onReceivePurchase
}: PurchasesProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [supplierId, setSupplierId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Grid list of items inside the purchase order
  const [selectedItems, setSelectedItems] = useState<Array<{ variant_id: number; quantity: number; unit_price: number }>>([]);
  const [tempVariantId, setTempVariantId] = useState("");
  const [tempQty, setTempQty] = useState("10");
  const [tempPrice, setTempPrice] = useState("");

  const filtered = purchases.filter(p => 
    p.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    (p.supplier_name && p.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setSupplierId(suppliers.length > 0 ? suppliers[0].supplier_id.toString() : "");
    setReceiptNumber(`PO-${Date.now().toString().slice(-5)}`);
    setExpectedDate(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]); // Default 7 days from now
    setSelectedItems([]);
    setTempVariantId(variants.length > 0 ? variants[0].variant_id.toString() : "");
    setTempQty("10");
    setTempPrice(variants.length > 0 ? variants[0].buying_price.toString() : "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleTempVariantChange = (vId: string) => {
    setTempVariantId(vId);
    const varItem = variants.find(v => v.variant_id === parseInt(vId));
    if (varItem) {
      setTempPrice(varItem.buying_price.toString());
    }
  };

  const addPurchaseItem = () => {
    if (!tempVariantId) return;
    const vId = parseInt(tempVariantId);
    const qty = parseInt(tempQty) || 1;
    const price = parseFloat(tempPrice) || 0;

    // Check duplication
    const duplicateIdx = selectedItems.findIndex(i => i.variant_id === vId);
    if (duplicateIdx !== -1) {
      const updated = [...selectedItems];
      updated[duplicateIdx].quantity += qty;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { variant_id: vId, quantity: qty, unit_price: price }]);
    }
  };

  const removePurchaseItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const calculateSumTotal = () => {
    return selectedItems.reduce((acc, current) => acc + (current.quantity * current.unit_price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || selectedItems.length === 0) {
      setErrorMsg("Supplier dan minimal satu item pemesanan wajib diisi!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await onCreatePurchase({
        supplier_id: parseInt(supplierId),
        receipt_number: receiptNumber.trim(),
        order_date: new Date().toISOString().split('T')[0],
        expected_date: expectedDate,
        status: "PENDING",
        items: selectedItems
      });
      setModalOpen(false);
    } catch {
      setErrorMsg("Gagal membuat pesanan pembelian.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmArrival = async (id: number) => {
    if (confirm("Apakah Anda yakin kiriman suku cadang ini telah diterima di garasi? Stok fisik produk akan bertambah secara otomatis.")) {
      await onReceivePurchase(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari PO pembelian, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button 
          disabled={suppliers.length === 0 || variants.length === 0}
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium text-sm px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Rencana PO Pembelian (Supplier)
        </button>
      </div>

      {suppliers.length === 0 && (
        <div className="p-4 bg-indigo-50 text-indigo-900 rounded-xl flex items-center gap-2 text-xs">
          <span>Daftarkan supplier utama seperti PT Yamaha terlebih dahulu di database bengkel.</span>
        </div>
      )}

      {/* Main Purchases Log list tab */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-450 space-y-2">
            <Inbox className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-slate-500 font-medium">Belum ada pemesanan suku cadang</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 text-center w-16">ID PO</th>
                  <th className="p-4">No. Resi Order</th>
                  <th className="p-4">Pemasok (Supplier Target)</th>
                  <th className="p-4">Tanggal Order</th>
                  <th className="p-4">Ekspektasi Tiba</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right w-44">Tindakan Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((p) => (
                  <tr key={p.purchase_id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{p.purchase_id}</td>
                    <td className="p-4 font-mono font-bold text-slate-800 uppercase tracking-wider">{p.receipt_number}</td>
                    <td className="p-4 font-semibold text-slate-705">{p.supplier_name}</td>
                    <td className="p-4 text-slate-500 text-xs">{p.order_date}</td>
                    <td className="p-4 text-slate-500 text-xs">{p.expected_date || "-"}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        p.status === "RECEIVED" ? "bg-emerald-100 text-emerald-800" :
                        p.status === "CANCELLED" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-850"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {p.status === "PENDING" ? (
                        <button
                          onClick={() => handleConfirmArrival(p.purchase_id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 ml-auto cursor-pointer shadow-sm shadow-emerald-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Konfirmasi Tiba!
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic font-medium">Gudang Sinkron</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rencana Purchase order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 font-display">
                Buat Purchase Order Baru (PO)
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-405 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">{errorMsg}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Pilih Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none"
                  >
                    {suppliers.map(s => (
                      <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">No. Resi Order / PO *</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Ekspektasi Tanggal Masuk (Tiba) *</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* SECTION FOR SEEDING ITEMS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ListPlus className="w-4 h-4 text-teal-650" /> Masukkan Suku Cadang Yang Dipesan
                </h4>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl">
                  <div className="col-span-3 sm:col-span-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Suku Cadang</label>
                    <select
                      value={tempVariantId}
                      onChange={(e) => handleTempVariantChange(e.target.value)}
                      className="w-full bg-white border p-1 rounded text-xs outline-none"
                    >
                      {variants.map(v => (
                        <option key={v.variant_id} value={v.variant_id}>{v.name} ({v.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Qty Unit</label>
                    <input
                      type="number"
                      min={1}
                      value={tempQty}
                      onChange={(e) => setTempQty(e.target.value)}
                      className="w-full bg-white border p-1 rounded text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Harga Grosir Unit</label>
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-full bg-white border p-1 rounded text-xs font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addPurchaseItem}
                    className="col-span-3 sm:col-span-1 border border-teal-600 hover:bg-teal-50 text-teal-700 rounded text-xs font-semibold py-1.5 cursor-pointer mt-1"
                  >
                    + Masukkan List
                  </button>
                </div>

                {/* Ordered items summary dashboard */}
                {selectedItems.length > 0 ? (
                  <div className="space-y-2 border p-3 rounded-xl max-h-[140px] overflow-y-auto">
                    {selectedItems.map((item, index) => {
                      const vObj = variants.find(v => v.variant_id === item.variant_id);
                      return (
                        <div key={item.variant_id} className="flex justify-between items-center text-xs pb-1 border-b last:border-b-0">
                          <div>
                            <span className="font-semibold text-slate-800">{vObj ? vObj.name : "Sparepart"}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">({item.quantity} unit x Rp {item.unit_price.toLocaleString("id-ID")})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-600">Rp {(item.quantity * item.unit_price).toLocaleString("id-ID")}</span>
                            <button
                              type="button"
                              onClick={() => removePurchaseItem(index)}
                              className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between border-t pt-2 font-bold text-slate-900 text-xs">
                      <span>Perkiraan Biaya Total PO:</span>
                      <span className="font-mono text-teal-700">Rp {calculateSumTotal().toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Belum ada item ditambahkan ke Purchase Order</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading || selectedItems.length === 0}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Daftarkan PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
