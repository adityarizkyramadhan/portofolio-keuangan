"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, CheckCircle, Clock, Trash2, Calendar, AlertCircle, Repeat } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import CustomDatePicker from "@/components/CustomDatePicker";

const RECURRING_OPTIONS = [
  { value: "ONCE", label: "Sekali Bayar (Non-Berulang)" },
  { value: "MONTHLY", label: "Berulang Setiap Bulan" },
  { value: "YEARLY", label: "Berulang Setiap Tahun" }
];

export default function RemindersView({ reminders, wallets, categories, onOpenModal, onMarkPaid, onDeleteReminder }) {
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [recurringType, setRecurringType] = useState("MONTHLY");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || !newDueDate) return;

    onOpenModal("create_reminder_direct", {
      title: newTitle.trim(),
      amount: Number(newAmount),
      dueDate: newDueDate,
      recurring: recurringType,
      walletId: selectedWalletId,
      categoryId: selectedCategoryId
    });

    setNewTitle("");
    setNewAmount("");
    setNewDueDate("");
  };

  return (
    <div className="space-y-6 pb-28 md:pb-6 font-sans">
      {/* Header & Add Reminder Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Pengingat Pembayaran & Tagihan</h3>
            <p className="text-xs text-slate-500">Jadwal jatuh tempo tagihan operasional dan kewajiban pembayaran rutin.</p>
          </div>
        </div>

        {/* Add Reminder Form */}
        <form onSubmit={handleAddReminder} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">NAMA TAGIHAN</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Listrik / Kos"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">NOMINAL (RP)</label>
              <input
                type="number"
                step="any"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Contoh: 2000000"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-bold"
              />
              {newAmount && Number(newAmount) > 0 && (
                <span className="text-[11px] font-bold text-indigo-600 block mt-1">
                  ≈ {formatIDR(Number(newAmount))}
                </span>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">JATUH TEMPO</label>
              <CustomDatePicker
                value={newDueDate}
                onChange={(val) => setNewDueDate(val)}
                placeholder="Pilih Tanggal..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">FREKUENSI BERULANG</label>
              <CustomSelect
                options={RECURRING_OPTIONS}
                value={recurringType}
                onChange={(val) => setRecurringType(val)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">SUMBER AKUN DANA (OPSIONAL)</label>
              <CustomSelect
                options={
                  wallets?.map((w) => ({
                    value: w._id,
                    label: `${w.name} - Saldo: Rp ${w.balance?.toLocaleString("id-ID")}`
                  })) || []
                }
                value={selectedWalletId}
                onChange={(val) => setSelectedWalletId(val)}
                placeholder="-- Pilih Akun Sumber --"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">KATEGORI (OPSIONAL)</label>
              <CustomSelect
                options={
                  categories
                    ?.filter((c) => c.type === "EXPENSE")
                    .map((c) => ({ value: c._id, label: c.name })) || []
                }
                value={selectedCategoryId}
                onChange={(val) => setSelectedCategoryId(val)}
                placeholder="-- Pilih Kategori --"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat Pengingat
            </button>
          </div>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders && reminders.length > 0 ? (
          reminders.map((rem, idx) => {
            const isPaid = rem.status === "PAID";
            const due = new Date(rem.dueDate);
            const isOverdue = !isPaid && due < new Date();
            const recLabel = rem.recurring === "YEARLY" ? "Tiap Tahun" : rem.recurring === "MONTHLY" ? "Tiap Bulan" : "Sekali";

            return (
              <motion.div
                key={rem._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isPaid
                    ? "border-slate-200 bg-slate-50/60"
                    : isOverdue
                    ? "border-rose-300 bg-rose-50/40"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${isPaid ? "bg-emerald-100 text-emerald-700" : isOverdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {isPaid ? <CheckCircle className="w-5 h-5" /> : isOverdue ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm ${isPaid ? "line-through text-slate-400" : "text-slate-900"}`}>{rem.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPaid ? "bg-emerald-100 text-emerald-800" : isOverdue ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                        {isPaid ? "SUDAH DIBAYAR" : isOverdue ? "JATUH TEMPO LEWAT" : "BELUM DIBAYAR"}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-semibold flex items-center gap-1">
                        <Repeat className="w-3 h-3" /> {recLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Jatuh Tempo: {due.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className={`text-base font-bold ${isPaid ? "text-slate-400" : "text-slate-900"}`}>
                    {formatIDR(rem.amount)}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isPaid && (
                      <button
                        onClick={() => onMarkPaid(rem)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                      >
                        Tandai Lunas
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteReminder(rem._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Hapus Pengingat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Belum ada pengingat pembayaran</p>
            <p className="text-xs text-slate-400 mt-1">Buat pengingat untuk tagihan bulanan seperti Kos, Listrik, atau Cicilan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
