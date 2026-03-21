import { OverallResult } from "@/lib/types";

export function OverallTop3({ data }: { data: OverallResult[] }) {
  return (
    <section className="card mb-6 p-6">
      <h2 className="text-lg font-semibold">Overall Top 3</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {data.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">Rank #{item.overallRank}</div>
            <div className="mt-1 text-lg font-semibold">{item.modelName}</div>
            <div className="text-sm text-slate-500">{item.provider ?? "Unknown provider"}</div>
            <div className="mt-3 text-2xl font-semibold">{item.weightedScore}</div>
            <div className="text-sm text-slate-500">{item.appearanceCount} benchmark appearances</div>
          </div>
        ))}
      </div>
    </section>
  );
}
