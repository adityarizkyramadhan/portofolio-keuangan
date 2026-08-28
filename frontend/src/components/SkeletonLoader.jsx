"use client";

import { motion } from "framer-motion";

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 pb-20 md:pb-6 animate-pulse">
      {/* Net Worth Skeleton Card */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="h-3 bg-slate-700 rounded w-1/3"></div>
        <div className="h-9 bg-slate-700 rounded w-2/3"></div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            <div className="h-5 bg-slate-700 rounded w-3/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            <div className="h-5 bg-slate-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Skeleton */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-6 bg-slate-200 rounded-full w-24"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-100 rounded-xl p-4 h-16"></div>
          <div className="bg-slate-100 rounded-xl p-4 h-16"></div>
        </div>
      </div>

      {/* Allocation Skeleton */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-40 h-40 bg-slate-200 rounded-full flex-shrink-0"></div>
          <div className="w-full space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalletsSkeleton() {
  return (
    <div className="space-y-5 pb-20 md:pb-6 animate-pulse">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <div className="space-y-2 w-1/2">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded-xl w-28"></div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-16 bg-slate-200 rounded-xl"></div>
        <div className="h-16 bg-slate-200 rounded-xl"></div>
        <div className="h-16 bg-slate-200 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
              <div className="h-5 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-5 pb-20 md:pb-6 animate-pulse">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <div className="space-y-2 w-1/2">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded-xl w-28"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-1/2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div className="h-7 bg-slate-200 rounded-lg w-24"></div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
              <div className="h-6 bg-slate-200 rounded w-28"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-pulse">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-7 bg-slate-200 rounded-xl w-20"></div>
          <div className="h-7 bg-slate-200 rounded-xl w-24"></div>
          <div className="h-7 bg-slate-200 rounded-xl w-16"></div>
        </div>
      </div>
    </div>
  );
}
