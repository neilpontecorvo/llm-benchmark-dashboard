import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { generatePng } from "@/lib/export";

export async function GET() {
  const filePath = await generatePng();
  const buffer = await fs.readFile(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`
    }
  });
}
