import { getDashboardData } from "@/lib/refresh";
import {
  BENCHMARK_NAMES,
  BENCHMARK_DESCRIPTIONS,
  BENCHMARK_CATEGORIES,
  BENCHMARK_WEIGHTS,
  CATEGORY_LABELS,
} from "@/lib/weights";
import { adapters } from "@/lib/adapters";
import { BenchmarkCategory, BenchmarkKey } from "@/lib/types";

export const dynamic = "force-dynamic";

/* ── Strength labels (mirrors overall-top3.tsx) ── */
const STRENGTH_LABELS: Record<BenchmarkKey, string> = {
  artificial_analysis: "Intelligence Index",
  arena_text: "Community Preferred",
  swe_bench_verified: "Real-World Coding",
  aider_polyglot: "Polyglot Coding",
  livebench: "Live Evaluation",
  hf_open_llm: "Open-Weight",
  arena_text_to_image: "Image Generation",
  arena_text_to_video: "Video from Text",
  arena_image_to_video: "Video from Image",
  gpqa_diamond: "Expert Reasoning",
  humanitys_last_exam: "Frontier Knowledge",
  mmmlu: "Multilingual",
};

/* ── Category pill colors for print (inline hex so Playwright renders them) ── */
const CAT_COLORS: Record<BenchmarkCategory, { bg: string; text: string }> = {
  general:              { bg: "#dbeafe", text: "#1d4ed8" },
  coding:               { bg: "#ede9fe", text: "#6d28d9" },
  agentic:              { bg: "#d1fae5", text: "#047857" },
  open_only:            { bg: "#ffedd5", text: "#c2410c" },
  community_preference: { bg: "#fce7f3", text: "#be185d" },
  text_to_image:        { bg: "#fae8ff", text: "#a21caf" },
  text_to_video:        { bg: "#ffe4e6", text: "#be123c" },
  image_to_video:       { bg: "#fef3c7", text: "#b45309" },
  reasoning:            { bg: "#cffafe", text: "#0e7490" },
  multilingual:         { bg: "#ccfbf1", text: "#0f766e" },
};

const RANK_COLORS = [
  { bg: "#fffbeb", text: "#b45309", border: "#fcd34d" }, // gold
  { bg: "#f8fafc", text: "#475569", border: "#cbd5e1" }, // silver
  { bg: "#fff7ed", text: "#c2410c", border: "#fdba74" }, // bronze
];

export default async function ExportReportPage() {
  const data = await getDashboardData();

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 48px", background: "#fff", color: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>LLM Benchmark Dashboard Report</h1>
      <p style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>Generated: {new Date().toLocaleString()}</p>
      <p style={{ fontSize: 13, color: "#64748b" }}>
        Last refreshed: {data.lastRefreshedAt ? new Date(data.lastRefreshedAt).toLocaleString() : "None"}
      </p>

      {/* ── Overall Top 3 ── */}
      <section style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Overall Top 3</h2>
          <p style={{ maxWidth: 420, fontSize: 12, lineHeight: 1.5, color: "#64748b", margin: 0 }}>
            Each benchmark is normalized to a 0-100 scale, then weighted by importance.
            The overall score is the sum of weighted normalized scores across all benchmarks
            a model appears in. Higher is better.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
          {data.overallTop3.map((item) => {
            const rc = RANK_COLORS[item.overallRank - 1] ?? { bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0" };
            return (
              <div
                key={item.id}
                style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 10, padding: 12, color: rc.text, overflow: "hidden" }}
              >
                {/* Identity + score */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6 }}>
                    Rank #{item.overallRank}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.modelName}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{item.provider ?? "Unknown"}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
                    {item.weightedScore}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>
                    {item.appearanceCount} benchmark{item.appearanceCount !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Strength tags — stacked below */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 8 }}>
                  {item.includedBenchmarks.map((benchKey) => {
                    const category = BENCHMARK_CATEGORIES[benchKey];
                    const cc = CAT_COLORS[category];
                    return (
                      <span
                        key={benchKey}
                        style={{
                          display: "inline-block",
                          whiteSpace: "nowrap",
                          borderRadius: 999,
                          padding: "1px 6px",
                          fontSize: 8,
                          fontWeight: 600,
                          background: cc.bg,
                          color: cc.text,
                        }}
                      >
                        {STRENGTH_LABELS[benchKey]}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Benchmark Cards ── */}
      <section style={{ marginTop: 32 }}>
        {adapters.map((adapter) => {
          const cat = BENCHMARK_CATEGORIES[adapter.key];
          const cc = CAT_COLORS[cat];
          const weightPct = Math.round(BENCHMARK_WEIGHTS[adapter.key] * 100);

          return (
            <div
              key={adapter.key}
              style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16, pageBreakInside: "avoid" }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{BENCHMARK_NAMES[adapter.key]}</h3>
                <span style={{
                  display: "inline-block",
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontSize: 10,
                  fontWeight: 600,
                  background: cc.bg,
                  color: cc.text,
                }}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {weightPct > 0 ? `${weightPct}% of overall` : "Not weighted"}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 12px 0", lineHeight: 1.5 }}>
                {BENCHMARK_DESCRIPTIONS[adapter.key]}
              </p>

              {/* Table */}
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                    <th style={{ padding: "6px 8px", width: 36 }}>#</th>
                    <th style={{ padding: "6px 8px" }}>Model</th>
                    <th style={{ padding: "6px 8px" }}>Provider</th>
                    <th style={{ padding: "6px 8px", textAlign: "right" }}>Raw</th>
                    <th style={{ padding: "6px 8px", textAlign: "right" }}>Norm.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.benchmarks[adapter.key].map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9", background: idx < 3 ? "#f8fafc" : undefined }}>
                      <td style={{ padding: "5px 8px", color: "#94a3b8" }}>{row.rank}</td>
                      <td style={{ padding: "5px 8px", fontWeight: 500 }}>{row.modelName}</td>
                      <td style={{ padding: "5px 8px", color: "#475569" }}>{row.provider}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right" }}>{row.rawScoreText ?? row.rawScore}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 600 }}>{row.normalizedScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>
    </main>
  );
}
