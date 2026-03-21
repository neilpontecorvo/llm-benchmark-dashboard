import { BenchmarkResult } from "@/lib/types";

export function BenchmarkTable({ rows }: { rows: BenchmarkResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--table-header-border)", color: "var(--table-header-text)" }} className="text-left">
            <th className="w-12 px-3 py-2">#</th>
            <th className="px-3 py-2">Model</th>
            <th className="px-3 py-2">Provider</th>
            <th className="px-3 py-2 text-right">Raw</th>
            <th className="w-40 px-3 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id}
              style={{
                borderBottom: "1px solid var(--table-row-border)",
                background: idx < 3 ? "var(--table-top3-bg)" : undefined,
              }}
            >
              <td className="px-3 py-2 tabular-nums" style={{ color: "var(--table-rank-text)" }}>
                {row.rank ?? "\u2014"}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 font-medium" title={row.modelName} style={{ color: "var(--table-model-text)" }}>
                {row.modelName}
              </td>
              <td className="px-3 py-2" style={{ color: "var(--table-provider-text)" }}>
                {row.provider ?? "\u2014"}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {row.rawScoreText ?? row.rawScore ?? "\u2014"}
              </td>
              <td className="px-3 py-2">
                <ScoreBar value={row.normalizedScore} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Linear heat-gradient score bar.
 * Colors read from theme.css variables.
 */
function ScoreBar({ value }: { value: number | null }) {
  if (value == null) return <span style={{ color: "var(--page-text-faint)" }}>{"\u2014"}</span>;
  const pct = Math.max(0, Math.min(100, value));
  const color = heatColor(pct);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 overflow-hidden rounded-full" style={{ height: "var(--scorebar-height)", background: "var(--scorebar-track)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
          }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium tabular-nums" style={{ color: color.to }}>
        {Math.round(pct)}
      </span>
    </div>
  );
}

/** Returns a gradient pair from theme variables */
function heatColor(pct: number): { from: string; to: string } {
  if (pct >= 80) return { from: "var(--heat-80-from)", to: "var(--heat-80-to)" };
  if (pct >= 60) return { from: "var(--heat-60-from)", to: "var(--heat-60-to)" };
  if (pct >= 40) return { from: "var(--heat-40-from)", to: "var(--heat-40-to)" };
  if (pct >= 20) return { from: "var(--heat-20-from)", to: "var(--heat-20-to)" };
  return { from: "var(--heat-0-from)", to: "var(--heat-0-to)" };
}
