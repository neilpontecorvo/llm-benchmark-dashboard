/**
 * Contract tests for all 12 benchmark adapters.
 *
 * These tests verify that every adapter:
 * 1. Has a valid BenchmarkKey
 * 2. Returns the correct result shape
 * 3. Tags results with the correct benchmarkKey
 * 4. Sets dataSource field
 * 5. Returns normalized scores
 *
 * Tests run in mock mode (USE_MOCK_DATA unset → defaults to mock).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { adapters } from "@/lib/adapters";
import type { BenchmarkKey, BenchmarkResult } from "@/lib/types";
import { BENCHMARK_WEIGHTS, BENCHMARK_NAMES, BENCHMARK_CATEGORIES } from "@/lib/weights";

const ALL_KEYS: BenchmarkKey[] = [
  "artificial_analysis",
  "arena_text",
  "swe_bench_verified",
  "aider_polyglot",
  "livebench",
  "hf_open_llm",
  "arena_text_to_image",
  "arena_text_to_video",
  "arena_image_to_video",
  "gpqa_diamond",
  "humanitys_last_exam",
  "mmmlu",
];

describe("Adapter registry", () => {
  it("has exactly 12 adapters", () => {
    expect(adapters).toHaveLength(12);
  });

  it("covers all 12 benchmark keys", () => {
    const keys = adapters.map((a) => a.key);
    for (const expected of ALL_KEYS) {
      expect(keys, `Missing adapter for ${expected}`).toContain(expected);
    }
  });

  it("has no duplicate keys", () => {
    const keys = adapters.map((a) => a.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

describe.each(adapters.map((a) => [a.key, a] as const))(
  "Adapter: %s",
  (key, adapter) => {
    let results: BenchmarkResult[];

    beforeAll(async () => {
      // Run in mock mode — adapters default to mock when USE_MOCK_DATA is not "false"
      delete process.env.USE_MOCK_DATA;
      results = await adapter.fetchTopResults(5);
    });

    it("has a valid benchmarkKey", () => {
      expect(ALL_KEYS).toContain(adapter.key);
    });

    it("has a displayName", () => {
      expect(adapter.displayName.length).toBeGreaterThan(0);
    });

    it("has a sourceUrl", () => {
      expect(adapter.sourceUrl).toMatch(/^https?:\/\//);
    });

    it("has a weight entry", () => {
      expect(BENCHMARK_WEIGHTS[adapter.key]).toBeDefined();
    });

    it("has a name entry", () => {
      expect(BENCHMARK_NAMES[adapter.key]).toBeDefined();
    });

    it("has a category entry", () => {
      expect(BENCHMARK_CATEGORIES[adapter.key]).toBeDefined();
    });

    it("returns an array of results", () => {
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it("all results have the correct benchmarkKey", () => {
      for (const r of results) {
        expect(r.benchmarkKey).toBe(adapter.key);
      }
    });

    it("all results have required fields", () => {
      for (const r of results) {
        expect(r.id).toBeDefined();
        expect(typeof r.id).toBe("string");
        expect(r.modelName).toBeDefined();
        expect(typeof r.modelName).toBe("string");
        expect(r.modelName.length).toBeGreaterThan(0);
        expect(r.fetchedAt).toBeDefined();
        expect(r.sourceUrl).toBeDefined();
        expect(r.category).toBeDefined();
      }
    });

    it("all results have a dataSource tag", () => {
      for (const r of results) {
        expect(r.dataSource).toBeDefined();
        expect(["live", "mock"]).toContain(r.dataSource);
      }
    });

    it("all results have normalizedScore (number or null)", () => {
      for (const r of results) {
        if (r.normalizedScore !== null) {
          expect(typeof r.normalizedScore).toBe("number");
          expect(r.normalizedScore).toBeGreaterThanOrEqual(0);
          expect(r.normalizedScore).toBeLessThanOrEqual(100);
        }
      }
    });

    it("includedInOverall matches adapter declaration", () => {
      for (const r of results) {
        expect(r.includedInOverall).toBe(adapter.includedInOverall);
      }
    });
  }
);
