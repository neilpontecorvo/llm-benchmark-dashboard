import { BenchmarkCategory, BenchmarkKey, OverallResult } from "@/lib/types";
import { BENCHMARK_CATEGORIES } from "@/lib/weights";

const STRENGTH_LABELS: Record<BenchmarkKey, string> = {
  artificial_analysis: "Intelligence Index",
  arena_text: "Community Preferred",
  swe_bench_verified: "Real-World Coding",
  aider_polyglot: "Polyglot Coding",
  livebench: "Live Evaluation",
  hf_open_llm: "Open-Weight",
  arena_text_to_image: "Image Generation",
  arena_text_to_video: "Video from Text",
  arena_image_to_video: "Video from Image",
  gpqa_diamond: "Expert Reasoning",
  humanitys_last_exam: "Frontier Knowledge",
  mmmlu: "Multilingual",
};

interface ThemeStyle { bg: string; text: string; border: string }

const CATEGORY_STYLES: Record<BenchmarkCategory, ThemeStyle> = {
  general:              { bg: "var(--cat-general-bg)",        text: "var(--cat-general-text)",        border: "var(--cat-general-border)" },
  coding:               { bg: "var(--cat-coding-bg)",         text: "var(--cat-coding-text)",         border: "var(--cat-coding-border)" },
  agentic:              { bg: "var(--cat-agentic-bg)",        text: "var(--cat-agentic-text)",        border: "var(--cat-agentic-border)" },
  open_only:            { bg: "var(--cat-open-only-bg)",      text: "var(--cat-open-only-text)",      border: "var(--cat-open-only-border)" },
  community_preference: { bg: "var(--cat-community-bg)",      text: "var(--cat-community-text)",      border: "var(--cat-community-border)" },
  text_to_image:        { bg: "var(--cat-text-to-image-bg)",  text: "var(--cat-text-to-image-text)",  border: "var(--cat-text-to-image-border)" },
  text_to_video:        { bg: "var(--cat-text-to-video-bg)",  text: "var(--cat-text-to-video-text)",  border: "var(--cat-text-to-video-border)" },
  image_to_video:       { bg: "var(--cat-image-to-video-bg)", text: "var(--cat-image-to-video-text)", border: "var(--cat-image-to-video-border)" },
  reasoning:            { bg: "var(--cat-reasoning-bg)",      text: "var(--cat-reasoning-text)",      border: "var(--cat-reasoning-border)" },
  multilingual:         { bg: "var(--cat-multilingual-bg)",   text: "var(--cat-multilingual-text)",   border: "var(--cat-multilingual-border)" },
};

/** Model card URLs keyed by substring match against modelName (case-insensitive) */
const MODEL_CARD_URLS: { match: string; url: string; label: string }[] = [
  { match: "gemini 3", url: "https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Pro-Model-Card.pdf", label: "Model Card" },
  { match: "claude opus 4.6", url: "https://www-cdn.anthropic.com/0dd865075ad3132672ee0ab40b05a53f14cf5288.pdf", label: "Model Card" },
  { match: "gpt-5.4", url: "https://openai.com/index/gpt-5-4-thinking-system-card/", label: "System Card" },
  { match: "kimi k2", url: "https://build.nvidia.com/moonshotai/kimi-k2-instruct/modelcard", label: "Model Card" },
];

function getModelCardUrl(modelName: string): { url: string; label: string } | null {
  const lower = modelName.toLowerCase();
  for (const entry of MODEL_CARD_URLS) {
    if (lower.includes(entry.match)) return { url: entry.url, label: entry.label };
  }
  return null;
}

const RANK_STYLES: ThemeStyle[] = [
  { bg: "var(--rank1-bg)", text: "var(--rank1-text)", border: "var(--rank1-border)" },
  { bg: "var(--rank2-bg)", text: "var(--rank2-text)", border: "var(--rank2-border)" },
  { bg: "var(--rank3-bg)", text: "var(--rank3-text)", border: "var(--rank3-border)" },
];

const DEFAULT_RANK: ThemeStyle = { bg: "var(--card-bg)", text: "var(--page-text)", border: "var(--card-border)" };

export function OverallTop3({ data }: { data: OverallResult[] }) {
  return (
    <section className="card mb-6 p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-lg font-semibold font-heading">Overall Top 3</h2>
        <p className="max-w-xl text-sm leading-relaxed" style={{ color: "var(--page-text-muted)" }}>
          Each benchmark is normalized to a 0-100 scale, then weighted by importance.
          The overall score is the sum of weighted normalized scores across text and
          reasoning benchmarks. Visual benchmarks are scored separately. Higher is better.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-3">
        {data.map((item) => {
          const rs = RANK_STYLES[item.overallRank - 1] ?? DEFAULT_RANK;
          return (
            <div
              key={item.id}
              className="rounded-2xl border p-4 sm:p-5 min-w-0 overflow-hidden"
              style={{ background: rs.bg, color: rs.text, borderColor: rs.border }}
            >
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
                    Rank #{item.overallRank}
                  </div>
                  <div className="mt-1 truncate text-lg font-semibold font-heading" title={item.modelName}>
                    {item.modelName}
                  </div>
                  <div className="text-sm" style={{ color: "var(--page-text-muted)" }}>{item.provider ?? "Unknown provider"}</div>
                  <div className="mt-3 text-2xl font-bold tabular-nums">{item.weightedScore}</div>
                  <div className="text-xs" style={{ color: "var(--page-text-muted)" }}>
                    {item.appearanceCount} benchmark{item.appearanceCount !== 1 ? "s" : ""}
                  </div>
                  {(() => {
                    const card = getModelCardUrl(item.modelName);
                    if (!card) return null;
                    return (
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        style={{ color: "var(--btn-primary-bg)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        {card.label}
                      </a>
                    );
                  })()}
                </div>

                <div className="flex flex-col items-end gap-1.5 pt-5 shrink-0 max-w-[45%]">
                  {item.includedBenchmarks.map((benchKey) => {
                    const category = BENCHMARK_CATEGORIES[benchKey];
                    const cs = CATEGORY_STYLES[category];
                    return (
                      <span
                        key={benchKey}
                        className="inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}
                      >
                        {STRENGTH_LABELS[benchKey]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
