import { prisma } from "@/lib/db";
import { adapters } from "@/lib/adapters";
import { buildOverallTop3 } from "@/lib/scoring/overall-rank";
import { BenchmarkKey, BenchmarkResult, RefreshRunResponse } from "@/lib/types";

export async function runRefresh(limit = 10): Promise<RefreshRunResponse> {
  const startedAt = new Date().toISOString();
  const attempted = adapters.map((a) => a.key);
  const statuses: RefreshRunResponse["benchmarks"] = [];
  const allResults: BenchmarkResult[] = [];

  for (const adapter of adapters) {
    try {
      const results = await adapter.fetchTopResults(limit);
      allResults.push(...results);
      statuses.push({ key: adapter.key, status: "success", count: results.length });
      await prisma.benchmarkSnapshot.create({
        data: {
          benchmarkKey: adapter.key,
          fetchedAt: new Date(),
          sourceUrl: adapter.sourceUrl,
          sourceData: results as unknown as object
        }
      });
    } catch (error) {
      statuses.push({
        key: adapter.key,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown adapter error"
      });
    }
  }

  const overallTop3 = buildOverallTop3(allResults);

  await prisma.benchmarkResult.deleteMany();
  await prisma.overallResult.deleteMany();

  if (allResults.length > 0) {
    await prisma.benchmarkResult.createMany({
      data: allResults.map((r) => ({
        ...r,
        fetchedAt: new Date(r.fetchedAt)
      }))
    });
  }

  if (overallTop3.length > 0) {
    await prisma.overallResult.createMany({
      data: overallTop3.map((r) => ({
        ...r,
        fetchedAt: new Date(r.fetchedAt),
        includedBenchmarks: r.includedBenchmarks as unknown as object
      }))
    });
  }

  const successCount = statuses.filter((s) => s.status === "success").length;
  const status: RefreshRunResponse["status"] = successCount === adapters.length ? "success" : successCount > 0 ? "partial" : "failed";
  const completedAt = new Date().toISOString();

  await prisma.refreshRun.create({
    data: {
      startedAt: new Date(startedAt),
      completedAt: new Date(completedAt),
      status,
      benchmarksAttempted: attempted as unknown as object,
      benchmarksSucceeded: statuses.filter((s) => s.status === "success").map((s) => s.key) as unknown as object,
      errorSummary: statuses.filter((s) => s.error).map((s) => `${s.key}: ${s.error}`).join(" | ") || null
    }
  });

  return { status, startedAt, completedAt, benchmarks: statuses };
}

export async function getDashboardData() {
  const results = await prisma.benchmarkResult.findMany({ orderBy: [{ benchmarkKey: "asc" }, { rank: "asc" }] });
  const overall = await prisma.overallResult.findMany({ orderBy: { overallRank: "asc" } });
  const refresh = await prisma.refreshRun.findFirst({ orderBy: { completedAt: "desc" } });

  const benchmarks = {
    artificial_analysis: [] as BenchmarkResult[],
    arena_text: [] as BenchmarkResult[],
    swe_bench_verified: [] as BenchmarkResult[],
    aider_polyglot: [] as BenchmarkResult[],
    livebench: [] as BenchmarkResult[],
    hf_open_llm: [] as BenchmarkResult[]
  };

  for (const item of results) {
    benchmarks[item.benchmarkKey as BenchmarkKey].push({
      ...item,
      fetchedAt: item.fetchedAt.toISOString()
    });
  }

  return {
    lastRefreshedAt: refresh?.completedAt?.toISOString() ?? null,
    benchmarks,
    overallTop3: overall.map((r) => ({
      ...r,
      fetchedAt: r.fetchedAt.toISOString(),
      includedBenchmarks: r.includedBenchmarks as BenchmarkKey[]
    }))
  };
}
