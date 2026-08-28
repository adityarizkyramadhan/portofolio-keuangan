"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Landmark, CreditCard, Building2, Coins, Vault, Trash2, ShieldCheck, Globe, QrCode, RotateCcw, Receipt, X } from "lucide-react";

const CURRENCY_SYMBOLS = {
  IDR: "Rp",
  USD: "$",
  CNY: "¥",
  MYR: "RM",
  GBP: "£",
  SAR: "SR"
};

export default function WalletsView({ wallets, transactions = [], onOpenModal, onDeleteWallet, onRecalculateWallets }) {
  const [rates, setRates] = useState({});
  const [recalculating, setRecalculating] = useState(false);
  const [activeAuditWallet, setActiveAuditWallet] = useState(null);

  const handleRecalculateClick = async () => {
    if (!onRecalculateWallets) return;
    setRecalculating(true);
    try {
      await onRecalculateWallets();
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    // Fetch live rates from public API for foreign currency wallets IDR conversion
    fetch("https://open.er-api.com/v6/latest/IDR")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) setRates(data.rates);
      })
      .catch(() => {
        setRates({
          USD: 1 / 15800,
          CNY: 1 / 2180,
          MYR: 1 / 3550,
          GBP: 1 / 20100,
          SAR: 1 / 4210
        });
      });
  }, []);

  const resolveCurrency = (w) => {
    if (w.currency && w.currency !== "IDR") return w.currency;
    const nameUpper = (w.name || "").toUpperCase();
    if (nameUpper.includes("USD")) return "USD";
    if (nameUpper.includes("CNY")) return "CNY";
    if (nameUpper.includes("MYR")) return "MYR";
    if (nameUpper.includes("GBP")) return "GBP";
    if (nameUpper.includes("SAR")) return "SAR";
    return w.currency || "IDR";
  };

  const formatNativeBalance = (balance, currency = "IDR") => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(balance || 0);
    }
    return `${symbol} ${Number(balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getEquivalentIDR = (balance, currency = "IDR") => {
    if (currency === "IDR") return null;
    const rate = rates[currency];
    if (!rate || rate === 0) return null;
    const valInIdr = balance / rate;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(valInIdr);
  };

  const getWalletIcon = (type) => {
    switch (type) {
      case "CREDIT_CARD":
        return <CreditCard className="w-5 h-5 text-rose-600" />;
      case "RDN":
        return <Landmark className="w-5 h-5 text-indigo-600" />;
      case "BANK":
      case "BANK_SAVINGS":
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case "QRIS":
        return <QrCode className="w-5 h-5 text-indigo-600" />;
      case "E_WALLET":
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case "CRYPTO_WALLET":
        return <Coins className="w-5 h-5 text-amber-600" />;
      case "DEPOSITO":
        return <Vault className="w-5 h-5 text-emerald-600" />;
      default:
        return <Wallet className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getWalletLabel = (type) => {
    switch (type) {
      case "CREDIT_CARD":
        return "Kartu Kredit";
      case "BANK":
        return "Bank Utama / Debit";
      case "BANK_SAVINGS":
        return "Bank Tabungan";
      case "RDN":
        return "RDN Sekuritas";
      case "QRIS":
        return "QRIS / Pembayaran QR";
      case "E_WALLET":
        return "E-Wallet / QRIS";
      case "CASH":
        return "Uang Tunai";
      case "DEPOSITO":
        return "Deposito / Giro";
      case "CRYPTO_WALLET":
        return "Dompet Kripto";
      default:
        return type || "Akun Keuangan";
    }
  };

  // Group wallets by categories
  const bankWallets = wallets?.filter((w) => (w.type === "BANK" || w.type === "BANK_SAVINGS" || w.type === "CASH") && resolveCurrency(w) === "IDR") || [];
  const qrisWallets = wallets?.filter((w) => (w.type === "E_WALLET" || w.type === "QRIS") && resolveCurrency(w) === "IDR") || [];
  const creditCards = wallets?.filter((w) => w.type === "CREDIT_CARD") || [];
  const valasWallets = wallets?.filter((w) => resolveCurrency(w) !== "IDR") || [];
  const rdnAndInvestWallets = wallets?.filter((w) => w.type === "RDN" || w.type === "DEPOSITO" || w.type === "CRYPTO_WALLET") || [];

  const walletGroups = [
    { title: "🏛️ Rekening Bank Debit & Cash Utama", items: bankWallets },
    { title: "📱 QRIS & Dompet Digital (E-Wallet)", items: qrisWallets },
    { title: "💳 Kartu Kredit & Limit", items: creditCards },
    { title: "🌐 Akun Valas (Mata Uang Asing)", items: valasWallets },
    { title: "📈 RDN Sekuritas & Deposito", items: rdnAndInvestWallets }
  ].filter((g) => g.items.length > 0);

  const renderCard = (w, idx) => {
    const currency = resolveCurrency(w);
    const isCreditCard = w.type === "CREDIT_CARD";

    const limit = Number(w.creditLimit) || 0;
    const remaining = Number(w.balance) || 0;
    const used = limit > 0 ? Math.max(0, limit - remaining) : 0;
    const usagePercent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const equivalentIDR = getEquivalentIDR(isCreditCard ? remaining : w.balance, currency);

    return (
      <motion.div
        key={w._id || idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 bg-slate-100 rounded-xl flex-shrink-0">{getWalletIcon(w.type)}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 text-sm truncate">{w.name}</h3>
              <span className="text-[11px] font-medium text-slate-400 uppercase">{getWalletLabel(w.type)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold">
              {currency}
            </span>
            {onDeleteWallet && (
              <button
                onClick={() => onDeleteWallet(w._id, w.name)}
                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Hapus Akun Keuangan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isCreditCard ? (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Sisa Limit Terpakai</span>
              <span className="font-bold text-emerald-600">{formatNativeBalance(remaining, currency)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Tagihan Terpakai</span>
              <span className="font-bold text-rose-600">{formatNativeBalance(used, currency)}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                <span>PENGGUNAAN LIMIT ({usagePercent}%)</span>
                <span>LIMIT TOTAL: {formatNativeBalance(limit, currency)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    usagePercent > 80 ? "bg-rose-500" : usagePercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {/* CC Settlement Quick Button */}
            {used > 0 && onOpenModal && (
              <button
                onClick={() => {
                  const defaultSource = bankWallets[0] || wallets?.find((x) => x.type === "BANK" || x.type === "BANK_SAVINGS");
                  onOpenModal("transfer", {
                    destinationWalletId: w._id,
                    sourceWalletId: defaultSource?._id || "",
                    amount: used,
                    note: `Pelunasan Tagihan Kartu Kredit ${w.name}`
                  });
                }}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                Bayar Tagihan CC ({formatNativeBalance(used, currency)})
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Saldo Terkini</span>
              <span className="text-lg font-bold text-slate-900 tracking-tight">{formatNativeBalance(w.balance, currency)}</span>
              {equivalentIDR && <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">≈ {equivalentIDR}</span>}
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold uppercase">
              {getWalletLabel(w.type)}
            </span>
          </div>
        )}

        {/* Audit Trail Button */}
        <button
          onClick={() => setActiveAuditWallet(w)}
          className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5 text-indigo-600" />
          Riwayat Mutasi Akun
        </button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5 pb-28 md:pb-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Akun Keuangan & Kartu Kredit</h2>
          <p className="text-xs text-slate-500">Pencatatan akun Rupiah, Kartu Kredit (Limit Total & Sisa Limit), serta Valas (USD, CNY, MYR, GBP, SAR).</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {onRecalculateWallets && (
            <button
              onClick={handleRecalculateClick}
              disabled={recalculating}
              className="w-full sm:w-auto px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              title="Hitung ulang saldo dan sisa limit berdasarkan riwayat transaksi"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? "animate-spin text-indigo-600" : ""}`} />
              <span>Hitung Ulang Saldo</span>
            </button>
          )}
          <button
            onClick={() => onOpenModal("create_wallet")}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> Tambah Akun
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onOpenModal("cash_in")}
          className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-center cursor-pointer transition"
        >
          <ArrowDownLeft className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
          <span className="text-xs font-bold block">Pemasukan</span>
        </button>

        <button
          onClick={() => onOpenModal("cash_out")}
          className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-center cursor-pointer transition"
        >
          <ArrowUpRight className="w-5 h-5 mx-auto text-rose-600 mb-1" />
          <span className="text-xs font-bold block">Pengeluaran / Cicilan</span>
        </button>

        <button
          onClick={() => onOpenModal("transfer")}
          className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-center cursor-pointer transition"
        >
          <ArrowLeftRight className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
          <span className="text-xs font-bold block">Transfer Akun</span>
        </button>
      </div>

      {/* Grouped Wallets View */}
      {walletGroups && walletGroups.length > 0 ? (
        walletGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">{group.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((w, idx) => renderCard(w, idx))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">Belum ada akun keuangan terdaftar</p>
          <p className="text-xs text-slate-400 mt-1">Tekan tombol "+ Tambah Akun" untuk mendaftarkan rekening Rupiah, Kartu Kredit, atau Valas.</p>
        </div>
      )}
      {/* Wallet Audit Trail Modal */}
      {activeAuditWallet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs font-sans p-3 sm:p-6 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full sm:max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col my-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  Riwayat Mutasi: {activeAuditWallet.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium uppercase">{getWalletLabel(activeAuditWallet.type)}</span>
              </div>
              <button onClick={() => setActiveAuditWallet(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(() => {
                const walletTxs = (transactions || []).filter(
                  (tx) =>
                    tx.accountId?.toString() === activeAuditWallet._id?.toString() ||
                    tx.destinationAccountId?.toString() === activeAuditWallet._id?.toString()
                );

                if (walletTxs.length === 0) {
                  return (
                    <div className="p-8 text-center space-y-1">
                      <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">Belum ada mutasi transaksi untuk akun ini.</p>
                    </div>
                  );
                }

                return walletTxs.map((tx, idx) => {
                  const isSource = tx.accountId?.toString() === activeAuditWallet._id?.toString();
                  const isIncome = tx.type === "INCOME" || (!isSource && tx.type === "TRANSFER");
                  const isExpense = tx.type === "EXPENSE" || (isSource && tx.type === "TRANSFER");

                  return (
                    <div key={tx._id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{tx.categoryName || (tx.type === "TRANSFER" ? "Transfer" : "Transaksi")}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {tx.note || "Tanpa catatan"} • {new Date(tx.date || tx.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <span className={`font-bold text-xs ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                        {isIncome ? "+" : "-"}{formatNativeBalance(tx.amount, resolveCurrency(activeAuditWallet))}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
