import { describe, it, expect } from "vitest";
import {
  BENCHMARK_WEIGHTS,
  BENCHMARK_NAMES,
  BENCHMARK_CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/weights";
import type { BenchmarkKey } from "@/lib/types";

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

describe("BENCHMARK_WEIGHTS", () => {
  it("has exactly 12 benchmarks", () => {
    expect(Object.keys(BENCHMARK_WEIGHTS)).toHaveLength(12);
  });

  it("weights sum to 1.0 (excluding HF Open LLM at 0%)", () => {
    const sum = Object.values(BENCHMARK_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("HF Open LLM has weight 0", () => {
    expect(BENCHMARK_WEIGHTS.hf_open_llm).toBe(0);
  });

  it("all weights are non-negative", () => {
    for (const [key, weight] of Object.entries(BENCHMARK_WEIGHTS)) {
      expect(weight, `${key} weight should be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it("all weights are <= 1", () => {
    for (const [key, weight] of Object.entries(BENCHMARK_WEIGHTS)) {
      expect(weight, `${key} weight should be <= 1`).toBeLessThanOrEqual(1);
    }
  });
});

describe("BENCHMARK_NAMES", () => {
  it("has a name for every benchmark key", () => {
    for (const key of ALL_KEYS) {
      expect(BENCHMARK_NAMES[key], `Missing name for ${key}`).toBeDefined();
      expect(BENCHMARK_NAMES[key].length).toBeGreaterThan(0);
    }
  });
});

describe("BENCHMARK_CATEGORIES", () => {
  it("has a category for every benchmark key", () => {
    for (const key of ALL_KEYS) {
      expect(BENCHMARK_CATEGORIES[key], `Missing category for ${key}`).toBeDefined();
    }
  });

  it("every category has a label", () => {
    const usedCategories = new Set(Object.values(BENCHMARK_CATEGORIES));
    for (const cat of usedCategories) {
      expect(CATEGORY_LABELS[cat], `Missing label for category ${cat}`).toBeDefined();
    }
  });
});
