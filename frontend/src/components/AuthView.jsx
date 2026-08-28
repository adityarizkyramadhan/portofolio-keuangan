"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, LogIn, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AuthView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.register(name, email, password);
      } else {
        res = await api.login(email, password);
      }

      if (res && res.success) {
        onLoginSuccess(res.data.user);
      } else {
        setErrorMsg(res.message || "Proses autentikasi tidak berhasil");
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6"
      >
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">KeuanganKu</h1>
          <p className="text-xs text-slate-500">
            {isRegister ? "Pendaftaran Akun Baru Manajemen Keuangan & Portofolio" : "Autentikasi Pengguna & Pengelolaan Keuangan"}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          {isRegister && (
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">NAMA LENGKAP</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Aditya Rizky Ramadhan"
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">ALAMAT EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">KATA KUNCI (PASSWORD)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Daftarkan Akun Baru
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke Aplikasi
              </>
            )}
          </button>
        </form>

        {/* Form Toggle */}
        <div className="text-center border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
            }}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            {isRegister ? "Sudah memiliki akun? Silakan Masuk" : "Belum memiliki akun? Daftarkan diri di sini"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
