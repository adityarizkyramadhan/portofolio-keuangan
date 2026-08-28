"use client";

import { useState } from "react";
import { Search, Download, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Filter, Receipt } from "lucide-react";

export default function TransactionsLedgerView({ transactions = [], categories = [], wallets = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const filteredTransactions = transactions.filter((tx) => {
    // Type Filter
    if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;

    // Category Filter
    if (categoryFilter !== "ALL" && tx.categoryId !== categoryFilter) return false;

    // Search Filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const noteMatch = (tx.note || "").toLowerCase().includes(q);
      const accMatch = (tx.accountName || "").toLowerCase().includes(q);
      const catMatch = (tx.categoryName || "").toLowerCase().includes(q);
      return noteMatch || accMatch || catMatch;
    }

    return true;
  });

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert("Tidak ada data transaksi untuk diekspor.");
      return;
    }

    const headers = ["Tanggal", "Tipe Transaksi", "Akun", "Kategori", "Nominal (IDR)", "Keterangan"];
    const rows = filteredTransactions.map((tx) => {
      const dateStr = new Date(tx.date || tx.createdAt).toLocaleDateString("id-ID");
      const typeStr = tx.type === "INCOME" ? "Pemasukan" : tx.type === "EXPENSE" ? "Pengeluaran" : "Transfer";
      const accStr = tx.type === "TRANSFER" && tx.destinationAccountName ? `${tx.accountName} -> ${tx.destinationAccountName}` : tx.accountName;
      const catStr = tx.categoryName || "-";
      const amountStr = tx.amount || 0;
      const noteStr = `"${(tx.note || "").replace(/"/g, '""')}"`;

      return [dateStr, typeStr, `"${accStr}"`, `"${catStr}"`, amountStr, noteStr].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Transaksi_KeuanganKu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-28 md:pb-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riwayat Transaksi (Buku Besar)</h2>
          <p className="text-xs text-slate-500">Daftar arus kas masuk, keluar, dan transfer secara kronologis.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Ekspor Laporan (CSV)
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari transaksi atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 w-full focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="INCOME">🟢 Pemasukan</option>
            <option value="EXPENSE">🔴 Pengeluaran</option>
            <option value="TRANSFER">🔵 Transfer</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 w-full px-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.type === "INCOME" ? "Pemasukan" : "Pengeluaran"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions && filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx, idx) => {
              const isIncome = tx.type === "INCOME";
              const isExpense = tx.type === "EXPENSE";

              return (
                <div key={tx._id || idx} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        isIncome ? "bg-emerald-50 text-emerald-600" : isExpense ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : isExpense ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowLeftRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{tx.categoryName || "Transaksi"}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isIncome
                              ? "bg-emerald-100 text-emerald-800"
                              : isExpense
                              ? "bg-rose-100 text-rose-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {isIncome ? "Pemasukan" : isExpense ? "Pengeluaran" : "Transfer"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {tx.note ? tx.note : "Tanpa catatan"} • <span className="font-semibold text-slate-700">{tx.accountName}</span>
                        {tx.destinationAccountName && <span> ➔ {tx.destinationAccountName}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-bold text-xs sm:text-sm block ${
                        isIncome ? "text-emerald-600" : isExpense ? "text-rose-600" : "text-indigo-600"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "-" : ""}
                      {formatIDR(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(tx.date || tx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-slate-400">Pencatatan kas yang Anda lakukan akan tampil secara kronologis di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
