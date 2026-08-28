"use client";

import { useState, useEffect } from "react";
import { Landmark, ShieldCheck, Clock, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, liveMode, setLiveMode, netWorth }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const navItems = [
    { id: "dashboard", label: "1. Ikhtisar Kekayaan", desc: "Net Worth & Alokasi" },
    { id: "accounts", label: "2. Buku Kas & RDN", desc: "Manajemen Likuiditas" },
    { id: "investments", label: "3. Transaksi Portofolio", desc: "Beli / Jual / Dividen" },
    { id: "ledger", label: "4. Jurnal Mutasi", desc: "Buku Ledger Audit" }
  ];

  return (
    <header className="border-b-4 border-[#C69214] bg-[#0D2D26] text-[#FAF6EF] shadow-2xl">
      {/* Top Ticker Bar */}
      <div className="bg-[#081C18] px-4 py-1.5 text-xs border-b border-[#164239] flex flex-wrap justify-between items-center font-mono-ledger text-[#DFB143]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            KLASIFIKASI: DOKUMEN RESMI NASABAH
          </span>
          <span className="hidden sm:inline text-stone-400">|</span>
          <span className="hidden sm:inline text-stone-300">NO. BUKU: BDN-2026-88910</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#DFB143]">
            <Clock className="w-3.5 h-3.5" />
            <span>WIB: {timeStr}</span>
          </div>
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              liveMode ? "bg-emerald-800 text-emerald-100 border border-emerald-500" : "bg-[#8B1E1E] text-stone-100 border border-red-400"
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            {liveMode ? "API Live Backend" : "Mode Demo Standalone"}
          </button>
        </div>
      </div>

      {/* Main Bank Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C69214] text-[#0D2D26] rounded-sm border-2 border-[#DFB143] shadow-lg">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-vintage text-2xl sm:text-3xl font-bold tracking-wide text-[#FAF6EF]">
                BANK PORTOFOLIO KEUANGAN
              </h1>
              <span className="stamp-badge text-[10px] hidden sm:inline-block">TERVERIFIKASI</span>
            </div>
            <p className="text-xs text-[#DFB143] font-mono-ledger mt-0.5 tracking-wider uppercase">
              SEJAK 2026 • LIKUIDITAS, AKUN RDN & MASTER PORTOFOLIO ASET
            </p>
          </div>
        </div>

        {/* Total Net Worth Counter Display */}
        <div className="w-full md:w-auto bg-[#081C18] border-2 border-[#C69214] p-3 rounded-sm flex items-center justify-between md:justify-end gap-4 shadow-inner">
          <div className="text-right">
            <span className="text-[10px] font-mono-ledger uppercase text-stone-400 block tracking-widest">
              NILAI KEKAYAAN BERSIH (NET WORTH)
            </span>
            <span className="font-mono-ledger text-xl sm:text-2xl font-bold text-[#DFB143]">
              {formatIDR(netWorth)}
            </span>
          </div>
          <div className="p-2 bg-[#C69214]/20 border border-[#C69214] rounded">
            <ShieldCheck className="w-6 h-6 text-[#C69214]" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#123A31] border-t border-[#1C5247] px-4">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-2 py-2 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded.none text-left transition-all duration-200 cursor-pointer flex-shrink-0 border-b-2 ${
                  isActive
                    ? "bg-[#FAF6EF] text-[#0D2D26] border-[#C69214] font-bold shadow-md transform -translate-y-0.5"
                    : "bg-[#0D2D26]/60 text-stone-300 border-transparent hover:bg-[#164239] hover:text-[#FAF6EF]"
                }`}
              >
                <div className="font-serif-vintage text-sm font-semibold">{item.label}</div>
                <div className={`text-[10px] font-mono-ledger ${isActive ? "text-[#0D2D26]/80" : "text-stone-400"}`}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
