import { NextResponse } from "next/server";
import { runRefresh } from "@/lib/refresh";

export async function POST() {
  const result = await runRefresh(10);
  return NextResponse.json(result);
}
