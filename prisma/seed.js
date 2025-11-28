// import pkg from '@prisma/client';
// const { PrismaClient } = pkg;
// import { seedRoles } from "./seeds/role.seed.ts";
const pkg = require("@prisma/client");
const { PrismaClient } = pkg;
const { seedRoles } = require("./seeds/role.seed.ts");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  await seedRoles();
  console.log("🌱 Seed completed!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
