"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

const WALLET_TYPE_OPTIONS = [
  { value: "BANK", label: "BANK UTAMA / DEBIT (Operasional & Gaji)" },
  { value: "BANK_SAVINGS", label: "BANK TABUNGAN (Dana Darurat)" },
  { value: "CREDIT_CARD", label: "KARTU KREDIT (Credit Card)" },
  { value: "QRIS", label: "QRIS / E-WALLET (Gopay, OVO, Dana, ShopeePay, QRIS)" },
  { value: "E_WALLET", label: "E-WALLET LAINNYA" },
  { value: "RDN", label: "RDN (Rekening Dana Nasabah Sekuritas)" },
  { value: "CASH", label: "CASH (Uang Tunai)" },
  { value: "DEPOSITO", label: "DEPOSITO / GIRO" },
  { value: "CRYPTO_WALLET", label: "DOMPET KRIPTO" },
  { value: "OTHER", label: "AKUN LAINNYA" }
];

const CURRENCY_OPTIONS = [
  { value: "IDR", label: "🇮🇩 IDR - Rupiah Indonesia" },
  { value: "USD", label: "🇺🇸 USD - Dolar Amerika Serikat" },
  { value: "CNY", label: "🇨🇳 CNY - Yuan Tiongkok" },
  { value: "MYR", label: "🇲🇾 MYR - Ringgit Malaysia" },
  { value: "GBP", label: "🇬🇧 GBP - Pound Sterling Inggris" },
  { value: "SAR", label: "🇸🇦 SAR - Riyal Arab Saudi" }
];

const ASSET_TYPE_OPTIONS = [
  { value: "Saham", label: "Saham (Equity)" },
  { value: "Reksadana", label: "Reksadana (Mutual Funds)" },
  { value: "Obligasi", label: "Obligasi / SBN (Bonds)" },
  { value: "Crypto", label: "Aset Kripto (Crypto)" },
  { value: "Emas", label: "Emas / Logam Mulia" },
  { value: "Lainnya", label: "Instrumen Lainnya" }
];

const BUY_SELL_OPTIONS = [
  { value: "BUY", label: "PEMBELIAN ASET (Mengurangi Saldo RDN)" },
  { value: "SELL", label: "PENJUALAN ASET (Menambah Saldo RDN)" }
];

export default function FormModal({ modalType, targetAsset, isOpen, onClose, onSubmit, wallets, assets, categories }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (modalType === "override_value" && targetAsset) {
      setFormData({ newTotalValue: targetAsset.totalValue });
    } else if (modalType === "transfer" && targetAsset && typeof targetAsset === "object") {
      setFormData({
        sourceWalletId: targetAsset.sourceWalletId || "",
        destinationWalletId: targetAsset.destinationWalletId || "",
        amount: targetAsset.amount || "",
        note: targetAsset.note || ""
      });
    } else if (modalType === "create_wallet") {
      setFormData({ type: "BANK", currency: "IDR" });
    } else if (modalType === "create_asset") {
      setFormData({ type: "Saham" });
    } else if (modalType === "buy_sell") {
      setFormData({ action: "BUY" });
    } else if (modalType === "cash_out") {
      const idrWallets = wallets?.filter((w) => (!w.currency || w.currency === "IDR")) || [];
      const defaultWallet = idrWallets[0] || wallets?.[0];
      setFormData({ walletId: defaultWallet?._id || "" });
    } else if (modalType === "cash_in") {
      setFormData({ walletId: wallets?.[0]?._id || "" });
    } else {
      setFormData({});
    }
  }, [modalType, targetAsset, wallets, isOpen]);

  if (!isOpen) return null;

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const renderLiveIdrPreview = (val) => {
    const num = Number(val);
    if (!val || isNaN(num) || num <= 0) return null;
    return (
      <span className="text-[11px] font-bold text-indigo-600 block mt-1">
        ≈ {formatIDR(num)}
      </span>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(modalType, formData);
    onClose();
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "create_wallet":
        return "Pendaftaran Akun Keuangan & Kartu Kredit";
      case "cash_in":
        return "Pencatatan Pemasukan Kas";
      case "cash_out":
        return "Pencatatan Pengeluaran Kas";
      case "transfer":
        return "Transfer Antar Akun Keuangan";
      case "create_asset":
        return "Pendaftaran Instrumen Investasi";
      case "buy_sell":
        return "Formulir Transaksi Investasi";
      case "override_value":
        return `Pembaruan Nilai Aset: ${targetAsset?.name || ""}`;
      default:
        return "Formulir Transaksi";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs font-sans p-3 sm:p-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full sm:max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative my-auto overflow-visible"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
            <h3 className="font-bold text-slate-900 text-base">{getModalTitle()}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
            {modalType === "create_wallet" && (
              <>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">NAMA AKUN / KARTU KREDIT / BANK</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Bank Mandiri / BCA Platinum"
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-slate-600 mb-1.5 font-semibold">TIPE AKUN</label>
                    <CustomSelect
                      options={WALLET_TYPE_OPTIONS}
                      value={formData.type || "BANK"}
                      onChange={(val) => handleCustomSelectChange("type", val)}
                      className="w-full"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-slate-600 mb-1.5 font-semibold">MATA UANG AKUN</label>
                    <CustomSelect
                      options={CURRENCY_OPTIONS}
                      value={formData.currency || "IDR"}
                      onChange={(val) => handleCustomSelectChange("currency", val)}
                      className="w-full"
                    />
                  </div>
                </div>

                {formData.type === "CREDIT_CARD" ? (
                  <>
                    <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl space-y-1">
                      <span className="font-bold text-rose-900 block text-xs">Pencatatan Limit Kartu Kredit</span>
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        Limit total adalah fasilitas kredit dari bank. Sisa limit digunakan untuk menghitung tagihan terpakai secara otomatis.
                      </p>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1.5 font-semibold">LIMIT TOTAL KARTU KREDIT (RP)</label>
                      <input
                        type="number"
                        step="any"
                        name="creditLimit"
                        required
                        placeholder="Contoh: 20000000"
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                      />
                      {renderLiveIdrPreview(formData.creditLimit)}
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1.5 font-semibold">SISA LIMIT SAAT INI (RP)</label>
                      <input
                        type="number"
                        step="any"
                        name="remainingLimit"
                        required
                        placeholder="Contoh: 15000000"
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                      />
                      {renderLiveIdrPreview(formData.remainingLimit)}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-slate-600 mb-1.5 font-semibold">SALDO AWAL</label>
                    <input
                      type="number"
                      step="any"
                      name="balance"
                      placeholder="Contoh: 1500000"
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                    />
                    {renderLiveIdrPreview(formData.balance)}
                  </div>
                )}
              </>
            )}

            {(modalType === "cash_in" || modalType === "cash_out") && (
              <>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">AKUN KEUANGAN</label>
                  <CustomSelect
                    options={
                      wallets?.map((w) => {
                        const isCC = w.type === "CREDIT_CARD";
                        const balText = isCC
                          ? `Sisa Limit: Rp ${Number(w.balance || 0).toLocaleString("id-ID")}`
                          : `Saldo: ${w.currency || "IDR"} ${Number(w.balance || 0).toLocaleString("id-ID")}`;
                        const typeTag = w.type === "QRIS" ? "QRIS" : isCC ? "Kartu Kredit" : w.type === "BANK" ? "Bank Debit" : w.type;
                        return {
                          value: w._id,
                          label: `${w.name} (${typeTag}) - ${balText}`
                        };
                      }) || []
                    }
                    value={formData.walletId}
                    onChange={(val) => handleCustomSelectChange("walletId", val)}
                    placeholder="-- Pilih Akun Keuangan --"
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">KATEGORI</label>
                  <CustomSelect
                    options={
                      categories
                        ?.filter((c) => c.type === (modalType === "cash_in" ? "INCOME" : "EXPENSE"))
                        .map((c) => ({ value: c._id, label: c.name })) || []
                    }
                    value={formData.categoryId}
                    onChange={(val) => handleCustomSelectChange("categoryId", val)}
                    placeholder="-- Pilih Kategori --"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">NOMINAL TRANSAKSI (RP)</label>
                  <input
                    type="number"
                    step="any"
                    name="amount"
                    required
                    placeholder="Contoh: 2000000"
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                  />
                  {renderLiveIdrPreview(formData.amount)}
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">KETERANGAN TRANSAKSI</label>
                  <input
                    type="text"
                    name="note"
                    placeholder="Ketik rincian atau catatan transaksi..."
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-medium"
                  />
                </div>
              </>
            )}

            {modalType === "transfer" && (
              <>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">AKUN ASAL DANA</label>
                  <CustomSelect
                    options={
                      wallets?.map((w) => ({
                        value: w._id,
                        label: `${w.name} (${w.currency || "IDR"}) - Saldo: ${w.currency || "IDR"} ${w.balance?.toLocaleString()}`
                      })) || []
                    }
                    value={formData.sourceWalletId}
                    onChange={(val) => handleCustomSelectChange("sourceWalletId", val)}
                    placeholder="-- Pilih Akun Asal --"
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">AKUN TUJUAN (TOP-UP RDN)</label>
                  <CustomSelect
                    options={
                      wallets?.map((w) => ({
                        value: w._id,
                        label: `${w.name} (${w.currency || "IDR"}) - Saldo: ${w.currency || "IDR"} ${w.balance?.toLocaleString()}`
                      })) || []
                    }
                    value={formData.destinationWalletId}
                    onChange={(val) => handleCustomSelectChange("destinationWalletId", val)}
                    placeholder="-- Pilih Akun Tujuan --"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">NOMINAL TRANSFER (RP)</label>
                  <input
                    type="number"
                    step="any"
                    name="amount"
                    required
                    placeholder="Contoh: 1500000"
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                  />
                  {renderLiveIdrPreview(formData.amount)}
                </div>
              </>
            )}

            {modalType === "create_asset" && (
              <>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">NAMA INSTRUMEN INVESTASI</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Saham BBCA / Reksadana Sucor"
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-slate-600 mb-1.5 font-semibold">TIPE INSTRUMEN</label>
                    <CustomSelect
                      options={ASSET_TYPE_OPTIONS}
                      value={formData.type || "Saham"}
                      onChange={(val) => handleCustomSelectChange("type", val)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 font-semibold">TOTAL NILAI AWAL (RP)</label>
                    <input
                      type="number"
                      step="any"
                      name="totalValue"
                      placeholder="0"
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                    />
                    {renderLiveIdrPreview(formData.totalValue)}
                  </div>
                </div>
              </>
            )}

            {modalType === "buy_sell" && (
              <>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">JENIS TRANSAKSI</label>
                  <CustomSelect
                    options={BUY_SELL_OPTIONS}
                    value={formData.action || "BUY"}
                    onChange={(val) => handleCustomSelectChange("action", val)}
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">PILIH INSTRUMEN INVESTASI</label>
                  <CustomSelect
                    options={
                      assets?.map((a) => ({
                        value: a._id,
                        label: `${a.name} (${a.type}) - Nilai: Rp ${a.totalValue?.toLocaleString("id-ID")}`
                      })) || []
                    }
                    value={formData.assetId}
                    onChange={(val) => handleCustomSelectChange("assetId", val)}
                    placeholder="-- Pilih Instrumen Investasi --"
                    className="w-full"
                  />
                </div>
                <div className="relative">
                  <label className="block text-slate-600 mb-1.5 font-semibold">AKUN / DOMPET RDN</label>
                  <CustomSelect
                    options={
                      wallets
                        ?.filter((w) => w.type === "RDN")
                        .map((w) => ({
                          value: w._id,
                          label: `${w.name} - Saldo RDN: ${w.currency || "IDR"} ${w.balance?.toLocaleString()}`
                        })) || []
                    }
                    value={formData.rdnWalletId}
                    onChange={(val) => handleCustomSelectChange("rdnWalletId", val)}
                    placeholder="-- Pilih Akun RDN --"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">NOMINAL TRANSAKSI (RP)</label>
                  <input
                    type="number"
                    step="any"
                    name="amountRp"
                    required
                    placeholder="Contoh: 5000000"
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-bold"
                  />
                  {renderLiveIdrPreview(formData.amountRp)}
                </div>
              </>
            )}

            {modalType === "override_value" && (
              <>
                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl">
                  <span className="text-xs text-indigo-900 font-semibold block">{targetAsset?.name}</span>
                  <span className="text-[11px] text-indigo-700">Masukkan nilai total aset terkini untuk menggantikan estimasi lama.</span>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5 font-semibold">TOTAL NILAI ASET TERKINI (RP)</label>
                  <input
                    type="number"
                    step="any"
                    name="newTotalValue"
                    required
                    defaultValue={targetAsset?.totalValue}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-200 rounded-xl text-base font-bold text-indigo-600 focus:outline-none focus:border-indigo-500"
                  />
                  {renderLiveIdrPreview(formData.newTotalValue)}
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
