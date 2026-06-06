import React, { useState } from "react";
import { StockMovement } from "../types";
import { Search, Database, ArrowUpRight, ArrowDownRight, ClipboardList } from "lucide-react";

interface StockMovementsProps {
  movements: StockMovement[];
}

export default function StockMovements({ movements }: StockMovementsProps) {
  const [search, setSearch] = useState("");

  const filtered = movements.filter(sm => 
    sm.variant_name?.toLowerCase().includes(search.toLowerCase()) ||
    sm.variants_sku?.toLowerCase().includes(search.toLowerCase()) ||
    sm.description?.toLowerCase().includes(search.toLowerCase()) ||
    sm.reference_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Control filters panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Cari SKU, nama suku cadang, atau referensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-0 outline-0 focus:ring-2 focus:ring-teal-500 rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
          <ClipboardList className="w-4 h-4 text-teal-605" /> Audit Trail Mutasi Otomatis
        </div>
      </div>

      {/* Main journal tables */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-450 space-y-2">
            <Database className="w-12 h-12 stroke-1 mx-auto text-slate-300" />
            <p className="text-slate-500 font-medium">Histori mutasi stok kosong/tidak ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6 text-center w-16">No</th>
                  <th className="p-4">Tanggal Jurnal</th>
                  <th className="p-4">Barang Suku Cadang</th>
                  <th className="p-4">SKU Toko</th>
                  <th className="p-4 text-center">Tipe Transaksi</th>
                  <th className="p-4 text-center">Sifat Gerakan</th>
                  <th className="p-4 text-center">Jumlah Unit</th>
                  <th className="p-4">Keterangan Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((sm, index) => (
                  <tr key={sm.movement_id} className="hover:bg-slate-50/55 transition-all">
                    <td className="p-4 pl-6 text-center text-slate-400 font-mono text-xs">{filtered.length - index}</td>
                    <td className="p-4 text-slate-600 font-medium text-xs">{sm.movement_date}</td>
                    <td className="p-4 font-bold text-slate-800">{sm.variant_name}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{sm.variants_sku}</td>
                    <td className="p-4 text-center">
                      <span className="bg-slate-100 rounded px-2 py-0.5 font-bold font-display text-[10px] text-slate-600">
                        {sm.reference_type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {sm.movement_type === "IN" ? (
                          <span className="text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-0.5">
                            <ArrowUpRight className="w-3.5 h-3.5 font-bold" /> Masuk
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-0.5">
                            <ArrowDownRight className="w-3.5 h-3.5 font-bold" /> Keluar
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold font-mono text-slate-750">
                      {sm.movement_type === "IN" ? "+" : "-"}{sm.quantity}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{sm.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
