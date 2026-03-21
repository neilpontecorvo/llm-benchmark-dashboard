import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM Benchmark Dashboard",
  description: "Top LLM benchmark leaderboards with refresh and export."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
