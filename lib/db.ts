import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and set DATABASE_URL before running the app.");
  }
  return value;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl()
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
