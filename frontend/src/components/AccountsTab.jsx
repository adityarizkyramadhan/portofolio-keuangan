"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Landmark, Wallet, ArrowLeftRight, PlusCircle, ArrowUpRight, ArrowDownRight, Shield } from "lucide-react";

export default function AccountsTab({ accounts, onOpenModal }) {
  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const getAccountBadge = (type) => {
    switch (type) {
      case "RDN":
        return { bg: "bg-[#0D2D26]", text: "text-[#DFB143]", border: "border-[#C69214]", label: "REKENING DANA NASABAH (RDN)" };
      case "BANK":
        return { bg: "bg-[#1A365D]", text: "text-white", border: "border-blue-400", label: "REKENING BANK UTAMA" };
      case "E_WALLET":
        return { bg: "bg-[#8B1E1E]", text: "text-white", border: "border-red-400", label: "DOMPET ELEKTRONIK" };
      default:
        return { bg: "bg-stone-800", text: "text-amber-200", border: "border-amber-400", label: "KAS TUNAI (CASH)" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-[#FFFDF9] border-2 border-[#D1C7BD] p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div>
          <h2 className="font-serif-vintage text-xl font-bold text-[#0D2D26]">Buku Kas & Akun RDN Nasabah</h2>
          <p className="text-xs font-mono-ledger text-stone-500">Pencatatan sumber daya likuiditas dan transfer antar rekening.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOpenModal("create_account")}
            className="px-3 py-2 bg-[#0D2D26] text-[#DFB143] border border-[#C69214] font-mono-ledger text-xs font-bold hover:bg-[#164239] transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" />
            + Buat Akun / RDN
          </button>
          <button
            onClick={() => onOpenModal("record_transaction")}
            className="px-3 py-2 bg-[#FAF6EF] text-[#0D2D26] border border-[#D1C7BD] font-mono-ledger text-xs font-bold hover:bg-stone-200 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Catat Pemasukan / Pengeluaran
          </button>
          <button
            onClick={() => onOpenModal("transfer")}
            className="px-3 py-2 bg-[#C69214] text-[#0D2D26] font-mono-ledger text-xs font-bold hover:bg-[#DFB143] transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer Antar Akun (Top-Up RDN)
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts && accounts.length > 0 ? (
          accounts.map((acc, idx) => {
            const style = getAccountBadge(acc.type);
            return (
              <motion.div
                key={acc._id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className={`border-2 ${style.border} ${style.bg} ${style.text} p-5 shadow-lg relative flex flex-col justify-between overflow-hidden min-h-[190px]`}
              >
                {/* Background Passbook Seal */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl select-none font-serif-vintage">
                  🏛️
                </div>

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono-ledger uppercase tracking-wider px-2 py-0.5 border border-current opacity-80">
                      {style.label}
                    </span>
                    <Shield className="w-5 h-5 opacity-80" />
                  </div>

                  <h3 className="font-serif-vintage text-xl font-bold tracking-wide">{acc.name}</h3>
                  {acc.institutionName && (
                    <p className="text-xs font-mono-ledger opacity-75">{acc.institutionName} • {acc.accountNumber || "No. Rek: -"}</p>
                  )}
                </div>

                <div className="mt-6 border-t border-current/20 pt-3 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-mono-ledger uppercase opacity-75 block">SALDO LIKUIDITAS</span>
                    <span className="font-mono-ledger text-2xl font-bold tracking-tight">
                      {formatIDR(acc.balance)}
                    </span>
                  </div>
                  <span className="stamp-badge text-[9px] border-current text-current opacity-80">RESMI</span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full bg-[#FFFDF9] border-2 border-dashed border-[#D1C7BD] p-8 text-center">
            <Landmark className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <p className="font-serif-vintage text-stone-600 text-base font-bold">Belum Ada Akun Terdaftar</p>
            <p className="text-xs font-mono-ledger text-stone-500 mt-1">Silakan klik tombol di atas untuk mendaftarkan akun Bank, E-Wallet, atau RDN.</p>
          </div>
        )}
      </div>
    </div>
  );
}
