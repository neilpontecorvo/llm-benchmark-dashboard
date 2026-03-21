import { BenchmarkResult } from "@/lib/types";
import { BenchmarkTable } from "@/components/benchmark-table";

export function BenchmarkCard({ title, sourceUrl, rows }: { title: string; sourceUrl: string; rows: BenchmarkResult[] }) {
  return (
    <section className="card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline-offset-2 hover:underline">
            Source
          </a>
        </div>
        <div className="text-right text-xs text-slate-500">
          {rows[0]?.includedInOverall ? "Included in overall ranking" : "Excluded from overall ranking"}
        </div>
      </div>
      <BenchmarkTable rows={rows} />
    </section>
  );
}
