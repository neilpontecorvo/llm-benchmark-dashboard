import { BenchmarkResult } from "@/lib/types";

export function BenchmarkTable({ rows }: { rows: BenchmarkResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="px-3 py-2">Rank</th>
            <th className="px-3 py-2">Model</th>
            <th className="px-3 py-2">Provider</th>
            <th className="px-3 py-2">Raw</th>
            <th className="px-3 py-2">Normalized</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="px-3 py-2">{row.rank ?? "—"}</td>
              <td className="px-3 py-2 font-medium">{row.modelName}</td>
              <td className="px-3 py-2">{row.provider ?? "—"}</td>
              <td className="px-3 py-2">{row.rawScoreText ?? row.rawScore ?? "—"}</td>
              <td className="px-3 py-2">{row.normalizedScore ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
