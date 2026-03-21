import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

function stamp() {
  return new Date().toISOString().replace(/[:]/g, "-");
}

export async function ensureExportDir() {
  const outputDir = path.resolve(process.cwd(), process.env.EXPORT_OUTPUT_DIR ?? "./exports");
  await fs.mkdir(outputDir, { recursive: true });
  return outputDir;
}

export async function generatePdf() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${process.env.APP_URL ?? "http://localhost:3000"}/export/report`, { waitUntil: "networkidle" });
    const outputDir = await ensureExportDir();
    const filePath = path.join(outputDir, `benchmark-report-${stamp()}.pdf`);
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
    return filePath;
  } finally {
    await browser.close();
  }
}

export async function generatePng() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
    await page.goto(`${process.env.APP_URL ?? "http://localhost:3000"}/export/report`, { waitUntil: "networkidle" });
    const outputDir = await ensureExportDir();
    const filePath = path.join(outputDir, `benchmark-report-${stamp()}.png`);
    await page.screenshot({ path: filePath, fullPage: true, type: "png" });
    return filePath;
  } finally {
    await browser.close();
  }
}
