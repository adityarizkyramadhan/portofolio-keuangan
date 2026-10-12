"use client";

import { useState, useEffect } from "react";
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const MODES = [
  { id: "week", label: "Mingguan" },
  { id: "month", label: "Bulanan" },
  { id: "year", label: "Tahunan" }
];
const PAGE_SIZE = 6;

const formatIDR = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

function periodLabel(p, mode) {
  const start = new Date(p.start);
  if (mode === "year") return String(start.getFullYear());
  if (mode === "month") return start.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const last = new Date(new Date(p.end).getTime() - 1);
  const short = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `${short(start)} – ${short(last)} ${last.getFullYear()}`;
}

// refreshKey: ganti nilainya (mis. daftar transaksi) supaya rekap dimuat ulang setelah ada transaksi baru
export default function RecapView({ refreshKey }) {
  const [mode, setMode] = useState("month");
  const [page, setPage] = useState(1);
  const [openKey, setOpenKey] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getExpenseRecap(mode, page, PAGE_SIZE)
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [mode, page, refreshKey]);

  const periods = data?.periods || [];
  const maxExpense = Math.max(1, ...periods.map((p) => p.expense));
  const current = page === 1 ? periods[0] : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Rekap Pengeluaran
          </h2>
          <p className="text-xs text-slate-500">Pengeluaran per periode kalender, dibanding periode tepat sebelumnya. Transfer antar akun & akun valas tidak dihitung.</p>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setPage(1); setOpenKey(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === m.id ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Periode Berjalan ({periodLabel(current, mode)})</span>
          <span className="text-lg font-black text-rose-600">{formatIDR(current.expense)}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 rounded-2xl p-4 border border-rose-200 text-sm">Gagal memuat rekap: {error}</div>
      )}

      <div className={`space-y-3 transition ${loading ? "opacity-50" : ""}`}>
        {loading && !data && (
          <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        )}
        {periods.map((p) => {
          const diff = p.expense - p.prevExpense;
          const key = String(p.start);
          const isOpen = openKey === key;
          return (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <button
                onClick={() => setOpenKey(isOpen ? null : key)}
                aria-expanded={isOpen}
                className="w-full p-4 text-left space-y-2 cursor-pointer hover:bg-slate-50 transition"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{periodLabel(p, mode)}</h3>
                    <span className="text-[11px] text-slate-400">{p.count} transaksi · Pemasukan {formatIDR(p.income)}</span>
                  </div>
                  <div className="text-right flex items-start gap-2">
                    <div>
                      <span className="text-sm font-extrabold text-rose-600 block">{formatIDR(p.expense)}</span>
                      {diff !== 0 && (
                        <span className={`text-[11px] font-semibold inline-flex items-center gap-1 ${diff > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                          {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {diff > 0 ? "+" : "−"}{formatIDR(Math.abs(diff))}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 mt-0.5 transition ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(p.expense / maxExpense) * 100}%` }} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 p-4 space-y-2">
                  {p.categories.map((c) => (
                    <div key={c.name} className="flex justify-between text-xs">
                      <span className="text-slate-600">{c.name}</span>
                      <span className="font-semibold text-slate-900">
                        {formatIDR(c.amount)} <span className="text-slate-400 font-normal">({Math.round((c.amount / p.expense) * 100)}%)</span>
                      </span>
                    </div>
                  ))}
                  {p.categories.length === 0 && <p className="text-xs text-slate-400">Tidak ada pengeluaran.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setPage(page - 1); setOpenKey(null); }}
            disabled={page === 1 || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Lebih baru
          </button>
          <span className="text-xs text-slate-500">Halaman {page}</span>
          <button
            onClick={() => { setPage(page + 1); setOpenKey(null); }}
            disabled={!data.hasMore || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 flex items-center gap-1 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Lebih lama <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
