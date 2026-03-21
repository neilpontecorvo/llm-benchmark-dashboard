import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const THEMES_DIR = path.join(process.cwd(), "themes");

/**
 * GET /api/themes/:name — Get theme CSS content by name
 * Returns the raw CSS text for injecting into the page
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const filePath = path.join(THEMES_DIR, `${decodedName}.css`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: `Theme "${decodedName}" not found` }, { status: 404 });
  }

  const css = fs.readFileSync(filePath, "utf-8");
  return new NextResponse(css, {
    headers: { "Content-Type": "text/css" },
  });
}

/**
 * DELETE /api/themes/:name — Delete a theme
 * Cannot delete the "Default Light" theme.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  if (decodedName === "Default Light") {
    return NextResponse.json({ error: "Cannot delete the default theme" }, { status: 403 });
  }

  const filePath = path.join(THEMES_DIR, `${decodedName}.css`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: `Theme "${decodedName}" not found` }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ message: `Theme "${decodedName}" deleted.` });
}
