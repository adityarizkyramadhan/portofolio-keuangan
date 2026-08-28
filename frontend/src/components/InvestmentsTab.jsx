"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, DollarSign, Gift, Edit3, PlusCircle, Check } from "lucide-react";

export default function InvestmentsTab({ assets, onOpenModal, onUpdatePrice }) {
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleSavePrice = (id) => {
    if (!newPrice || isNaN(newPrice) || Number(newPrice) < 0) return;
    onUpdatePrice(id, Number(newPrice));
    setEditingAssetId(null);
    setNewPrice("");
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div>
          <h2 className="font-serif-vintage text-xl font-bold text-[#0D2D26]">Master Aset & Transaksi Portofolio</h2>
          <p className="text-xs font-mono-ledger text-stone-500">Katalog instrumen investasi, pembaruan harga pasar (Mark-to-Market), dan eksekusi transaksi.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOpenModal("create_asset")}
            className="px-3 py-2 bg-[#FAF6EF] text-[#0D2D26] border border-[#D1C7BD] font-mono-ledger text-xs font-bold hover:bg-stone-200 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" />
            + Master Aset Baru
          </button>
          <button
            onClick={() => onOpenModal("buy_asset")}
            className="px-3 py-2 bg-[#0D2D26] text-[#DFB143] border border-[#C69214] font-mono-ledger text-xs font-bold hover:bg-[#164239] transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            Beli Aset (Buy)
          </button>
          <button
            onClick={() => onOpenModal("sell_asset")}
            className="px-3 py-2 bg-[#8B1E1E] text-white border border-red-400 font-mono-ledger text-xs font-bold hover:bg-red-900 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <DollarSign className="w-4 h-4" />
            Jual Aset (Sell)
          </button>
          <button
            onClick={() => onOpenModal("dividend")}
            className="px-3 py-2 bg-[#C69214] text-[#0D2D26] font-mono-ledger text-xs font-bold hover:bg-[#DFB143] transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Gift className="w-4 h-4" />
            Catat Dividen / Yield
          </button>
        </div>
      </div>

      {/* Master Assets Catalog Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-5 shadow-md"
      >
        <div className="border-b border-[#D1C7BD] pb-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C69214]" />
            <h3 className="font-serif-vintage text-lg font-bold text-[#0D2D26]">Katalog Master Aset & Evaluasi Harga Pasar (Mark-to-Market)</h3>
          </div>
          <span className="text-xs font-mono-ledger text-stone-500">SEKTOR INVESTASI</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-ledger text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D2D26] text-[#DFB143] uppercase border-b-2 border-[#C69214]">
                <th className="p-3">Kode Aset</th>
                <th className="p-3">Nama Instrumen</th>
                <th className="p-3">Tipe Instrumen</th>
                <th className="p-3 text-right">Harga Pasar Terkini</th>
                <th className="p-3 text-center">Terakhir Diperbarui</th>
                <th className="p-3 text-center">Aksi (Mark-to-Market)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D1C7BD]">
              {assets && assets.length > 0 ? (
                assets.map((asset, idx) => (
                  <tr key={asset._id || idx} className="hover:bg-[#FAF6EF] transition-colors">
                    <td className="p-3 font-bold text-[#0D2D26] text-sm">{asset.assetCode}</td>
                    <td className="p-3 font-semibold">{asset.assetName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-[#FAF6EF] border border-[#D1C7BD] text-[10px] font-bold text-[#0D2D26]">
                        {asset.assetType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#C69214] text-sm">
                      {editingAssetId === asset._id ? (
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder={asset.currentPrice}
                          className="w-32 p-1 border-2 border-[#C69214] bg-white text-right font-mono-ledger text-xs focus:outline-none"
                        />
                      ) : (
                        formatIDR(asset.currentPrice)
                      )}
                    </td>
                    <td className="p-3 text-center text-stone-500 text-[11px]">
                      {asset.lastPriceUpdate ? new Date(asset.lastPriceUpdate).toLocaleDateString("id-ID") : "Baru"}
                    </td>
                    <td className="p-3 text-center">
                      {editingAssetId === asset._id ? (
                        <button
                          onClick={() => handleSavePrice(asset._id)}
                          className="px-2 py-1 bg-emerald-800 text-white font-bold text-[10px] rounded hover:bg-emerald-700 transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Simpan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingAssetId(asset._id);
                            setNewPrice(asset.currentPrice);
                          }}
                          className="px-2 py-1 bg-[#FAF6EF] text-[#0D2D26] border border-[#D1C7BD] font-bold text-[10px] hover:bg-[#C69214] hover:text-white transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Update Harga
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-500 italic">
                    Belum ada master aset. Silakan daftarkan master aset investasi baru.
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
