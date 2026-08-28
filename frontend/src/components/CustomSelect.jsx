"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ options = [], value, onChange, placeholder = "Pilih...", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOpt = normalizeOptions.find((opt) => opt.value === value) || normalizeOptions[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left text-xs ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-semibold flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOpt?.icon && <span>{selectedOpt.icon}</span>}
          {selectedOpt ? selectedOpt.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 z-50 mt-1.5 max-h-52 overflow-y-auto bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 text-xs space-y-0.5"
          >
            {normalizeOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-3 py-2 rounded-xl font-medium text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && <span>{opt.icon}</span>}
                    {opt.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
