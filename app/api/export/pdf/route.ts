import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { generatePdf } from "@/lib/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = await generatePdf();
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF export failed" },
      { status: 500 }
    );
  }
}
