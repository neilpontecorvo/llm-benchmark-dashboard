import { BenchmarkCategory, BenchmarkResult, DataSource } from "@/lib/types";
import { BenchmarkTable } from "@/components/benchmark-table";

interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
}

const CATEGORY_STYLES: Record<BenchmarkCategory, CategoryStyle> = {
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

interface BenchmarkCardProps {
  title: string;
  description: string;
  category: string;
  categoryKey: BenchmarkCategory;
  sourceUrl: string;
  rows: BenchmarkResult[];
  weight: number;
}

export function BenchmarkCard({ title, description, category, categoryKey, sourceUrl, rows, weight }: BenchmarkCardProps) {
  const hasData = rows.length > 0;
  const dataSource: DataSource = rows[0]?.dataSource ?? "mock";
  const weightPct = Math.round(weight * 100);
  const catStyle = CATEGORY_STYLES[categoryKey];

  return (
    <section className="card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold font-heading">{title}</h3>
            <span
              className="rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{ background: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
            >
              {category}
            </span>
            <SourceBadge source={dataSource} />
          </div>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--page-text-muted)" }}>{description}</p>
          <div className="mt-1.5 flex items-center gap-3 text-sm" style={{ color: "var(--page-text-muted)" }}>
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline" style={{ color: "var(--link-color)" }}>
              Source
            </a>
            <span style={{ color: "var(--page-text-faint)" }}>|</span>
            <span>
              {weightPct > 0
                ? `${weightPct}% of overall score`
                : "Not weighted"}
            </span>
          </div>
        </div>
      </div>
      {hasData ? (
        <BenchmarkTable rows={rows} />
      ) : (
        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm" style={{ borderColor: "var(--card-border)", color: "var(--page-text-faint)" }}>
          No data available. Run a refresh to populate this benchmark.
        </div>
      )}
    </section>
  );
}

function SourceBadge({ source }: { source: DataSource }) {
  if (source === "live") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: "var(--badge-live-bg)", color: "var(--badge-live-text)" }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--badge-live-dot)" }} />
        Live
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: "var(--badge-mock-bg)", color: "var(--badge-mock-text)" }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--badge-mock-dot)" }} />
      Mock
    </span>
  );
}
