"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, Trash2, ArrowDownLeft, ArrowUpRight, Search, ChevronDown, ChevronRight, Car, Utensils, Zap, ShoppingBag, Film, Briefcase, DollarSign, Home, GraduationCap, HeartPulse } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

const CAT_TYPE_OPTIONS = [
  { value: "EXPENSE", label: "PENGELUARAN" },
  { value: "INCOME", label: "PEMASUKAN" }
];

export default function TransactionsView({ categories, onAddCategory, onDeleteCategory }) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("EXPENSE");
  const [parentCatId, setParentCatId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openParents, setOpenParents] = useState({});

  const toggleParent = (id) => {
    setOpenParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("makan") || n.includes("minum") || n.includes("resto") || n.includes("kopi")) return <Utensils className="w-4 h-4 text-amber-600" />;
    if (n.includes("trans") || n.includes("bensin") || n.includes("parkir") || n.includes("mobil") || n.includes("motor")) return <Car className="w-4 h-4 text-blue-600" />;
    if (n.includes("tagih") || n.includes("listrik") || n.includes("air") || n.includes("wifi")) return <Zap className="w-4 h-4 text-yellow-600" />;
    if (n.includes("nongkrong") || n.includes("hiburan") || n.includes("film") || n.includes("game")) return <Film className="w-4 h-4 text-purple-600" />;
    if (n.includes("belanja") || n.includes("mall") || n.includes("baju")) return <ShoppingBag className="w-4 h-4 text-pink-600" />;
    if (n.includes("gaji") || n.includes("honor") || n.includes("kerja") || n.includes("proyek")) return <Briefcase className="w-4 h-4 text-emerald-600" />;
    if (n.includes("kesehatan") || n.includes("obat") || n.includes("dokter")) return <HeartPulse className="w-4 h-4 text-rose-600" />;
    if (n.includes("pendidikan") || n.includes("kursus") || n.includes("buku")) return <GraduationCap className="w-4 h-4 text-indigo-600" />;
    if (n.includes("rumah") || n.includes("kos") || n.includes("sewa")) return <Home className="w-4 h-4 text-slate-600" />;
    return <Tag className="w-4 h-4 text-indigo-600" />;
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      type: newCatType,
      parentId: parentCatId || null
    });
    setNewCatName("");
    setParentCatId("");
  };

  const filteredCategories = (categories || []).filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group into Parent & Child categories
  const parentOptions = (categories || [])
    .filter((c) => !c.parentId && c.type === newCatType)
    .map((c) => ({ value: c._id, label: `Induk: ${c.name}` }));

  const buildTree = (type) => {
    const list = filteredCategories.filter((c) => c.type === type);
    const parents = list.filter((c) => !c.parentId);
    const childrenMap = {};

    list.forEach((c) => {
      if (c.parentId) {
        if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
        childrenMap[c.parentId].push(c);
      }
    });

    return { parents, childrenMap };
  };

  const incomeTree = buildTree("INCOME");
  const expenseTree = buildTree("EXPENSE");

  const renderCategoryTreeSection = (title, tree, iconColor) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
          <span className="text-[11px] text-slate-400 font-medium">{tree.parents.length} Induk Kategori</span>
        </div>
      </div>

      <div className="space-y-2">
        {tree.parents.map((parent) => {
          const children = tree.childrenMap[parent._id] || [];
          const isOpen = openParents[parent._id] !== false; // default open

          return (
            <div key={parent._id} className="border border-slate-100 rounded-xl overflow-hidden">
              {/* Parent Row */}
              <div className="p-3 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => toggleParent(parent._id)}>
                  {children.length > 0 ? (
                    isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">{getCategoryIcon(parent.name)}</div>
                  <span className="font-bold text-xs text-slate-900 truncate">{parent.name}</span>
                  {children.length > 0 && (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[9px] font-bold">
                      {children.length} Sub
                    </span>
                  )}
                </div>

                {!parent.isSystem && onDeleteCategory && (
                  <button
                    onClick={() => onDeleteCategory(parent._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Hapus Kategori Induk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Children / Sub-categories Accordion */}
              {children.length > 0 && isOpen && (
                <div className="p-2 pl-9 bg-white space-y-1.5 border-t border-slate-100">
                  {children.map((child) => (
                    <div key={child._id} className="py-1.5 px-3 bg-slate-50/50 hover:bg-slate-100/60 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(child.name)}
                        <span className="font-semibold text-slate-700">{child.name}</span>
                      </div>
                      {!child.isSystem && onDeleteCategory && (
                        <button
                          onClick={() => onDeleteCategory(child._id)}
                          className="p-0.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus Sub-kategori"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-28 md:pb-6 font-sans">
      {/* Categories Master Management */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Manajemen Kategori Transaksi (Hierarki Parent-Child)</h3>
          <p className="text-xs text-slate-500">Kelola daftar kategori utama (Induk) dan sub-kategori (Anak) dengan ikon penanda visual.</p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">NAMA KATEGORI</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Contoh: Bensin / Servis / Parkir..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">TIPE KATEGORI</label>
              <CustomSelect
                options={CAT_TYPE_OPTIONS}
                value={newCatType}
                onChange={(val) => {
                  setNewCatType(val);
                  setParentCatId("");
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">INDUK KATEGORI (OPSIONAL)</label>
              <CustomSelect
                options={[{ value: "", label: "-- Kategori Utama / Induk --" }, ...parentOptions]}
                value={parentCatId}
                onChange={(val) => setParentCatId(val)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Tambah Kategori
            </button>
          </div>
        </form>

        {/* Search Toolbar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari kategori atau sub-kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Accordion Tree Lists: Income vs Expense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderCategoryTreeSection("Kategori Pemasukan", incomeTree, "bg-emerald-50 text-emerald-600")}
        {renderCategoryTreeSection("Kategori Pengeluaran", expenseTree, "bg-rose-50 text-rose-600")}
      </div>
    </div>
  );
}
