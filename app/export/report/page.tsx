import { getDashboardData } from "@/lib/refresh";
import { BENCHMARK_NAMES } from "@/lib/weights";
import { adapters } from "@/lib/adapters";

export default async function ExportReportPage() {
  const data = await getDashboardData();

  return (
    <main className="mx-auto max-w-5xl bg-white p-10 text-slate-900">
      <h1 className="text-3xl font-semibold">LLM Benchmark Dashboard Report</h1>
      <p className="mt-2 text-sm text-slate-500">Generated: {new Date().toLocaleString()}</p>
      <p className="text-sm text-slate-500">Last refreshed: {data.lastRefreshedAt ? new Date(data.lastRefreshedAt).toLocaleString() : "None"}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Overall Top 3</h2>
        <ol className="mt-3 space-y-2">
          {data.overallTop3.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-200 p-4">
              <strong>#{item.overallRank}</strong> {item.modelName} — {item.provider} — score {item.weightedScore}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 space-y-6">
        {adapters.map((adapter) => (
          <div key={adapter.key} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-lg font-semibold">{BENCHMARK_NAMES[adapter.key]}</h3>
            <table className="mt-3 min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Model</th>
                  <th className="py-2">Provider</th>
                  <th className="py-2">Raw</th>
                  <th className="py-2">Normalized</th>
                </tr>
              </thead>
              <tbody>
                {data.benchmarks[adapter.key].map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2">{row.rank}</td>
                    <td className="py-2">{row.modelName}</td>
                    <td className="py-2">{row.provider}</td>
                    <td className="py-2">{row.rawScoreText ?? row.rawScore}</td>
                    <td className="py-2">{row.normalizedScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>
    </main>
  );
}
