"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CustomDatePicker({ value, onChange, placeholder = "Pilih Tanggal...", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parsed current value or today
  const selectedDate = value ? new Date(value) : null;
  const today = new Date();

  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const monthStr = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const formatted = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleQuickSelect = (type) => {
    const d = new Date();
    if (type === "TODAY") {
      // today
    } else if (type === "TOMORROW") {
      d.setDate(d.getDate() + 1);
    } else if (type === "END_OF_MONTH") {
      d.setMonth(d.getMonth() + 1, 0);
    } else if (type === "NEXT_MONTH") {
      d.setMonth(d.getMonth() + 1);
    }

    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    onChange(`${year}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  // Calendar Days Math
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const formattedDisplay = selectedDate && !isNaN(selectedDate.getTime())
    ? `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : null;

  return (
    <div ref={containerRef} className={`relative text-xs ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
      >
        <span className="truncate flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className={formattedDisplay ? "text-slate-900 font-bold" : "text-slate-400 font-medium"}>
            {formattedDisplay || placeholder}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 z-50 mt-1.5 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-4 text-xs space-y-3 font-sans"
          >
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleQuickSelect("TODAY")}
                className="py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("TOMORROW")}
                className="py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition"
              >
                Besok
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("END_OF_MONTH")}
                className="py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition"
              >
                Akhir Bulan
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("NEXT_MONTH")}
                className="py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition"
              >
                +1 Bulan
              </button>
            </div>

            {/* Calendar Month Selector Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-extrabold text-slate-800 text-xs">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day Names Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase">
              {DAY_NAMES.map((d, idx) => (
                <div key={idx} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 text-center gap-1">
              {/* Empty padding days before start of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = selectedDate && day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`py-1.5 rounded-xl font-bold transition text-xs flex items-center justify-center ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : isToday
                        ? "bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
