"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function TransactionSlipModal({ modalType, isOpen, onClose, onSubmit, accounts, assets }) {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(modalType, formData);
    setFormData({});
    onClose();
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "create_account":
        return "SLIP PENDAFTARAN AKUN / RDN";
      case "record_transaction":
        return "SLIP PEMASUKAN / PENGELUARAN KAS";
      case "transfer":
        return "SLIP TRANSFER & TOP-UP RDN";
      case "create_asset":
        return "SLIP MASTER ASET INVESTASI";
      case "buy_asset":
        return "SLIP PEMBELIAN ASET (BUY VOUCHER)";
      case "sell_asset":
        return "SLIP PENJUALAN ASET (SELL VOUCHER)";
      case "dividend":
        return "SLIP HASIL DIVIDEN / YIELD";
      default:
        return "SLIP TRANSAKSI RESMI";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-[#FFFDF9] border-4 double-ledger border-[#C69214] max-w-lg w-full p-6 shadow-2xl relative overflow-hidden text-[#1E1E1E]"
        >
          {/* Top Vintage Bank Slip Header */}
          <div className="border-b-2 border-[#0D2D26] pb-3 mb-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="stamp-badge text-[9px]">VOUCHER RESMI</span>
                <span className="text-[10px] font-mono-ledger text-stone-500">NO. SERI: VOUCH-88219</span>
              </div>
              <h3 className="font-serif-vintage text-xl font-bold text-[#0D2D26] mt-1">{getModalTitle()}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-500 hover:text-red-700 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono-ledger text-xs">
            {/* Form Fields Based on Modal Type */}
            {modalType === "create_account" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">NAMA AKUN / DOMPET</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: RDN Mandiri Sekuritas / Bank BCA"
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">TIPE AKUN</label>
                    <select
                      name="type"
                      required
                      defaultValue="BANK"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    >
                      <option value="BANK">BANK UTAMA</option>
                      <option value="RDN">RDN (SEKURITAS)</option>
                      <option value="E_WALLET">E-WALLET</option>
                      <option value="CASH">CASH (TUNAI)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">SALDO AWAL (RP)</label>
                    <input
                      type="number"
                      name="balance"
                      placeholder="0"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">INSTITUSI / NAMA BANK</label>
                  <input
                    type="text"
                    name="institutionName"
                    placeholder="Mandiri / BCA / Bibit"
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  />
                </div>
              </>
            )}

            {modalType === "record_transaction" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">AKUN SUMBER/TUJUAN</label>
                  <select
                    name="accountId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Akun --</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} ({acc.type}) - Saldo: Rp {acc.balance?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">TIPE MUTASI</label>
                    <select
                      name="type"
                      required
                      defaultValue="INCOME"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    >
                      <option value="INCOME">PEMASUKAN (INCOME)</option>
                      <option value="EXPENSE">PENGELUARAN (EXPENSE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">NOMINAL (RP)</label>
                    <input
                      type="number"
                      name="amount"
                      required
                      placeholder="0"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">KETERANGAN / CATATAN</label>
                  <input
                    type="text"
                    name="note"
                    placeholder="Contoh: Gaji Bulanan / Pembelian Bahan"
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  />
                </div>
              </>
            )}

            {modalType === "transfer" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">AKUN ASAL (DIBAYAR DARI)</label>
                  <select
                    name="sourceAccountId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Akun Asal --</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} - Saldo: Rp {acc.balance?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">AKUN TUJUAN (TOP-UP / RDN)</label>
                  <select
                    name="destinationAccountId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Akun Tujuan --</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} ({acc.type}) - Saldo: Rp {acc.balance?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">NOMINAL TRANSFER (RP)</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    placeholder="0"
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  />
                </div>
              </>
            )}

            {modalType === "create_asset" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">KODE ASET (TICKER)</label>
                  <input
                    type="text"
                    name="assetCode"
                    required
                    placeholder="BBCA / SMMF / ORI023"
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white uppercase focus:outline-none focus:border-[#C69214]"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">NAMA INSTRUMEN ASET</label>
                  <input
                    type="text"
                    name="assetName"
                    required
                    placeholder="Bank Central Asia Tbk"
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">TIPE INSTRUMEN</label>
                    <select
                      name="assetType"
                      required
                      defaultValue="SAHAM"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    >
                      <option value="SAHAM">SAHAM</option>
                      <option value="REKSADANA">REKSADANA</option>
                      <option value="OBLIGASI">OBLIGASI</option>
                      <option value="CRYPTO">CRYPTO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">HARGA PASAR AWAL (RP)</label>
                    <input
                      type="number"
                      name="currentPrice"
                      placeholder="10000"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === "buy_asset" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">AKUN RDN (SUMBER DANA)</label>
                  <select
                    name="rdnAccountId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Akun RDN --</option>
                    {accounts?.filter(a => a.type === "RDN")?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} - Saldo RDN: Rp {acc.balance?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">ASET INVESTASI</label>
                  <select
                    name="assetId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Aset --</option>
                    {assets?.map((a) => (
                      <option key={a._id} value={a._id}>
                        [{a.assetCode}] {a.assetName} - Harga: Rp {a.currentPrice?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-stone-600 mb-1">JUMLAH UNIT</label>
                    <input
                      type="number"
                      name="units"
                      required
                      placeholder="100"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">HARGA/UNIT</label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      required
                      placeholder="10000"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">BROKER FEE</label>
                    <input
                      type="number"
                      name="brokerFee"
                      placeholder="0"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === "sell_asset" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">AKUN RDN (PENAMPUNG HASIL)</label>
                  <select
                    name="rdnAccountId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Akun RDN --</option>
                    {accounts?.filter(a => a.type === "RDN")?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} - Saldo RDN: Rp {acc.balance?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">ASET DIJUAL</label>
                  <select
                    name="assetId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Aset --</option>
                    {assets?.map((a) => (
                      <option key={a._id} value={a._id}>
                        [{a.assetCode}] {a.assetName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-stone-600 mb-1">JUMLAH UNIT</label>
                    <input
                      type="number"
                      name="units"
                      required
                      placeholder="50"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">HARGA JUAL</label>
                    <input
                      type="number"
                      name="sellingPrice"
                      required
                      placeholder="11000"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">BROKER FEE</label>
                    <input
                      type="number"
                      name="brokerFee"
                      placeholder="0"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === "dividend" && (
              <>
                <div>
                  <label className="block text-stone-600 mb-1">ASET PEMBERI DIVIDEN</label>
                  <select
                    name="assetId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Aset --</option>
                    {assets?.map((a) => (
                      <option key={a._id} value={a._id}>
                        [{a.assetCode}] {a.assetName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">AKUN RDN PENERIMA DANA</label>
                  <select
                    name="rdnAccountId"
                    required
                    onChange={handleChange}
                    className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                  >
                    <option value="">-- Pilih Akun RDN --</option>
                    {accounts?.filter(a => a.type === "RDN")?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} - Saldo RDN: Rp {acc.balance?.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-1">JUMLAH DIVIDEN (RP)</label>
                    <input
                      type="number"
                      name="amountReceived"
                      required
                      placeholder="100000"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">POTONGAN PAJAK (RP)</label>
                    <input
                      type="number"
                      name="taxDeduction"
                      placeholder="0"
                      onChange={handleChange}
                      className="w-full p-2 border border-[#D1C7BD] bg-white focus:outline-none focus:border-[#C69214]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bottom Actions */}
            <div className="border-t border-[#D1C7BD] pt-4 mt-4 flex justify-between items-center">
              <span className="text-[10px] text-stone-500 font-mono-ledger flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> STAMPA DISAHKAN
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-[#D1C7BD] bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0D2D26] text-[#DFB143] border border-[#C69214] font-bold hover:bg-[#164239] transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Eksekusi Slip
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
