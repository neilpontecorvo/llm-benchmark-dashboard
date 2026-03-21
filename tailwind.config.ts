import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-family-base)"],
        mono: ["var(--font-family-mono)"],
        heading: ["var(--font-family-heading)"],
      },
      colors: {
        border: "var(--card-border)",
        input: "var(--card-border)",
        ring: "var(--btn-primary-bg)",
        background: "var(--page-bg)",
        foreground: "var(--page-text)",
        muted: "var(--page-text-muted)",
        card: "var(--card-bg)",
        primary: "var(--btn-primary-bg)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "var(--card-radius)"
      },
      boxShadow: {
        soft: "var(--card-shadow)"
      }
    }
  },
  plugins: []
} satisfies Config;
