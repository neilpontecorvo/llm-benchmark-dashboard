import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { generatePdf } from "@/lib/export";

export async function GET() {
  const filePath = await generatePdf();
  const buffer = await fs.readFile(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`
    }
  });
}
