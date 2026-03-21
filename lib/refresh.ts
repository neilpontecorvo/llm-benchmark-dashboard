import { prisma } from "@/lib/db";
import { adapters } from "@/lib/adapters";
import { buildOverallTop3 } from "@/lib/scoring/overall-rank";
import { BenchmarkCategory, BenchmarkKey, BenchmarkResult, DataSource, RefreshRunResponse, RefreshStatus } from "@/lib/types";

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
        fetchedAt: new Date(r.fetchedAt),
        dataSource: r.dataSource ?? "mock"
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

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getDashboardData() {
  const results = await prisma.benchmarkResult.findMany({ orderBy: [{ benchmarkKey: "asc" }, { rank: "asc" }] });
  const overall = await prisma.overallResult.findMany({ orderBy: { overallRank: "asc" } });
  const refresh = await prisma.refreshRun.findFirst({ orderBy: { completedAt: "desc" } });

  const benchmarks: Record<BenchmarkKey, BenchmarkResult[]> = {
    artificial_analysis: [],
    arena_text: [],
    swe_bench_verified: [],
    aider_polyglot: [],
    livebench: [],
    hf_open_llm: [],
    arena_text_to_image: [],
    arena_text_to_video: [],
    arena_image_to_video: [],
    gpqa_diamond: [],
    humanitys_last_exam: [],
    mmmlu: []
  };

  for (const item of results) {
    benchmarks[item.benchmarkKey as BenchmarkKey].push({
      id: item.id,
      benchmarkKey: item.benchmarkKey as BenchmarkKey,
      fetchedAt: item.fetchedAt.toISOString(),
      modelName: item.modelName,
      provider: item.provider ?? undefined,
      rank: item.rank,
      rawScore: item.rawScore,
      rawScoreText: item.rawScoreText,
      normalizedScore: item.normalizedScore,
      confidenceText: item.confidenceText,
      category: item.category as BenchmarkCategory,
      sourceUrl: item.sourceUrl,
      includedInOverall: item.includedInOverall,
      dataSource: (item.dataSource as DataSource) ?? "mock"
    });
  }

  const lastRefreshedAt = refresh?.completedAt?.toISOString() ?? null;
  const isStale = lastRefreshedAt
    ? Date.now() - new Date(lastRefreshedAt).getTime() > STALE_THRESHOLD_MS
    : true;

  const succeeded = (refresh?.benchmarksSucceeded as BenchmarkKey[] | null) ?? [];
  const attempted = (refresh?.benchmarksAttempted as BenchmarkKey[] | null) ?? [];

  const refreshStatus: RefreshStatus = {
    status: (refresh?.status as RefreshStatus["status"]) ?? null,
    lastRefreshedAt,
    isStale,
    benchmarkStatuses: attempted.map((key) => ({
      key,
      succeeded: succeeded.includes(key)
    })),
    errorSummary: refresh?.errorSummary ?? null
  };

  return {
    lastRefreshedAt,
    refreshStatus,
    benchmarks,
    overallTop3: overall.map((r) => ({
      id: r.id,
      fetchedAt: r.fetchedAt.toISOString(),
      modelName: r.modelName,
      provider: r.provider ?? undefined,
      includedBenchmarks: r.includedBenchmarks as BenchmarkKey[],
      weightedScore: r.weightedScore,
      appearanceCount: r.appearanceCount,
      overallRank: r.overallRank
    }))
  };
}
