"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Printer, Filter, Tag } from "lucide-react";

export default function LedgerTab({ cashHistory, investmentHistory }) {
  const [filterType, setFilterType] = useState("ALL");

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  // Combine both logs into unified ledger timeline
  const combinedLogs = [
    ...(cashHistory || []).map(item => ({
      id: item._id,
      date: item.date || item.createdAt,
      category: item.type === "INCOME" ? "KAS PEMASUKAN" : item.type === "EXPENSE" ? "KAS PENGELUARAN" : "TRANSFER ANTAR AKUN",
      description: item.note || `Mutasi ${item.type}`,
      amount: item.amount,
      type: item.type,
      source: "CASH"
    })),
    ...(investmentHistory || []).map(item => ({
      id: item._id,
      date: item.date || item.createdAt,
      category: `PORTOFOLIO ${item.type}`,
      description: item.type === "BUY" ? `Pembelian ${item.units} unit (Fee: ${formatIDR(item.brokerFee)})` : item.type === "SELL" ? `Penjualan ${item.units} unit (Gain: ${formatIDR(item.realizedPnl)})` : `Dividen Masuk (Pajak: ${formatIDR(item.taxDeduction)})`,
      amount: item.totalAmount,
      type: item.type,
      source: "INVESTMENT"
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredLogs = combinedLogs.filter(item => {
    if (filterType === "ALL") return true;
    if (filterType === "CASH") return item.source === "CASH";
    if (filterType === "INVESTMENT") return item.source === "INVESTMENT";
    return item.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0D2D26]" />
          <div>
            <h2 className="font-serif-vintage text-xl font-bold text-[#0D2D26]">Jurnal Mutasi Audit (Passbook Ledger)</h2>
            <p className="text-xs font-mono-ledger text-stone-500">Catatan kronologis aktivitas finansial dan mutasi portofolio.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono-ledger text-xs">
          <Filter className="w-4 h-4 text-[#C69214]" />
          <span className="text-stone-500">Filter:</span>
          {["ALL", "CASH", "INVESTMENT", "BUY", "SELL", "DIVIDEND"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 border transition text-[11px] font-bold cursor-pointer ${
                filterType === type
                  ? "bg-[#0D2D26] text-[#DFB143] border-[#C69214]"
                  : "bg-[#FAF6EF] text-[#0D2D26] border-[#D1C7BD] hover:bg-stone-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Typewriter Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#FFFDF9] border-4 double border-[#C69214] p-5 shadow-xl"
      >
        <div className="flex justify-between items-center border-b-2 border-[#0D2D26] pb-3 mb-4">
          <div>
            <span className="stamp-badge text-[10px]">DOKUMEN RESMI AUDIT</span>
            <h3 className="font-serif-vintage text-lg font-bold text-[#0D2D26] mt-1">Buku Jurnal Mutasi Kas & Portofolio</h3>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#FAF6EF] border border-[#D1C7BD] text-[#0D2D26] font-mono-ledger text-xs font-bold hover:bg-[#C69214] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Jurnal
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-ledger text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D2D26] text-[#DFB143] uppercase border-b-2 border-[#C69214]">
                <th className="p-3">Waktu Transaksi</th>
                <th className="p-3">Kategori Mutasi</th>
                <th className="p-3">Keterangan / Rincian</th>
                <th className="p-3 text-right">Nominal Transaksi</th>
                <th className="p-3 text-center">Status Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1C7BD]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#FAF6EF] transition-colors">
                    <td className="p-3 text-stone-600 font-semibold">
                      {new Date(log.date).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-[#FAF6EF] border border-[#D1C7BD] text-[10px] font-bold text-[#0D2D26]">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-stone-800">{log.description}</td>
                    <td className={`p-3 text-right font-bold ${log.type === "INCOME" || log.type === "SELL" || log.type === "DIVIDEND" ? "text-emerald-700" : "text-[#0D2D26]"}`}>
                      {formatIDR(log.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                        TERVERIFIKASI
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 italic">
                    Belum ada catatan mutasi transaksi pada kriteria filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
