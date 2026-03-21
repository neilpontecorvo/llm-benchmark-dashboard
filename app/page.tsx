import { BenchmarkCard } from "@/components/benchmark-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { OverallTop3 } from "@/components/overall-top3";
import { getDashboardData } from "@/lib/refresh";
import { BENCHMARK_NAMES, BENCHMARK_DESCRIPTIONS, BENCHMARK_CATEGORIES, BENCHMARK_WEIGHTS, CATEGORY_LABELS } from "@/lib/weights";
import { adapters } from "@/lib/adapters";

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <main className="container-shell">
      <DashboardHeader refreshStatus={data.refreshStatus} />
      <OverallTop3 data={data.overallTop3} />
      <div className="grid gap-6 lg:grid-cols-2">
        {adapters.map((adapter) => (
          <BenchmarkCard
            key={adapter.key}
            title={BENCHMARK_NAMES[adapter.key]}
            description={BENCHMARK_DESCRIPTIONS[adapter.key]}
            category={CATEGORY_LABELS[BENCHMARK_CATEGORIES[adapter.key]]}
            categoryKey={BENCHMARK_CATEGORIES[adapter.key]}
            sourceUrl={adapter.sourceUrl}
            rows={data.benchmarks[adapter.key]}
            weight={BENCHMARK_WEIGHTS[adapter.key]}
          />
        ))}
      </div>
    </main>
  );
}
