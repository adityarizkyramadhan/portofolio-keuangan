"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, PieChart as PieIcon, Award, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function DashboardTab({ summary, holdings, allocation, realizedReturns }) {
  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const COLORS = ["#0D2D26", "#C69214", "#1A365D", "#8B1E1E", "#4A5568"];

  const pieData = allocation?.allocations?.map((item) => ({
    name: item.category,
    value: item.value,
    percentage: item.percentage
  })) || [
    { name: "CASH", value: summary?.totalCashBalance || 0, percentage: 80 },
    { name: "SAHAM", value: summary?.totalInvestmentMarketValue || 0, percentage: 20 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Net Worth Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#FFFDF9] border-4 double border-[#C69214] p-6 shadow-xl rounded-none relative overflow-hidden"
      >
        <div className="absolute top-3 right-4 opacity-10 font-serif-vintage text-8xl font-bold select-none text-[#0D2D26]">
          RP
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="stamp-badge text-[11px]">KALKULATOR NET WORTH RESMI</span>
              <span className="text-xs font-mono-ledger text-stone-500">REKAPITULASI ASET GABUNGAN</span>
            </div>
            <h2 className="font-serif-vintage text-3xl sm:text-4xl font-bold text-[#0D2D26]">
              {formatIDR(summary?.netWorth)}
            </h2>
            <p className="text-xs font-mono-ledger text-stone-600 mt-1">
              *Total Saldo Kas (Bank/E-Wallet/RDN) + Total Nilai Pasar Aset Investasi Terkini
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-[#FAF6EF] border border-[#D1C7BD] p-3 rounded-none">
              <span className="text-[10px] font-mono-ledger text-stone-500 uppercase block">Total Saldo Kas</span>
              <span className="font-mono-ledger text-sm font-bold text-[#0D2D26]">
                {formatIDR(summary?.totalCashBalance)}
              </span>
            </div>
            <div className="bg-[#FAF6EF] border border-[#D1C7BD] p-3 rounded-none">
              <span className="text-[10px] font-mono-ledger text-stone-500 uppercase block">Nilai Pasar Investasi</span>
              <span className="font-mono-ledger text-sm font-bold text-[#C69214]">
                {formatIDR(summary?.totalInvestmentMarketValue)}
              </span>
            </div>
            <div className="bg-[#FAF6EF] border border-[#D1C7BD] p-3 rounded-none col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono-ledger text-stone-500 uppercase block">Floating PnL (Unrealized)</span>
              <div className="flex items-center gap-1">
                {(summary?.totalUnrealizedPnl || 0) >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={`font-mono-ledger text-sm font-bold ${(summary?.totalUnrealizedPnl || 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {formatIDR(summary?.totalUnrealizedPnl)} ({summary?.totalUnrealizedPnlPercentage || 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Section: Asset Allocation & Realized Return */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-5 shadow-md flex flex-col justify-between"
        >
          <div className="border-b border-[#D1C7BD] pb-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#C69214]" />
              <h3 className="font-serif-vintage text-lg font-bold text-[#0D2D26]">Porsi Alokasi Kekayaan (Asset Allocation)</h3>
            </div>
            <span className="text-xs font-mono-ledger text-stone-500">PIE CHART</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatIDR(val)}
                  contentStyle={{ backgroundColor: '#FFFDF9', borderColor: '#C69214', fontFamily: 'Courier Prime, monospace' }}
                />
                <Legend formatter={(value) => <span className="font-mono-ledger text-xs text-[#0D2D26]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Realized Returns Report */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-5 shadow-md flex flex-col justify-between"
        >
          <div className="border-b border-[#D1C7BD] pb-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C69214]" />
              <h3 className="font-serif-vintage text-lg font-bold text-[#0D2D26]">Laporan Realized Return</h3>
            </div>
            <span className="text-xs font-mono-ledger text-stone-500">CAPITAL GAIN & DIVIDEN</span>
          </div>

          <div className="space-y-4 my-auto">
            <div className="bg-[#FAF6EF] p-4 border border-[#D1C7BD] flex justify-between items-center">
              <div>
                <span className="text-xs font-mono-ledger text-stone-500 block uppercase">Total Realized Gain / Return</span>
                <span className="text-[#0D2D26] font-serif-vintage text-2xl font-bold">
                  {formatIDR(realizedReturns?.totalRealizedReturn)}
                </span>
              </div>
              <span className="stamp-badge text-[10px]">TERLISENSI</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-[#D1C7BD] bg-white">
                <span className="text-[10px] font-mono-ledger text-stone-500 block uppercase">Capital Gain/Loss (Aset Dijual)</span>
                <span className={`font-mono-ledger text-sm font-bold ${(realizedReturns?.totalCapitalGain || 0) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {formatIDR(realizedReturns?.totalCapitalGain)}
                </span>
              </div>
              <div className="p-3 border border-[#D1C7BD] bg-white">
                <span className="text-[10px] font-mono-ledger text-stone-500 block uppercase">Total Dividen Diterima</span>
                <span className="font-mono-ledger text-sm font-bold text-[#C69214]">
                  {formatIDR(realizedReturns?.totalDividends)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Holdings Summary Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-5 shadow-md"
      >
        <div className="border-b border-[#D1C7BD] pb-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0D2D26]" />
            <h3 className="font-serif-vintage text-lg font-bold text-[#0D2D26]">Daftar Kepemilikan Aset (Portfolio Holdings)</h3>
          </div>
          <span className="text-xs font-mono-ledger text-stone-500">SNAPSHOT AGREGASI</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-ledger text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D2D26] text-[#DFB143] uppercase border-b-2 border-[#C69214]">
                <th className="p-3">Kode / Nama Aset</th>
                <th className="p-3">Tipe</th>
                <th className="p-3 text-right">Total Unit</th>
                <th className="p-3 text-right">Avg Price</th>
                <th className="p-3 text-right">Harga Pasar</th>
                <th className="p-3 text-right">Nilai Modal</th>
                <th className="p-3 text-right">Nilai Pasar</th>
                <th className="p-3 text-right">Floating PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1C7BD]">
              {holdings && holdings.length > 0 ? (
                holdings.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF6EF] transition-colors">
                    <td className="p-3 font-bold text-[#0D2D26]">
                      {item.assetCode}
                      <span className="block text-[10px] text-stone-500 font-normal">{item.assetName}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-[#FAF6EF] border border-[#D1C7BD] text-[10px] font-bold text-[#0D2D26]">
                        {item.assetType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">{item.totalUnits}</td>
                    <td className="p-3 text-right">{formatIDR(item.averageBuyPrice)}</td>
                    <td className="p-3 text-right font-bold text-[#C69214]">{formatIDR(item.currentPrice)}</td>
                    <td className="p-3 text-right">{formatIDR(item.totalInvestedValue)}</td>
                    <td className="p-3 text-right font-bold text-[#0D2D26]">{formatIDR(item.currentMarketValue)}</td>
                    <td className={`p-3 text-right font-bold ${item.unrealizedPnl >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {formatIDR(item.unrealizedPnl)} ({item.unrealizedPnlPercentage}%)
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-stone-500 italic">
                    Belum ada kepemilikan aset investasi. Silakan catat transaksi pembelian di modul portofolio.
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
