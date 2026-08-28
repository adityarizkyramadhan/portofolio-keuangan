"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, PieChart, BarChart2, ArrowRight, Download } from "lucide-react";
import CurrencyWidget from "@/components/CurrencyWidget";
import CreditHealthAnalyzer from "@/components/CreditHealthAnalyzer";

export default function DashboardView({ dashboardData, selectedDate, onMonthChange, transactions = [], onNavigateTab }) {
  const {
    netWorth = 0,
    totalWalletsBalance = 0,
    totalAssetsValue = 0,
    totalCreditCardDebt = 0,
    monthlyCashFlow = { income: 0, expense: 0, netSavings: 0, monthName: "" },
    allocation = []
  } = dashboardData || {};

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const handlePrevMonth = () => {
    const cur = new Date(selectedDate.year, selectedDate.month - 1, 1);
    cur.setMonth(cur.getMonth() - 1);
    onMonthChange(cur.getFullYear(), cur.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const cur = new Date(selectedDate.year, selectedDate.month - 1, 1);
    cur.setMonth(cur.getMonth() + 1);
    onMonthChange(cur.getFullYear(), cur.getMonth() + 1);
  };

  const handleExportDashboardCSV = () => {
    const headers = ["Metrik Keuangan", "Nilai (IDR)", "Keterangan"];
    const rows = [
      ["Total Kekayaan Bersih (Net Worth)", netWorth, "Kas + Investasi - Hutang CC"],
      ["Kas & Bank Murni", totalWalletsBalance, "Rekening Bank & Cash"],
      ["Nilai Investasi", totalAssetsValue, "Saham, Obligasi, Reksadana, dll"],
      ["Tagihan Hutang Kartu Kredit", totalCreditCardDebt, "Tagihan Terpakai CC"],
      ["Total Pemasukan Bulanan", monthlyCashFlow.income, monthlyCashFlow.monthName || "Bulan Ini"],
      ["Total Pengeluaran Bulanan", monthlyCashFlow.expense, monthlyCashFlow.monthName || "Bulan Ini"],
      ["Sisa Tabungan Bersih", monthlyCashFlow.netSavings, monthlyCashFlow.monthName || "Bulan Ini"]
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Dasbor_KeuanganKu_${monthlyCashFlow.monthName || "Agustus_2026"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color palette for charts
  const CHART_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  // Calculate Net Worth Net Breakdown
  const grossTotal = Math.max(1, totalWalletsBalance + totalAssetsValue);
  const cashPercent = Math.round((totalWalletsBalance / grossTotal) * 100);
  const investPercent = Math.round((totalAssetsValue / grossTotal) * 100);

  // Calculate SVG Pie/Donut Chart slices for Allocation
  let cumulativePercent = 0;
  const pieSlices = allocation.map((item, idx) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += item.percentage || 0;
    const endAngle = (cumulativePercent / 100) * 360;
    return {
      ...item,
      color: CHART_COLORS[idx % CHART_COLORS.length],
      startAngle,
      endAngle
    };
  });

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Calculate max amount for Income vs Expense bar
  const maxFlow = Math.max(monthlyCashFlow.income, monthlyCashFlow.expense, 1);
  const incomePercent = Math.min(100, Math.round((monthlyCashFlow.income / maxFlow) * 100));
  const expensePercent = Math.min(100, Math.round((monthlyCashFlow.expense / maxFlow) * 100));

  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <div className="space-y-6 pb-28 md:pb-6 font-sans">
      {/* Header Action Bar */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Ringkasan Dasbor Utama</h2>
          <p className="text-[11px] text-slate-500">Visualisasi komposisi kekayaan, arus kas, dan analisis keuangan.</p>
        </div>
        <button
          onClick={handleExportDashboardCSV}
          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Ekspor Dasbor (CSV)
        </button>
      </div>

      {/* Net Worth Card (Slate Dark Elegant Container with Interactive Donut Chart) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 border border-slate-800"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Kekayaan Bersih (Net Worth)</span>
          <span className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold">
            AKTIF
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{formatIDR(netWorth)}</h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Kalkulasi otomatis dari <strong>Kas & Bank Murni ({cashPercent}%)</strong> + <strong>Nilai Investasi ({investPercent}%)</strong> dikurangi <strong>Tagihan Kartu Kredit</strong>.
            </p>
          </div>

          {/* Mini Interactive Net Worth Donut Chart */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                {/* Kas Slice */}
                {(() => {
                  const [x1, y1] = getCoordinatesForPercent(0);
                  const [x2, y2] = getCoordinatesForPercent(cashPercent / 100);
                  const largeArc = cashPercent / 100 > 0.5 ? 1 : 0;
                  return <path d={`M ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`} fill="#10b981" />;
                })()}
                {/* Invest Slice */}
                {(() => {
                  const [x1, y1] = getCoordinatesForPercent(cashPercent / 100);
                  const [x2, y2] = getCoordinatesForPercent(1);
                  const largeArc = investPercent / 100 > 0.5 ? 1 : 0;
                  return <path d={`M ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} L 0 0`} fill="#6366f1" />;
                })()}
                <circle cx="0" cy="0" r="0.65" fill="#0f172a" />
              </svg>
              <div className="absolute text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Rasio</span>
                <span className="text-[11px] font-extrabold text-emerald-400">{cashPercent}% Kas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block truncate">Kas & Bank Murni</span>
              <span className="text-sm font-bold text-slate-100">{formatIDR(totalWalletsBalance)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block truncate">Nilai Investasi</span>
              <span className="text-sm font-bold text-slate-100">{formatIDR(totalAssetsValue)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block truncate">Tagihan Hutang CC</span>
              <span className="text-sm font-bold text-rose-400">-{formatIDR(totalCreditCardDebt)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Monthly Financial Rekap & Navigation */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Rekap Arus Kas Bulanan</h3>
            <p className="text-xs text-slate-500">Ringkasan pemasukan, pengeluaran, dan rasio tabungan.</p>
          </div>

          {/* Month Selector Control */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2">
              {monthlyCashFlow.monthName || "Agustus 2026"}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition cursor-pointer"
              title="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-800 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase">Total Pemasukan</span>
            </div>
            <span className="text-xl font-bold text-emerald-700">{formatIDR(monthlyCashFlow.income)}</span>
          </div>

          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-rose-800 mb-1">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold uppercase">Total Pengeluaran</span>
            </div>
            <span className="text-xl font-bold text-rose-700">{formatIDR(monthlyCashFlow.expense)}</span>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
            <div className="text-indigo-800 mb-1">
              <span className="text-xs font-bold uppercase">Sisa Tabungan Bersih</span>
            </div>
            <span className={`text-xl font-bold ${monthlyCashFlow.netSavings >= 0 ? "text-indigo-700" : "text-rose-700"}`}>
              {formatIDR(monthlyCashFlow.netSavings)}
            </span>
          </div>
        </div>

        {/* Visual Bar Comparison: Income vs Expense */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <BarChart2 className="w-4 h-4 text-indigo-600" /> Perbandingan Visual Pemasukan vs Pengeluaran
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span className="text-emerald-700">Pemasukan ({formatIDR(monthlyCashFlow.income)})</span>
                <span className="text-slate-400">{incomePercent}%</span>
              </div>
              <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${incomePercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span className="text-rose-700">Pengeluaran ({formatIDR(monthlyCashFlow.expense)})</span>
                <span className="text-slate-400">{expensePercent}%</span>
              </div>
              <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${expensePercent}%` }} />
              </div>
            </div>
          </div>

          {/* Top Expense Categories Breakdown */}
          {(() => {
            const expenseTxs = (transactions || []).filter((t) => t.type === "EXPENSE");
            const categoryTotals = {};
            let totalExpenseSum = 0;

            expenseTxs.forEach((tx) => {
              const cat = tx.categoryName || "Lainnya";
              const amt = Number(tx.amount) || 0;
              categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
              totalExpenseSum += amt;
            });

            const topCategories = Object.entries(categoryTotals)
              .map(([name, value]) => ({
                name,
                value,
                percent: totalExpenseSum > 0 ? Math.round((value / totalExpenseSum) * 100) : 0
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5);

            if (topCategories.length === 0) return null;

            return (
              <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">📊 Pos Pengeluaran Terbesar</span>
                <div className="space-y-2">
                  {topCategories.map((cat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>{cat.name}</span>
                        <span>{formatIDR(cat.value)} ({cat.percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${cat.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Credit Health & Installment Risk Analyzer */}
      <CreditHealthAnalyzer
        monthlyIncome={monthlyCashFlow.income}
        existingInstallments={monthlyCashFlow.expense}
      />

      {/* Asset & Cash Allocation Charts Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Sebaran Alokasi Kekayaan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Donut Chart Visualization */}
          <div className="flex justify-center items-center py-2">
            {allocation && allocation.length > 0 ? (
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice, i) => {
                    const startAcc = pieSlices.slice(0, i).reduce((sum, s) => sum + s.percentage, 0) / 100;
                    const endAcc = startAcc + slice.percentage / 100;

                    const [startX, startY] = getCoordinatesForPercent(startAcc);
                    const [endX, endY] = getCoordinatesForPercent(endAcc);
                    const largeArcFlag = slice.percentage / 100 > 0.5 ? 1 : 0;

                    const pathData = [
                      `M ${startX} ${startY}`,
                      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      `L 0 0`
                    ].join(" ");

                    return <path key={i} d={pathData} fill={slice.color} />;
                  })}
                  <circle cx="0" cy="0" r="0.6" fill="white" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                  <span className="text-xs font-extrabold text-slate-900">{formatIDR(netWorth)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada data alokasi kekayaan.</p>
            )}
          </div>

          {/* Allocation Progress Bars & Legends */}
          <div className="space-y-3">
            {allocation && allocation.length > 0 ? (
              allocation.map((item, idx) => {
                const color = CHART_COLORS[idx % CHART_COLORS.length];
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                        {item.name}
                      </span>
                      <span>{formatIDR(item.value)} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, item.percentage || 0)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada data alokasi kekayaan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Widget */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Transaksi Terakhir</h3>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("ledger")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {recentTransactions && recentTransactions.length > 0 ? (
            recentTransactions.map((tx, idx) => {
              const isIncome = tx.type === "INCOME";
              const isExpense = tx.type === "EXPENSE";
              return (
                <div key={tx._id || idx} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${
                        isIncome ? "bg-emerald-50 text-emerald-600" : isExpense ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{tx.categoryName || "Transaksi"}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{tx.note || tx.accountName}</span>
                    </div>
                  </div>

                  <span className={`font-bold ${isIncome ? "text-emerald-600" : isExpense ? "text-rose-600" : "text-indigo-600"}`}>
                    {isIncome ? "+" : isExpense ? "-" : ""}{formatIDR(tx.amount)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="p-4 text-xs text-slate-400 text-center italic">Belum ada catatan transaksi kas.</p>
          )}
        </div>
      </div>

      {/* Multi-Currency Conversion Widget */}
      <CurrencyWidget netWorthIdr={netWorth} />
    </div>
  );
}
