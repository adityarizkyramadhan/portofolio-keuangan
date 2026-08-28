"use client";

import { useState, useEffect } from "react";
import { Globe, RefreshCw, DollarSign, ArrowRightLeft } from "lucide-react";

const CURRENCIES = [
  { code: "USD", name: "Dolar Amerika Serikat", symbol: "$", flag: "🇺🇸" },
  { code: "CNY", name: "Yuan Tiongkok", symbol: "¥", flag: "🇨🇳" },
  { code: "MYR", name: "Ringgit Malaysia", symbol: "RM", flag: "🇲🇾" },
  { code: "GBP", name: "Pound Sterling Inggris", symbol: "£", flag: "🇬🇧" },
  { code: "SAR", name: "Riyal Arab Saudi", symbol: "SR", flag: "🇸🇦" }
];

export default function CurrencyWidget({ netWorthIdr = 0 }) {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [calcInput, setCalcInput] = useState(100);

  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Free public open.er-api.com API for IDR base currency
      const res = await fetch("https://open.er-api.com/v6/latest/IDR");
      const data = await res.json();

      if (data && data.rates) {
        setRates(data.rates);
      } else {
        throw new Error("Gagal mengambil data nilai tukar");
      }
    } catch (err) {
      console.warn("Exchange Rate API warning:", err.message);
      // Fallback approximate rates if network is offline
      setRates({
        USD: 1 / 15800,
        CNY: 1 / 2180,
        MYR: 1 / 3550,
        GBP: 1 / 20100,
        SAR: 1 / 4210
      });
      setError("Menggunakan kurs estimasi (API offline)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const convertFromIDR = (amountIdr, targetCode) => {
    const rate = rates[targetCode];
    if (!rate) return 0;
    return amountIdr * rate;
  };

  const getRatePerIdr = (targetCode) => {
    const rate = rates[targetCode];
    if (!rate || rate === 0) return 0;
    return 1 / rate; // 1 Foreign Unit in IDR
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans text-xs">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Konversi Mata Uang Asing</h3>
            <p className="text-slate-500 text-[11px]">Nilai tukar real-time (API Kurs Publik)</p>
          </div>
        </div>

        <button
          onClick={fetchExchangeRates}
          disabled={loading}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
          title="Perbarui Kurs Real-Time"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px]">
          {error}
        </div>
      )}

      {/* Net Worth Multi-Currency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {CURRENCIES.map((c) => {
          const valInForeign = convertFromIDR(netWorthIdr, c.code);
          const rateInIdr = getRatePerIdr(c.code);

          return (
            <div key={c.code} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{c.flag} {c.code}</span>
                <span className="text-[10px] text-slate-400 font-mono">{c.symbol}</span>
              </div>
              <div className="text-sm font-bold text-indigo-600">
                {c.symbol} {valInForeign.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">
                1 {c.code} ≈ Rp {Math.round(rateInIdr).toLocaleString("id-ID")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculator Widget */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            value={calcInput}
            onChange={(e) => setCalcInput(Number(e.target.value) || 0)}
            className="w-24 p-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
          />
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="p-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>

        <ArrowRightLeft className="w-4 h-4 text-slate-400 hidden sm:block flex-shrink-0" />

        <div className="w-full sm:flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 flex justify-between items-center text-xs font-semibold text-indigo-900">
          <span>Setara dalam Rupiah (IDR):</span>
          <span className="text-sm font-bold text-indigo-600">
            Rp {Math.round(calcInput * getRatePerIdr(selectedCurrency)).toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
}
