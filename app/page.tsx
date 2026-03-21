import { BenchmarkCard } from "@/components/benchmark-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { OverallTop3 } from "@/components/overall-top3";
import { getDashboardData } from "@/lib/refresh";
import { BENCHMARK_NAMES } from "@/lib/weights";
import { adapters } from "@/lib/adapters";

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <main className="container-shell">
      <DashboardHeader lastRefreshedAt={data.lastRefreshedAt} />
      <OverallTop3 data={data.overallTop3} />
      <div className="grid gap-6 lg:grid-cols-2">
        {adapters.map((adapter) => (
          <BenchmarkCard
            key={adapter.key}
            title={BENCHMARK_NAMES[adapter.key]}
            sourceUrl={adapter.sourceUrl}
            rows={data.benchmarks[adapter.key]}
          />
        ))}
      </div>
    </main>
  );
}
