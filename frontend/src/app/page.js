"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Wallet, TrendingUp, Tag, Bell, ShieldCheck, LogOut, WifiOff, RefreshCw, Loader2, Receipt, PieChart, MoreHorizontal, X } from "lucide-react";
import AuthView from "@/components/AuthView";
import DashboardView from "@/components/DashboardView";
import WalletsView from "@/components/WalletsView";
import PortfolioView from "@/components/PortfolioView";
import TransactionsView from "@/components/TransactionsView";
import RemindersView from "@/components/RemindersView";
import TransactionsLedgerView from "@/components/TransactionsLedgerView";
import BudgetingView from "@/components/BudgetingView";
import FormModal from "@/components/FormModal";
import Toast from "@/components/Toast";
import {
  DashboardSkeleton,
  WalletsSkeleton,
  PortfolioSkeleton,
  TransactionsSkeleton
} from "@/components/SkeletonLoader";
import { api } from "@/lib/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [targetAsset, setTargetAsset] = useState(null);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState(null);

  // Month Rekap State
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1
  });

  // Toast Notification Trigger
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Live Backend Data States
  const [wallets, setWallets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    netWorth: 0,
    totalWalletsBalance: 0,
    totalAssetsValue: 0,
    monthlyCashFlow: { income: 0, expense: 0, netSavings: 0, monthName: "" },
    allocation: []
  });

  // Check auth session on load
  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    setCheckingAuth(true);
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setCheckingAuth(false);
      return;
    }

    try {
      const res = await api.getProfile();
      if (res && res.success) {
        setUser(res.data);
        fetchLiveBackendData(selectedDate.year, selectedDate.month);
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn("Auth check error:", err.message);
      setIsBackendOffline(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchLiveBackendData = async (targetYear = selectedDate.year, targetMonth = selectedDate.month) => {
    setLoadingData(true);
    setIsBackendOffline(false);

    try {
      const [dashRes, walletRes, assetRes, catRes, remRes, txRes] = await Promise.all([
        api.getDashboard(targetYear, targetMonth),
        api.getWallets(),
        api.getPortfolioAssets(),
        api.getCategories(),
        api.getReminders().catch(() => ({ data: [] })),
        api.getTransactions(150).catch(() => ({ data: [] }))
      ]);

      if (dashRes && dashRes.data) setDashboardData(dashRes.data);
      if (walletRes && walletRes.data) setWallets(walletRes.data);
      if (assetRes && assetRes.data) setAssets(assetRes.data);
      if (catRes && catRes.data) setCategories(catRes.data);
      if (remRes && remRes.data) setReminders(remRes.data);
      if (txRes && txRes.data) setTransactions(txRes.data);
    } catch (err) {
      console.error("[Live Backend API Error]", err.message);
      setIsBackendOffline(true);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMonthChange = (newYear, newMonth) => {
    setSelectedDate({ year: newYear, month: newMonth });
    fetchLiveBackendData(newYear, newMonth);
  };

  const handleLogout = () => {
    api.setToken(null);
    setUser(null);
    showToast("success", "Sesi berhasil diakhiri.");
  };

  const handleOpenModal = (type, data = null) => {
    if (type === "create_reminder_direct") {
      handleCreateReminderDirect(data);
      return;
    }
    setModalType(type);
    if (type === "override_value") setTargetAsset(data);
    setIsModalOpen(true);
  };

  const handleDeleteWallet = async (id, name) => {
    try {
      await api.deleteWallet(id);
      showToast("success", `Akun "${name}" berhasil dihapus!`);
      fetchLiveBackendData();
    } catch (e) {
      showToast("error", e.message || "Gagal menghapus akun");
    }
  };

  const handleRecalculateWallets = async () => {
    try {
      await api.recalculateWallets();
      showToast("success", "Kalkulasi ulang saldo & limit akun berhasil diperbarui!");
      fetchLiveBackendData();
    } catch (e) {
      showToast("error", e.message || "Gagal melakukan hitung ulang saldo");
    }
  };

  const handleImportTransactions = async (importedList) => {
    try {
      showToast("success", `Memproses impor ${importedList.length} entri transaksi...`);
      let successCount = 0;
      for (const tx of importedList) {
        if (tx.accountId && tx.type && tx.amount) {
          await api.recordWalletTransaction({
            walletId: tx.accountId,
            categoryId: tx.categoryId || null,
            type: tx.type,
            amount: tx.amount,
            note: tx.note || "Impor Data",
            date: tx.date || tx.createdAt
          }).catch(() => null);
          successCount++;
        }
      }
      showToast("success", `Berhasil mengimpor ${successCount} transaksi!`);
      fetchLiveBackendData();
    } catch (err) {
      showToast("error", err.message || "Gagal mengimpor data transaksi");
    }
  };

  const handleCreateReminderDirect = async (reminderData) => {
    try {
      await api.createReminder(reminderData);
      showToast("success", `Pengingat "${reminderData.title}" berhasil dibuat!`);
      fetchLiveBackendData();
    } catch (err) {
      showToast("error", err.message || "Gagal membuat pengingat pembayaran");
    }
  };

  const handleMarkReminderPaid = async (reminderOrId) => {
    try {
      const id = typeof reminderOrId === "object" ? reminderOrId._id : reminderOrId;
      await api.markReminderPaid(id);

      if (typeof reminderOrId === "object" && reminderOrId.walletId && reminderOrId.amount > 0) {
        await api.recordWalletTransaction({
          walletId: reminderOrId.walletId,
          categoryId: reminderOrId.categoryId || null,
          type: "EXPENSE",
          amount: reminderOrId.amount,
          note: `Pelunasan Tagihan: ${reminderOrId.title}`
        });
        showToast("success", `Tagihan "${reminderOrId.title}" dilunasi & dicatat ke pengeluaran kas!`);
      } else {
        showToast("success", "Pengingat pembayaran berhasil ditandai lunas!");
      }

      fetchLiveBackendData();
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui status pengingat");
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.deleteReminder(id);
      showToast("success", "Pengingat pembayaran berhasil dihapus!");
      fetchLiveBackendData();
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus pengingat");
    }
  };

  const handleAddCategoryDirect = async (categoryData) => {
    try {
      await api.createCategory(categoryData.name, categoryData.type);
      showToast("success", `Kategori "${categoryData.name}" berhasil ditambahkan!`);
      fetchLiveBackendData();
    } catch (err) {
      showToast("error", err.message || "Gagal membuat kategori");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      showToast("success", "Kategori transaksi berhasil dihapus!");
      fetchLiveBackendData();
    } catch (e) {
      showToast("error", e.message || "Gagal menghapus kategori");
    }
  };

  const handleUpdateCategoryLimit = async (categoryId, limit) => {
    try {
      await api.updateCategoryLimit(categoryId, limit);
      showToast("success", "Batas anggaran kategori berhasil disimpan!");
      fetchLiveBackendData();
    } catch (e) {
      showToast("error", e.message || "Gagal memperbarui batas anggaran kategori");
    }
  };

  const handleModalSubmit = async (type, data) => {
    try {
      if (type === "create_wallet") {
        await api.createWallet(data);
        showToast("success", "Akun keuangan berhasil ditambahkan!");
      } else if (type === "cash_in" || type === "cash_out") {
        await api.recordWalletTransaction({
          walletId: data.walletId,
          categoryId: data.categoryId,
          type: type === "cash_in" ? "INCOME" : "EXPENSE",
          amount: data.amount,
          note: data.note
        });
        showToast("success", `Pencatatan ${type === "cash_in" ? "Pemasukan" : "Pengeluaran"} berhasil disimpan!`);
      } else if (type === "transfer") {
        await api.transferWallets(data);
        showToast("success", "Transfer antar akun keuangan berhasil!");
      } else if (type === "create_asset") {
        await api.createAsset(data);
        showToast("success", "Instrumen investasi berhasil ditambahkan!");
      } else if (type === "buy_sell") {
        await api.buyOrSellAsset(data);
        showToast("success", "Transaksi investasi berhasil diproses!");
      } else if (type === "override_value" && targetAsset) {
        await api.overrideAssetValue(targetAsset._id, data.newTotalValue);
        showToast("success", `Nilai terkini instrumen "${targetAsset.name}" berhasil diperbarui!`);
      }

      fetchLiveBackendData();
    } catch (err) {
      showToast("error", err.message || "Gagal memproses transaksi");
    }
  };

  // Loading Session Screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat Sesi KeuanganKu...</p>
        </div>
      </div>
    );
  }

  // Mandatory Login Screen
  if (!user) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AuthView
          onLoginSuccess={(u) => {
            setUser(u);
            showToast("success", `Selamat datang kembali, ${u.name}!`);
            fetchLiveBackendData();
          }}
        />
      </>
    );
  }

  const PRIMARY_NAV_ITEMS = [
    { id: "dashboard", label: "Dasbor", icon: LayoutDashboard },
    { id: "ledger", label: "Transaksi", icon: Receipt },
    { id: "wallets", label: "Akun Keuangan", icon: Wallet },
    { id: "portfolio", label: "Investasi", icon: TrendingUp }
  ];

  const SECONDARY_NAV_ITEMS = [
    { id: "budgeting", label: "Anggaran & Target", icon: PieChart },
    { id: "reminders", label: "Pengingat Tagihan", icon: Bell },
    { id: "transactions", label: "Kategori Transaksi", icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Toast Popup Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen p-4 justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base leading-tight">KeuanganKu</h1>
              <span className="text-[11px] text-slate-400 block truncate">{user.name}</span>
            </div>
          </div>

          <nav className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-1.5">UTAMA</span>
              <div className="space-y-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 mb-1.5">PERENCANAAN & MASTER</span>
              <div className="space-y-1">
                {SECONDARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => {
              showToast("success", "Memperbarui data live backend...");
              fetchLiveBackendData();
            }}
            disabled={loadingData}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-indigo-600" : ""}`} /> Refresh Data
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base leading-tight">KeuanganKu</h1>
                <span className="text-[10px] text-slate-500 block">Pengguna: {user.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast("success", "Memperbarui data live backend...");
                  fetchLiveBackendData();
                }}
                disabled={loadingData}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
                title="Perbarui Data"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin text-indigo-600" : ""}`} />
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </div>
          </div>
        </header>

        {/* Backend Offline Warning Banner */}
        {isBackendOffline && (
          <div className="bg-amber-500 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Koneksi API Backend Terputus:</strong> Tidak dapat terhubung ke server backend API. Pastikan server backend & database terhubung.
              </span>
            </div>
            <button
              onClick={() => fetchLiveBackendData()}
              className="px-2.5 py-1 bg-white text-amber-900 font-bold rounded text-[11px] hover:bg-amber-100 transition cursor-pointer flex-shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5">
          {loadingData ? (
            <>
              {activeTab === "dashboard" && <DashboardSkeleton />}
              {activeTab === "wallets" && <WalletsSkeleton />}
              {activeTab === "portfolio" && <PortfolioSkeleton />}
              {activeTab === "transactions" && <TransactionsSkeleton />}
              {activeTab === "reminders" && <TransactionsSkeleton />}
              {activeTab === "ledger" && <TransactionsSkeleton />}
              {activeTab === "budgeting" && <TransactionsSkeleton />}
            </>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  dashboardData={dashboardData}
                  selectedDate={selectedDate}
                  onMonthChange={handleMonthChange}
                  transactions={transactions}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === "ledger" && (
                <TransactionsLedgerView
                  transactions={transactions}
                  categories={categories}
                  wallets={wallets}
                  onImportTransactions={handleImportTransactions}
                />
              )}
              {activeTab === "wallets" && (
                <WalletsView
                  wallets={wallets}
                  transactions={transactions}
                  onOpenModal={handleOpenModal}
                  onDeleteWallet={handleDeleteWallet}
                  onRecalculateWallets={handleRecalculateWallets}
                />
              )}
              {activeTab === "portfolio" && <PortfolioView assets={assets} onOpenModal={handleOpenModal} />}
              {activeTab === "budgeting" && (
                <BudgetingView
                  categories={categories}
                  transactions={transactions}
                  selectedDate={selectedDate}
                  onUpdateCategoryLimit={handleUpdateCategoryLimit}
                />
              )}
              {activeTab === "transactions" && (
                <TransactionsView
                  categories={categories}
                  onAddCategory={handleAddCategoryDirect}
                  onDeleteCategory={handleDeleteCategory}
                />
              )}
              {activeTab === "reminders" && (
                <RemindersView
                  reminders={reminders}
                  wallets={wallets}
                  categories={categories}
                  onOpenModal={handleOpenModal}
                  onMarkPaid={handleMarkReminderPaid}
                  onDeleteReminder={handleDeleteReminder}
                />
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-2 shadow-lg">
          <div className="max-w-md mx-auto flex justify-around items-center">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 transition cursor-pointer py-1 px-1 rounded-xl ${
                    isActive ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center gap-0.5 transition cursor-pointer py-1 px-1 rounded-xl ${
                SECONDARY_NAV_ITEMS.some((x) => x.id === activeTab) || isMoreMenuOpen
                  ? "text-indigo-600 font-bold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <MoreHorizontal className={`w-4 h-4 ${SECONDARY_NAV_ITEMS.some((x) => x.id === activeTab) || isMoreMenuOpen ? "text-indigo-600" : "text-slate-400"}`} />
              <span className="text-[10px] font-medium">Lainnya</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile More Menu Bottom Sheet */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 border-t border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Fitur Perencanaan & Master</h3>
                <span className="text-[10px] text-slate-400">Pilih menu untuk melihat atau mengelola data</span>
              </div>
              <button onClick={() => setIsMoreMenuOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 border text-center transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-600"}`} />
                    <span className="text-[10px] leading-tight font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        modalType={modalType}
        targetAsset={targetAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        wallets={wallets}
        assets={assets}
        categories={categories}
      />
    </div>
  );
}
