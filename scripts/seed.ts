import { prisma } from "@/lib/db";
import { runRefresh } from "@/lib/refresh";

async function main() {
  await prisma.benchmarkSnapshot.deleteMany();
  await prisma.benchmarkResult.deleteMany();
  await prisma.overallResult.deleteMany();
  await prisma.refreshRun.deleteMany();
  const result = await runRefresh(10);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
