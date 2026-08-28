"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast || !toast.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <AnimatePresence>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
            isSuccess
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-rose-600 text-white border-rose-500"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-100" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-100" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer flex-shrink-0"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
