"use client";

import { motion } from "framer-motion";
import { TrendingUp, Plus, Edit3, ShoppingBag } from "lucide-react";

export default function PortfolioView({ assets = [], onOpenModal }) {
  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  // Group assets into categories
  const sahamAssets = assets.filter((a) => (a.type || "").toLowerCase().includes("saham"));
  const obligasiAssets = assets.filter((a) => (a.type || "").toLowerCase().includes("obligasi") || (a.type || "").toLowerCase().includes("sbn"));
  const reksadanaAssets = assets.filter((a) => (a.type || "").toLowerCase().includes("reksa"));
  const otherAssets = assets.filter(
    (a) =>
      !sahamAssets.includes(a) &&
      !obligasiAssets.includes(a) &&
      !reksadanaAssets.includes(a)
  );

  const assetClusters = [
    { title: "📈 Saham (Equity & Portfolio)", items: sahamAssets },
    { title: "📜 Obligasi & SBN (Bonds)", items: obligasiAssets },
    { title: "🏦 Reksadana (Mutual Funds)", items: reksadanaAssets },
    { title: "🟡 Emas, Kripto & Lainnya", items: otherAssets }
  ].filter((c) => c.items.length > 0);

  const renderAssetCard = (asset, idx) => (
    <motion.div
      key={asset._id || idx}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase">
            {asset.type || "Saham"}
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1.5">{asset.name}</h3>
        </div>
        <button
          onClick={() => onOpenModal("override_value", asset)}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" /> Pembaruan Nilai
        </button>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Total Nilai Terkini</span>
          <span className="text-xl font-bold text-indigo-600 tracking-tight">{formatIDR(asset.totalValue)}</span>
        </div>
        <span className="text-[10px] text-slate-400">
          {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString("id-ID") : "Baru"}
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-28 md:pb-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Portofolio Investasi</h2>
          <p className="text-xs text-slate-500">Pencatatan instrumen investasi, tren sparkline harga, dan pembaruan nilai terkini.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenModal("create_asset")}
            className="flex-1 sm:flex-none justify-center px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> Instrumen Baru
          </button>
          <button
            onClick={() => onOpenModal("buy_sell")}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <ShoppingBag className="w-4 h-4" /> Transaksi Investasi
          </button>
        </div>
      </div>

      {/* Clustered Assets Grid */}
      {assetClusters && assetClusters.length > 0 ? (
        assetClusters.map((cluster, cIdx) => (
          <div key={cIdx} className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">{cluster.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cluster.items.map((asset, idx) => renderAssetCard(asset, idx))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <TrendingUp className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">Belum ada instrumen investasi terdaftar</p>
          <p className="text-xs text-slate-400 mt-1">Tekan tombol "+ Instrumen Baru" untuk mencatat Saham, Reksadana, Obligasi, atau Emas.</p>
        </div>
      )}
    </div>
  );
}
