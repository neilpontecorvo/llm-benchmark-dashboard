import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

function stamp() {
  return new Date().toISOString().replace(/[:]/g, "-");
}

function getAppUrl() {
  const raw = process.env.APP_URL ?? "http://localhost:3000";
  const url = new URL(raw);
  return url.toString().replace(/\/$/, "");
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
    await page.goto(`${getAppUrl()}/export/report`, {
      waitUntil: "networkidle",
      timeout: 45000
    });
    const outputDir = await ensureExportDir();
    const filePath = path.join(outputDir, `benchmark-report-${stamp()}.pdf`);
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: { top: "16px", right: "16px", bottom: "16px", left: "16px" },
    });
    return filePath;
  } finally {
    await browser.close();
  }
}

export async function generatePng() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 4400 } });
    await page.goto(`${getAppUrl()}/export/report`, {
      waitUntil: "networkidle",
      timeout: 45000
    });
    const outputDir = await ensureExportDir();
    const filePath = path.join(outputDir, `benchmark-report-${stamp()}.png`);
    await page.screenshot({ path: filePath, fullPage: true, type: "png" });
    return filePath;
  } finally {
    await browser.close();
  }
}
