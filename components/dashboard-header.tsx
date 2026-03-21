"use client";

import { useState } from "react";
import { RefreshCcw, FileImage, FileText } from "lucide-react";

export function DashboardHeader({ lastRefreshedAt }: { lastRefreshedAt: string | null }) {
  const [loading, setLoading] = useState(false);

  async function triggerRefresh() {
    setLoading(true);
    try {
      await fetch("/api/refresh", { method: "POST" });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mb-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">LLM Benchmark Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last refreshed: {lastRefreshedAt ? new Date(lastRefreshedAt).toLocaleString() : "No refresh run yet"}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={triggerRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          <RefreshCcw size={16} /> {loading ? "Refreshing..." : "Refresh"}
        </button>
        <a href="/api/export/pdf" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900">
          <FileText size={16} /> Export PDF
        </a>
        <a href="/api/export/png" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900">
          <FileImage size={16} /> Export PNG
        </a>
      </div>
    </div>
  );
}
