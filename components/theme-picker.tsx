"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Upload, Check, Trash2, ChevronDown } from "lucide-react";

interface ThemeEntry {
  name: string;
  filename: string;
  createdAt: string;
}

const STORAGE_KEY = "llm-dashboard-active-theme";

/**
 * Font families available for the Theme Architect tool and this picker.
 * These are web-safe or Google Fonts families that work without extra imports
 * (Inter and JetBrains Mono are already loaded via the project).
 */
export const AVAILABLE_FONTS = [
  // Sans-serif
  { label: "Inter (Default)", value: '"Inter", system-ui, -apple-system, sans-serif' },
  { label: "System Native", value: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" },
  { label: "Helvetica Neue", value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "SF Pro", value: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' },
  { label: "Segoe UI", value: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
  { label: "Roboto", value: '"Roboto", "Helvetica Neue", Arial, sans-serif' },
  { label: "Open Sans", value: '"Open Sans", "Helvetica Neue", Arial, sans-serif' },
  { label: "Lato", value: '"Lato", "Helvetica Neue", Arial, sans-serif' },
  { label: "Source Sans 3", value: '"Source Sans 3", "Helvetica Neue", Arial, sans-serif' },
  { label: "Nunito", value: '"Nunito", "Helvetica Neue", Arial, sans-serif' },
  { label: "Poppins", value: '"Poppins", "Helvetica Neue", Arial, sans-serif' },
  { label: "DM Sans", value: '"DM Sans", "Helvetica Neue", Arial, sans-serif' },
  { label: "Plus Jakarta Sans", value: '"Plus Jakarta Sans", "Inter", sans-serif' },
  { label: "Manrope", value: '"Manrope", "Inter", sans-serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", "Inter", sans-serif' },
  { label: "Outfit", value: '"Outfit", "Inter", sans-serif' },
  { label: "Figtree", value: '"Figtree", "Inter", sans-serif' },

  // Serif
  { label: "Georgia", value: "Georgia, Cambria, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Palatino", value: '"Palatino Linotype", Palatino, "Book Antiqua", serif' },
  { label: "Libre Baskerville", value: '"Libre Baskerville", Georgia, serif' },
  { label: "Playfair Display", value: '"Playfair Display", Georgia, serif' },
  { label: "Merriweather", value: '"Merriweather", Georgia, serif' },
  { label: "Lora", value: '"Lora", Georgia, serif' },
  { label: "Crimson Text", value: '"Crimson Text", Georgia, serif' },

  // Monospace
  { label: "JetBrains Mono", value: '"JetBrains Mono", "Fira Code", ui-monospace, monospace' },
  { label: "Fira Code", value: '"Fira Code", "JetBrains Mono", ui-monospace, monospace' },
  { label: "Source Code Pro", value: '"Source Code Pro", ui-monospace, monospace' },
  { label: "IBM Plex Mono", value: '"IBM Plex Mono", ui-monospace, monospace' },
  { label: "Cascadia Code", value: '"Cascadia Code", "Fira Code", ui-monospace, monospace' },
  { label: "Monaco", value: "Monaco, Consolas, ui-monospace, monospace" },
  { label: "Menlo", value: 'Menlo, Monaco, "Courier New", monospace' },
];

export function ThemePicker() {
  const [themes, setThemes] = useState<ThemeEntry[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("Default Light");
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [justApplied, setJustApplied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load theme list and restore last active theme
  useEffect(() => {
    fetchThemes();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActiveTheme(saved);
      applyTheme(saved);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchThemes() {
    try {
      const res = await fetch("/api/themes");
      const data = await res.json();
      setThemes(data.themes ?? []);
    } catch {
      console.error("Failed to fetch themes");
    }
  }

  async function applyTheme(name: string) {
    // Remove any previously injected theme override
    const existing = document.getElementById("theme-override");
    if (existing) existing.remove();

    if (name === "Default Light") {
      // No override needed — the base theme.css is the default
      setActiveTheme(name);
      localStorage.setItem(STORAGE_KEY, name);
      flashApplied(name);
      return;
    }

    try {
      const res = await fetch(`/api/themes/${encodeURIComponent(name)}`);
      if (!res.ok) return;
      const css = await res.text();

      const style = document.createElement("style");
      style.id = "theme-override";
      style.textContent = css;
      document.head.appendChild(style);

      setActiveTheme(name);
      localStorage.setItem(STORAGE_KEY, name);
      flashApplied(name);
    } catch {
      console.error(`Failed to apply theme: ${name}`);
    }
  }

  function flashApplied(name: string) {
    setJustApplied(name);
    setTimeout(() => setJustApplied(null), 1500);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/themes", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        await fetchThemes();
        await applyTheme(data.name);
      } else {
        alert(data.error ?? "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete theme "${name}"?`)) return;
    try {
      await fetch(`/api/themes/${encodeURIComponent(name)}`, { method: "DELETE" });
      await fetchThemes();
      if (activeTheme === name) {
        await applyTheme("Default Light");
      }
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all"
        style={{
          background: "var(--btn-secondary-bg)",
          color: "var(--btn-secondary-text)",
          border: "1px solid var(--btn-secondary-border)",
          borderRadius: "var(--btn-radius)",
        }}
      >
        <Palette size={16} />
        <span className="hidden sm:inline">{activeTheme}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border shadow-xl"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {/* Header */}
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: "var(--card-border)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--page-text)" }}>
              Dashboard Themes
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: "var(--page-text-muted)" }}>
              Select a theme or import from Theme Architect
            </p>
          </div>

          {/* Theme list */}
          <div className="max-h-64 overflow-y-auto">
            {themes.map((theme) => (
              <div
                key={theme.name}
                className="group flex items-center gap-2 px-4 py-2.5 transition-colors hover:opacity-80"
                style={{
                  background: activeTheme === theme.name ? "var(--table-top3-bg)" : undefined,
                  borderBottom: "1px solid var(--table-row-border)",
                }}
              >
                <button
                  className="flex flex-1 items-center gap-2 text-left text-sm"
                  style={{ color: "var(--page-text)" }}
                  onClick={() => {
                    applyTheme(theme.name);
                    setIsOpen(false);
                  }}
                >
                  {justApplied === theme.name ? (
                    <Check size={14} className="shrink-0 text-green-500" />
                  ) : activeTheme === theme.name ? (
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: "var(--badge-live-dot)" }}
                    />
                  ) : (
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--page-text-faint)" }} />
                  )}
                  <span className="truncate font-medium">{theme.name}</span>
                </button>
                {theme.name !== "Default Light" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(theme.name);
                    }}
                    className="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
                    title={`Delete "${theme.name}"`}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload section */}
          <div
            className="border-t px-4 py-3"
            style={{ borderColor: "var(--card-border)" }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".css,text/css"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)",
                borderRadius: "var(--btn-radius)",
              }}
            >
              <Upload size={14} />
              {uploading ? "Uploading..." : "Import Theme (.css)"}
            </button>
            <p className="mt-2 text-center text-xs" style={{ color: "var(--page-text-faint)" }}>
              Export from Theme Architect and import here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
