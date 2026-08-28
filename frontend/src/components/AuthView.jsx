"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, LogIn, UserPlus, AlertCircle, Loader2, Fingerprint } from "lucide-react";
import { api } from "@/lib/api";
import { isBiometricSupported, isBiometricEnabled, getBiometricUser, authenticateWithBiometric, enableBiometricForUser } from "@/lib/biometric";

export default function AuthView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [biometricUser, setBiometricUser] = useState(null);

  useEffect(() => {
    if (isBiometricSupported() && isBiometricEnabled()) {
      setHasBiometric(true);
      setBiometricUser(getBiometricUser());
    }
  }, []);

  const handleBiometricLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const { token, user } = await authenticateWithBiometric();
      api.setToken(token);
      onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.message || "Gagal masuk dengan sidik jari.");
    } finally {
      setLoading(false);
    }
  };

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
        const token = res.data?.token || api.getToken();
        const user = res.data?.user;

        // Auto-enable biometric unlock on device for future quick access if supported
        if (isBiometricSupported() && user && token) {
          try {
            await enableBiometricForUser(user, token);
          } catch (bioErr) {
            console.log("Biometric auto-enable info:", bioErr.message);
          }
        }

        onLoginSuccess(user);
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

        {/* Biometric Quick Login Button (If Registered on Device) */}
        {!isRegister && hasBiometric && (
          <div className="space-y-2 bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl text-center">
            <span className="text-[11px] font-semibold text-indigo-900 block">
              Sidik jari terdaftar untuk: {biometricUser?.name || biometricUser?.email || "Perangkat ini"}
            </span>
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-emerald-100" /> Masuk dengan Sidik Jari (Biometrik)
                </>
              )}
            </button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-200/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-indigo-50/70 px-2 text-indigo-400 font-bold">atau masuk dengan email</span>
              </div>
            </div>
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
