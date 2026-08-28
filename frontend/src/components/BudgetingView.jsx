"use client";

import { useState, useEffect } from "react";
import { PieChart, Plus, AlertCircle, CheckCircle, Edit2, ShieldAlert, Download, Wallet } from "lucide-react";

export default function BudgetingView({ categories = [], transactions = [], selectedDate }) {
  const [budgets, setBudgets] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [inputLimit, setInputLimit] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  // Load budgets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("keuanganku_category_budgets");
      if (saved) {
        setBudgets(JSON.parse(saved));
      } else {
        // Default budgets for common expense categories
        const defaults = {};
        expenseCategories.forEach((c) => {
          defaults[c._id] = 2000000; // default 2 mil IDR limit
        });
        setBudgets(defaults);
      }
    } catch (e) {
      console.warn("Failed to load budgets from localStorage", e);
    }
  }, [categories.length]);

  const saveBudget = (categoryId, limit) => {
    const updated = { ...budgets, [categoryId]: Number(limit) || 0 };
    setBudgets(updated);
    try {
      localStorage.setItem("keuanganku_category_budgets", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save budgets to localStorage", e);
    }
    setEditingCategory(null);
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  // Calculate actual expenses for current selected month per category
  const targetYear = selectedDate?.year || new Date().getFullYear();
  const targetMonth = selectedDate?.month || new Date().getMonth() + 1;

  const calculateActualSpent = (categoryId) => {
    return transactions
      .filter((tx) => {
        if (tx.type !== "EXPENSE") return false;
        if (tx.categoryId !== categoryId && tx.categoryId?._id !== categoryId) return false;
        const d = new Date(tx.date || tx.createdAt);
        return d.getFullYear() === targetYear && d.getMonth() + 1 === targetMonth;
      })
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  };

  // Total Budget Aggregations
  const totalLimit = expenseCategories.reduce((sum, cat) => sum + (budgets[cat._id] || 0), 0);
  const totalSpent = expenseCategories.reduce((sum, cat) => sum + calculateActualSpent(cat._id), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const totalPercentage = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;
  const isTotalOver = totalLimit > 0 && totalSpent > totalLimit;

  const handleExportBudgetCSV = () => {
    if (!expenseCategories || expenseCategories.length === 0) {
      alert("Tidak ada data anggaran untuk diekspor.");
      return;
    }

    const headers = ["Kategori Pengeluaran", "Terpakai Bulan Ini (IDR)", "Batas Anggaran (IDR)", "Sisa Anggaran (IDR)", "Persentase Terpakai"];
    const rows = expenseCategories.map((cat) => {
      const limit = budgets[cat._id] || 0;
      const spent = calculateActualSpent(cat._id);
      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? `${Math.round((spent / limit) * 100)}%` : "0%";

      return [`"${cat.name}"`, spent, limit, remaining, `"${percentage}"`].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Anggaran_KeuanganKu_${targetYear}_${targetMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-28 md:pb-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Anggaran (Budgeting)</h2>
          <p className="text-xs text-slate-500">Atur batas maksimal pengeluaran per kategori untuk mengontrol kesehatan keuangan Anda.</p>
        </div>

        <button
          onClick={handleExportBudgetCSV}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Ekspor Anggaran (CSV)
        </button>
      </div>

      {/* Total Budget Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-indigo-300 uppercase block">RINGKASAN TOTAL ANGGARAN BULAN INI</span>
            <h3 className="text-2xl font-black text-white mt-0.5 tracking-tight">{formatIDR(totalLimit)}</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-300 font-semibold block uppercase">Total Terpakai</span>
              <span className={`text-sm font-extrabold ${isTotalOver ? "text-rose-400" : "text-emerald-400"}`}>{formatIDR(totalSpent)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-300 font-semibold block uppercase">Sisa Total</span>
              <span className="text-sm font-extrabold text-white">{formatIDR(totalRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className={isTotalOver ? "text-rose-400" : totalPercentage > 80 ? "text-amber-400" : "text-emerald-400"}>
              {totalPercentage}% dari Total Anggaran Terpakai
            </span>
            <span className="text-slate-300">{isTotalOver ? "TERLAMPUI" : `${formatIDR(totalRemaining)} Tersisa`}</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isTotalOver ? "bg-rose-500" : totalPercentage > 80 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${totalPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expenseCategories && expenseCategories.length > 0 ? (
          expenseCategories.map((cat) => {
            const limit = budgets[cat._id] || 0;
            const spent = calculateActualSpent(cat._id);
            const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isOver = limit > 0 && spent > limit;

            return (
              <div key={cat._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <span className="text-[11px] text-slate-400 font-medium uppercase">Kategori Pengeluaran</span>
                  </div>

                  <button
                    onClick={() => {
                      setEditingCategory(cat._id);
                      setInputLimit(limit);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Set Limit
                  </button>
                </div>

                {editingCategory === cat._id ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Masukkan limit anggaran..."
                        value={inputLimit}
                        onChange={(e) => setInputLimit(e.target.value)}
                        className="w-full p-2 border border-indigo-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600 font-bold"
                      />
                      <button
                        onClick={() => saveBudget(cat._id, inputLimit)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0"
                      >
                        Simpan
                      </button>
                    </div>
                    {inputLimit && Number(inputLimit) > 0 && (
                      <span className="text-[11px] font-bold text-indigo-600 block">
                        ≈ {formatIDR(Number(inputLimit))}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-end pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Terpakai Bulan Ini</span>
                        <span className={`text-base font-bold ${isOver ? "text-rose-600" : "text-slate-900"}`}>{formatIDR(spent)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Batas Anggaran</span>
                        <span className="text-xs font-bold text-slate-700">{limit > 0 ? formatIDR(limit) : "Belum diatur"}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={isOver ? "text-rose-600" : percentage > 80 ? "text-amber-600" : "text-emerald-600"}>
                          {percentage}% Terpakai
                        </span>
                        <span className="text-slate-400">{isOver ? "LEBIH ANGGARAN" : `${formatIDR(Math.max(0, limit - spent))} Sisa`}</span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isOver ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <PieChart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Belum ada kategori pengeluaran</p>
            <p className="text-xs text-slate-400 mt-1">Tambahkan kategori pengeluaran pada menu "Kategori" terlebih dahulu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
