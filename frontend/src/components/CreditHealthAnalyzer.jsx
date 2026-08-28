"use client";

import { useState } from "react";
import { Calculator, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, DollarSign } from "lucide-react";

export default function CreditHealthAnalyzer({ monthlyIncome = 0, existingInstallments = 0 }) {
  const [plannedInstallment, setPlannedInstallment] = useState("");

  const income = Number(monthlyIncome) || 0;
  const existing = Number(existingInstallments) || 0;
  const newInstallment = Number(plannedInstallment) || 0;

  const totalMonthlyDebt = existing + newInstallment;
  const dsrRatio = income > 0 ? (totalMonthlyDebt / income) * 100 : 0;

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);
  };

  const getHealthDiagnosis = () => {
    if (income <= 0) {
      return {
        status: "TIDAK ADA DATA PEMASUKAN",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Calculator,
        title: "Pemasukan Bulanan Belum Tercatat",
        description: "Silakan catat Pemasukan Kas pada bulan ini terlebih dahulu untuk melakukan analisa rasio beban cicilan (Debt Service Ratio)."
      };
    }

    if (dsrRatio <= 30) {
      return {
        status: "SANGAT SEHAT",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: CheckCircle2,
        title: "🟢 Aman & Sehat untuk Mengambil Cicilan Ini",
        description: `Beban total cicilan Anda (${dsrRatio.toFixed(1)}%) masih di bawah batas maksimal rekomendasi finansial (30%). Struktur keuangan Anda sangat kuat dan memiliki sisa arus kas yang aman.`
      };
    }

    if (dsrRatio <= 40) {
      return {
        status: "CUKUP SEHAT (WASPADA)",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        icon: AlertTriangle,
        title: "🟡 Cukup Sehat, Namun Perlu Waspada",
        description: `Beban total cicilan Anda (${dsrRatio.toFixed(1)}%) berada pada rentang riset 30% - 40% dari pemasukan. Mengambil cicilan ini diperbolehkan, namun dapat mengurangi fleksibilitas tabungan harian Anda.`
      };
    }

    return {
      status: "TIDAK SEHAT (BERISIKO)",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      icon: AlertOctagon,
      title: "🔴 TIDAK SEHAT: Berisiko Tinggi Menyebabkan Gagal Bayar",
      description: `Beban total cicilan Anda (${dsrRatio.toFixed(1)}%) melebihi 40% dari total pemasukan bulanan! Sangat tidak direkomendasikan mengambil cicilan ini karena berisiko memicu defisit kas dan gagal bayar.`
    };
  };

  const diagnosis = getHealthDiagnosis();
  const DiagnosisIcon = diagnosis.icon;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Analisa Kesehatan Cicilan (Debt Service Ratio)</h3>
            <p className="text-[11px] text-slate-500">Evaluasi kelayakan beban utang sebelum mengambil cicilan baru.</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${diagnosis.badgeColor}`}>
          {diagnosis.status}
        </span>
      </div>

      {/* Simulator Input Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Pemasukan Bulanan</span>
          <span className="text-sm font-bold text-slate-900">{formatIDR(income)}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cicilan / Pengeluaran Rutin</span>
          <span className="text-sm font-bold text-slate-900">{formatIDR(existing)}</span>
        </div>

        <div>
          <label className="text-[10px] text-indigo-700 font-bold block uppercase mb-1">SIMULASI CICILAN BARU (RP/BLN)</label>
          <input
            type="number"
            step="any"
            placeholder="Masukkan cicilan baru..."
            value={plannedInstallment}
            onChange={(e) => setPlannedInstallment(e.target.value)}
            className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
          />
          {plannedInstallment && Number(plannedInstallment) > 0 && (
            <span className="text-[10px] font-bold text-indigo-700 block mt-1">
              ≈ {formatIDR(Number(plannedInstallment))}
            </span>
          )}
        </div>
      </div>

      {/* DSR Result & Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-700">Rasio Beban Cicilan (Debt Burden Ratio)</span>
          <span className={dsrRatio > 40 ? "text-rose-600" : dsrRatio > 30 ? "text-amber-600" : "text-emerald-600"}>
            {dsrRatio.toFixed(1)}% dari Pemasukan
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              dsrRatio > 40 ? "bg-rose-500" : dsrRatio > 30 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, dsrRatio)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
          <span>0% (Bebas Cicilan)</span>
          <span>30% (Batas Ideal)</span>
          <span>40% (Batas Maksimum)</span>
          <span>100% (Defisit Total)</span>
        </div>
      </div>

      {/* Diagnosis Recommendation Box */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${diagnosis.badgeColor}`}>
        <DiagnosisIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-xs">{diagnosis.title}</h4>
          <p className="text-[11px] leading-relaxed">{diagnosis.description}</p>
        </div>
      </div>
    </div>
  );
}
