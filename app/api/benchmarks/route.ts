import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/refresh";

export async function GET() {
  const data = await getDashboardData();
  return NextResponse.json(data);
}
