"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Check, DollarSign, Calendar, Landmark, Sparkles, ArrowDownLeft } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export default function SalarySettingsModal({ isOpen, onClose, user, wallets = [], categories = [], onSaveSalarySettings, onRecordTransaction }) {
  const salaryList = user?.salarySettings || [];

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payDay, setPayDay] = useState(25);
  const [targetWalletId, setTargetWalletId] = useState(wallets?.[0]?._id || "");
  const [targetCategoryId, setTargetCategoryId] = useState("");

  if (!isOpen) return null;

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const totalFixedIncome = salaryList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const newItem = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      payDay: Number(payDay) || 25,
      walletId: targetWalletId || wallets?.[0]?._id || "",
      categoryId: targetCategoryId || null
    };

    const updatedList = [...salaryList, newItem];
    onSaveSalarySettings(updatedList);

    setTitle("");
    setAmount("");
    setPayDay(25);
  };

  const handleDeleteItem = (itemId) => {
    const updatedList = salaryList.filter((item) => item.id !== itemId && item._id !== itemId);
    onSaveSalarySettings(updatedList);
  };

  const handleClaimSalary = (item) => {
    if (!onRecordTransaction) return;

    const chosenWallet = wallets.find((w) => w._id === item.walletId) || wallets[0];
    onRecordTransaction({
      walletId: chosenWallet?._id,
      categoryId: item.categoryId || null,
      type: "INCOME",
      amount: item.amount,
      note: `Penerimaan Gaji Bulanan: ${item.title}`
    });
  };

  const incomeCategoryOptions = (categories || [])
    .filter((c) => c.type === "INCOME")
    .map((c) => ({ value: c._id, label: c.name }));

  const walletOptions = (wallets || []).map((w) => ({
    value: w._id,
    label: `${w.name} (${w.currency || "IDR"})`
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs font-sans p-3 sm:p-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          className="bg-white w-full sm:max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Pengaturan Gaji & Pendapatan Tetap Bulanan
              </h3>
              <p className="text-xs text-slate-500">Kelola sumber gaji pokok, tunjangan, dan pendapatan rutin bulanan Anda.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Total Summary Header Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] font-semibold text-indigo-200 uppercase block">Total Target Gaji Bulanan</span>
              <span className="text-2xl font-black tracking-tight">{formatIDR(totalFixedIncome)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-indigo-500/40 text-indigo-100 px-2.5 py-1 rounded-full font-bold">
                {salaryList.length} Sumber Gaji
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* List of Configured Salaries */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">Daftar Sumber Gaji Bulanan</span>
              {salaryList && salaryList.length > 0 ? (
                salaryList.map((item, idx) => {
                  const walletObj = wallets.find((w) => w._id === item.walletId);
                  return (
                    <div key={item.id || item._id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate">{item.title}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-extrabold">
                            Gajian Tgl {item.payDay}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          Tujuan: <span className="font-semibold text-slate-700">{walletObj?.name || "Akun Utama"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <span className="font-extrabold text-sm text-emerald-600">{formatIDR(item.amount)}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleClaimSalary(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Catat penerimaan gaji ke rekening"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Cairkan
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id || item._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Hapus Pengaturan Gaji"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                  <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada pengaturan gaji bulanan</p>
                  <p className="text-[11px] text-slate-400">Tambahkan sumber gaji pokok atau tunjangan tetap Anda di bawah ini.</p>
                </div>
              )}
            </div>

            {/* Form Add New Fixed Salary */}
            <form onSubmit={handleAddItem} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Tambah Sumber Pendapatan Tetap Baru</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">NAMA GAJI / PENDAPATAN</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Gaji Pokok Kantor / Sewa Kos"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">NOMINAL PER BULAN (RP)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 15000000"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">TANGGAL GAJIAN BULANAN (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={payDay}
                    onChange={(e) => setPayDay(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">REKENING / BANK TUJUAN</label>
                  <CustomSelect
                    options={walletOptions}
                    value={targetWalletId}
                    onChange={(val) => setTargetWalletId(val)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Simpan Sumber Gaji
                </button>
              </div>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              Selesai
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
