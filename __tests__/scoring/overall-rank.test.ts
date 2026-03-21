import { describe, it, expect } from "vitest";
import { buildOverallTop3 } from "@/lib/scoring/overall-rank";
import type { BenchmarkResult } from "@/lib/types";

function makeResult(overrides: Partial<BenchmarkResult> = {}): BenchmarkResult {
  return {
    id: "test-1",
    benchmarkKey: "swe_bench_verified",
    fetchedAt: new Date().toISOString(),
    modelName: "Test Model",
    provider: "TestCo",
    rank: 1,
    rawScore: 50,
    normalizedScore: 80,
    category: "coding",
    sourceUrl: "https://example.com",
    includedInOverall: true,
    ...overrides,
  };
}

describe("buildOverallTop3", () => {
  it("returns top 3 models sorted by weighted score", () => {
    const results: BenchmarkResult[] = [
      // Model A appears in swe_bench (weight 0.10) with score 100
      makeResult({
        id: "a1",
        modelName: "Model A",
        provider: "ProvA",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 100,
      }),
      // Model B appears in swe_bench (weight 0.10) with score 90
      makeResult({
        id: "b1",
        modelName: "Model B",
        provider: "ProvB",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 90,
      }),
      // Model C appears in swe_bench with score 80
      makeResult({
        id: "c1",
        modelName: "Model C",
        provider: "ProvC",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 80,
      }),
      // Model D appears in swe_bench with score 70
      makeResult({
        id: "d1",
        modelName: "Model D",
        provider: "ProvD",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 70,
      }),
    ];

    const top3 = buildOverallTop3(results);

    expect(top3).toHaveLength(3);
    expect(top3[0].modelName).toBe("Model A");
    expect(top3[1].modelName).toBe("Model B");
    expect(top3[2].modelName).toBe("Model C");
    expect(top3[0].overallRank).toBe(1);
    expect(top3[1].overallRank).toBe(2);
    expect(top3[2].overallRank).toBe(3);
  });

  it("aggregates scores across multiple benchmarks", () => {
    const results: BenchmarkResult[] = [
      // Model A in swe_bench (weight 0.10) score 100 → 10 points
      makeResult({
        id: "a1",
        modelName: "Model A",
        provider: "ProvA",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 100,
      }),
      // Model A in arena_text (weight 0.12) score 100 → 12 points (total 22)
      makeResult({
        id: "a2",
        modelName: "Model A",
        provider: "ProvA",
        benchmarkKey: "arena_text",
        normalizedScore: 100,
        category: "community_preference",
      }),
      // Model B in swe_bench score 100 → 10 points (only 1 benchmark)
      makeResult({
        id: "b1",
        modelName: "Model B",
        provider: "ProvB",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 100,
      }),
    ];

    const top3 = buildOverallTop3(results);

    expect(top3[0].modelName).toBe("Model A");
    // Model A: (100 * 0.10) + (100 * 0.12) = 22
    expect(top3[0].weightedScore).toBe(22);
    expect(top3[0].appearanceCount).toBe(2);
    expect(top3[0].includedBenchmarks).toContain("swe_bench_verified");
    expect(top3[0].includedBenchmarks).toContain("arena_text");
  });

  it("excludes results with includedInOverall = false (visual benchmarks)", () => {
    const results: BenchmarkResult[] = [
      makeResult({
        id: "a1",
        modelName: "Model A",
        normalizedScore: 100,
        includedInOverall: true,
      }),
      // Visual benchmark model excluded via includedInOverall = false
      makeResult({
        id: "b1",
        modelName: "Video Model",
        benchmarkKey: "arena_text_to_image",
        normalizedScore: 100,
        includedInOverall: false,
        category: "text_to_image",
      }),
      makeResult({
        id: "b2",
        modelName: "Video Model",
        benchmarkKey: "arena_text_to_video",
        normalizedScore: 100,
        includedInOverall: false,
        category: "text_to_video",
      }),
      makeResult({
        id: "b3",
        modelName: "Video Model",
        benchmarkKey: "arena_image_to_video",
        normalizedScore: 100,
        includedInOverall: false,
        category: "image_to_video",
      }),
    ];

    const top3 = buildOverallTop3(results);

    expect(top3).toHaveLength(1);
    expect(top3[0].modelName).toBe("Model A");
  });

  it("excludes results with null normalizedScore", () => {
    const results: BenchmarkResult[] = [
      makeResult({ id: "a1", modelName: "Model A", normalizedScore: 80 }),
      makeResult({ id: "b1", modelName: "Model B", normalizedScore: null }),
    ];

    const top3 = buildOverallTop3(results);

    expect(top3).toHaveLength(1);
    expect(top3[0].modelName).toBe("Model A");
  });

  it("returns empty array when no eligible results", () => {
    const results: BenchmarkResult[] = [
      makeResult({ id: "a1", includedInOverall: false }),
    ];

    const top3 = buildOverallTop3(results);
    expect(top3).toEqual([]);
  });

  it("uses HF Open LLM weight of 0, so it contributes 0 to score", () => {
    const results: BenchmarkResult[] = [
      makeResult({
        id: "a1",
        modelName: "Model A",
        benchmarkKey: "hf_open_llm",
        normalizedScore: 100,
        includedInOverall: true, // Even if true, weight is 0
        category: "open_only",
      }),
      makeResult({
        id: "b1",
        modelName: "Model B",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 50,
      }),
    ];

    const top3 = buildOverallTop3(results);

    // Model B has 50 * 0.10 = 5 weighted score
    // Model A has 100 * 0 = 0 weighted score
    expect(top3[0].modelName).toBe("Model B");
  });

  it("visual benchmarks have weight 0 so they contribute nothing even if included", () => {
    const results: BenchmarkResult[] = [
      // Even if somehow includedInOverall is true, weight is 0
      makeResult({
        id: "a1",
        modelName: "Video Model",
        benchmarkKey: "arena_text_to_image",
        normalizedScore: 100,
        includedInOverall: true,
        category: "text_to_image",
      }),
      makeResult({
        id: "b1",
        modelName: "LLM Model",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 50,
      }),
    ];

    const top3 = buildOverallTop3(results);

    // LLM Model: 50 * 0.10 = 5
    // Video Model: 100 * 0 = 0
    expect(top3[0].modelName).toBe("LLM Model");
  });

  it("breaks ties by appearance count then alphabetically", () => {
    const results: BenchmarkResult[] = [
      makeResult({
        id: "a1",
        modelName: "Zebra Model",
        provider: "Z",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 100,
      }),
      makeResult({
        id: "b1",
        modelName: "Alpha Model",
        provider: "A",
        benchmarkKey: "swe_bench_verified",
        normalizedScore: 100,
      }),
    ];

    const top3 = buildOverallTop3(results);

    // Same weighted score (10), same appearance count (1) → alphabetical
    expect(top3[0].modelName).toBe("Alpha Model");
    expect(top3[1].modelName).toBe("Zebra Model");
  });
});
