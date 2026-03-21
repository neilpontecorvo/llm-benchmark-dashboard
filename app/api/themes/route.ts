import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const THEMES_DIR = path.join(process.cwd(), "themes");

/** Ensure themes directory exists */
function ensureDir() {
  if (!fs.existsSync(THEMES_DIR)) {
    fs.mkdirSync(THEMES_DIR, { recursive: true });
  }
}

/** Sanitize a theme name to a safe filename */
function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 _\-().]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/**
 * GET /api/themes — List all saved themes
 * Returns: { themes: [{ name, filename, createdAt }] }
 */
export async function GET() {
  ensureDir();

  const files = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith(".css"));
  const themes = files.map((filename) => {
    const stat = fs.statSync(path.join(THEMES_DIR, filename));
    return {
      name: filename.replace(/\.css$/, ""),
      filename,
      createdAt: stat.birthtime.toISOString(),
    };
  });

  // Sort alphabetically, but put "Default Light" first
  themes.sort((a, b) => {
    if (a.name === "Default Light") return -1;
    if (b.name === "Default Light") return 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ themes });
}

/**
 * POST /api/themes — Upload a new theme CSS file
 * Body: multipart/form-data with `file` (CSS file) and optional `name` (theme name)
 *
 * If name is not provided, the original filename (sans extension) is used.
 * If a theme with the same name exists, a numeric suffix is added.
 */
export async function POST(req: NextRequest) {
  ensureDir();

  const formData = await req.formData();
  const file = formData.get("file");
  const nameOverride = formData.get("name");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate it's a CSS file
  if (!file.name.endsWith(".css") && file.type !== "text/css") {
    return NextResponse.json({ error: "Only .css files are accepted" }, { status: 400 });
  }

  const cssContent = await file.text();

  // Basic validation: must contain at least one CSS variable
  if (!cssContent.includes("--")) {
    return NextResponse.json(
      { error: "File does not appear to contain CSS custom properties (--variables)" },
      { status: 400 },
    );
  }

  // Determine theme name
  let baseName = sanitizeName(
    typeof nameOverride === "string" && nameOverride.trim()
      ? nameOverride
      : file.name.replace(/\.css$/, ""),
  );

  if (!baseName) baseName = "Untitled Theme";

  // Deduplicate: if "My Theme.css" exists, try "My Theme (2).css", etc.
  let finalName = baseName;
  let counter = 2;
  while (fs.existsSync(path.join(THEMES_DIR, `${finalName}.css`))) {
    finalName = `${baseName} (${counter})`;
    counter++;
  }

  const destPath = path.join(THEMES_DIR, `${finalName}.css`);
  fs.writeFileSync(destPath, cssContent, "utf-8");

  return NextResponse.json({
    name: finalName,
    filename: `${finalName}.css`,
    message: `Theme "${finalName}" saved successfully.`,
  });
}
