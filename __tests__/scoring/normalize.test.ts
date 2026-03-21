import { describe, it, expect } from "vitest";
import { normalizeScores } from "@/lib/scoring/normalize";
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
    normalizedScore: null,
    category: "coding",
    sourceUrl: "https://example.com",
    includedInOverall: true,
    ...overrides,
  };
}

describe("normalizeScores", () => {
  it("normalizes numeric scores to 0-100 range using min-max", () => {
    const results = [
      makeResult({ id: "a", modelName: "Low", rawScore: 20 }),
      makeResult({ id: "b", modelName: "Mid", rawScore: 60 }),
      makeResult({ id: "c", modelName: "High", rawScore: 100 }),
    ];

    const normalized = normalizeScores(results);

    // Low = (20-20)/(100-20)*100 = 0
    expect(normalized[0].normalizedScore).toBe(0);
    // Mid = (60-20)/(100-20)*100 = 50
    expect(normalized[1].normalizedScore).toBe(50);
    // High = (100-20)/(100-20)*100 = 100
    expect(normalized[2].normalizedScore).toBe(100);
  });

  it("returns 100 for all when scores are identical", () => {
    const results = [
      makeResult({ id: "a", rawScore: 75 }),
      makeResult({ id: "b", rawScore: 75 }),
    ];

    const normalized = normalizeScores(results);

    expect(normalized[0].normalizedScore).toBe(100);
    expect(normalized[1].normalizedScore).toBe(100);
  });

  it("falls back to rank-based normalization when no numeric scores", () => {
    const results = [
      makeResult({ id: "a", rawScore: null, rank: 1 }),
      makeResult({ id: "b", rawScore: null, rank: 2 }),
      makeResult({ id: "c", rawScore: null, rank: 3 }),
    ];

    const normalized = normalizeScores(results);

    // rank 1 → (3-1+1)/3*100 = 100
    expect(normalized[0].normalizedScore).toBe(100);
    // rank 2 → (3-2+1)/3*100 = 66.67
    expect(normalized[1].normalizedScore).toBe(66.67);
    // rank 3 → (3-3+1)/3*100 = 33.33
    expect(normalized[2].normalizedScore).toBe(33.33);
  });

  it("handles single result", () => {
    const results = [makeResult({ id: "a", rawScore: 42 })];
    const normalized = normalizeScores(results);
    // Single score → min === max → returns 100
    expect(normalized[0].normalizedScore).toBe(100);
  });

  it("handles empty array", () => {
    const normalized = normalizeScores([]);
    expect(normalized).toEqual([]);
  });

  it("preserves non-score fields", () => {
    const results = [
      makeResult({
        id: "preserve-test",
        modelName: "Claude Opus 4.6",
        provider: "Anthropic",
        rawScore: 90,
        category: "general",
      }),
    ];

    const normalized = normalizeScores(results);

    expect(normalized[0].id).toBe("preserve-test");
    expect(normalized[0].modelName).toBe("Claude Opus 4.6");
    expect(normalized[0].provider).toBe("Anthropic");
    expect(normalized[0].rawScore).toBe(90);
    expect(normalized[0].category).toBe("general");
  });

  it("handles mixed null and numeric rawScores", () => {
    const results = [
      makeResult({ id: "a", rawScore: 20 }),
      makeResult({ id: "b", rawScore: null }),
      makeResult({ id: "c", rawScore: 80 }),
    ];

    const normalized = normalizeScores(results);

    // a = (20-20)/(80-20)*100 = 0
    expect(normalized[0].normalizedScore).toBe(0);
    // b has null rawScore → normalizedScore should be null
    expect(normalized[1].normalizedScore).toBeNull();
    // c = (80-20)/(80-20)*100 = 100
    expect(normalized[2].normalizedScore).toBe(100);
  });
});
