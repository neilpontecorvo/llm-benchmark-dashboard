import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { generatePng } from "@/lib/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = await generatePng();
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PNG export failed" },
      { status: 500 }
    );
  }
}
