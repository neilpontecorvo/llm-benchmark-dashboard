import { prisma } from "@/lib/db";
import { runRefresh } from "@/lib/refresh";

runRefresh(10)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
