"use client";

import { useState } from "react";
import { RefreshCcw, FileImage, FileText, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { RefreshStatus } from "@/lib/types";
import { BENCHMARK_NAMES } from "@/lib/weights";
import { ThemePicker } from "@/components/theme-picker";

interface DashboardHeaderProps {
  refreshStatus: RefreshStatus;
}

export function DashboardHeader({ refreshStatus }: DashboardHeaderProps) {
  const [loading, setLoading] = useState(false);
  const [lastRefreshResult, setLastRefreshResult] = useState<"success" | "partial" | "failed" | null>(null);

  async function triggerRefresh() {
    setLoading(true);
    setLastRefreshResult(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();
      setLastRefreshResult(data.status ?? (res.ok ? "success" : "failed"));
      // Brief pause so user sees the result banner before reload
      await new Promise((r) => setTimeout(r, 1500));
      window.location.reload();
    } catch {
      setLastRefreshResult("failed");
    } finally {
      setLoading(false);
    }
  }

  const { lastRefreshedAt, isStale, status, benchmarkStatuses, errorSummary } = refreshStatus;

  return (
    <div className="mb-6 space-y-3">
      {/* Main header card */}
      <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">LLM Benchmark Dashboard</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock size={14} />
            {lastRefreshedAt
              ? `Last refreshed: ${new Date(lastRefreshedAt).toLocaleString()}`
              : "No refresh run yet"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={triggerRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderRadius: "var(--btn-radius)" }}
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <a
            href="/api/export/pdf"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
            style={{ background: "var(--btn-secondary-bg)", color: "var(--btn-secondary-text)", border: "1px solid var(--btn-secondary-border)", borderRadius: "var(--btn-radius)" }}
          >
            <FileText size={16} /> Export PDF
          </a>
          <a
            href="/api/export/png"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
            style={{ background: "var(--btn-secondary-bg)", color: "var(--btn-secondary-text)", border: "1px solid var(--btn-secondary-border)", borderRadius: "var(--btn-radius)" }}
          >
            <FileImage size={16} /> Export PNG
          </a>
          <ThemePicker />
        </div>
      </div>

      {/* Live refresh result banner (shown briefly after triggering refresh) */}
      {lastRefreshResult && <RefreshResultBanner result={lastRefreshResult} />}

      {/* Stale data warning */}
      {isStale && !loading && (
        <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" style={{ background: "var(--banner-warning-bg)", color: "var(--banner-warning-text)", borderColor: "var(--banner-warning-border)" }}>
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Data may be outdated.{" "}
            {lastRefreshedAt
              ? `Last successful refresh was ${formatRelativeTime(lastRefreshedAt)}.`
              : "No refresh has been run yet."}{" "}
            Click Refresh to update.
          </span>
        </div>
      )}

      {/* Partial failure banner from last persisted refresh */}
      {status === "partial" && !loading && !lastRefreshResult && (
        <div className="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm" style={{ background: "var(--banner-warning-bg)", color: "var(--banner-warning-text)", borderColor: "var(--banner-warning-border)" }}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Partial refresh.</span>{" "}
            Some benchmarks failed to update:
            <div className="mt-1 flex flex-wrap gap-2">
              {benchmarkStatuses.map((bs) => (
                <span
                  key={bs.key}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    bs.succeeded
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {bs.succeeded ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {BENCHMARK_NAMES[bs.key] ?? bs.key}
                </span>
              ))}
            </div>
            {errorSummary && (
              <p className="mt-1 text-xs text-amber-600">{errorSummary}</p>
            )}
          </div>
        </div>
      )}

      {/* Full failure banner */}
      {status === "failed" && !loading && !lastRefreshResult && (
        <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" style={{ background: "var(--banner-error-bg)", color: "var(--banner-error-text)", borderColor: "var(--banner-error-border)" }}>
          <XCircle size={16} className="shrink-0" />
          <span>
            <span className="font-medium">Refresh failed.</span>{" "}
            {errorSummary ?? "All benchmark adapters encountered errors."}{" "}
            Try again or check server logs.
          </span>
        </div>
      )}
    </div>
  );
}

function RefreshResultBanner({ result }: { result: "success" | "partial" | "failed" }) {
  const config = {
    success: {
      icon: CheckCircle2,
      text: "All benchmarks refreshed successfully.",
      bg: "var(--banner-success-bg)",
      color: "var(--banner-success-text)",
      border: "var(--banner-success-border)",
    },
    partial: {
      icon: AlertTriangle,
      text: "Refresh completed with some failures. Reloading...",
      bg: "var(--banner-warning-bg)",
      color: "var(--banner-warning-text)",
      border: "var(--banner-warning-border)",
    },
    failed: {
      icon: XCircle,
      text: "Refresh failed. Check server logs for details.",
      bg: "var(--banner-error-bg)",
      color: "var(--banner-error-text)",
      border: "var(--banner-error-border)",
    },
  }[result];

  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
      style={{ background: config.bg, color: config.color, borderColor: config.border }}
    >
      <Icon size={16} className="shrink-0" />
      <span>{config.text}</span>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "less than an hour ago";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
