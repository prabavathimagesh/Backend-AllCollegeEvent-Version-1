const pkg = require("@prisma/client");
const { PrismaClient } = pkg;
const { seedRoles } = require("./seeds/role.seed.ts");

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Main seed runner
 * Executes all database seed operations
 */
async function main() {
  // Log start of seeding
  console.log("Seeding database...");

  // Seed default roles
  await seedRoles();

  // Log completion
  console.log("Seed completed!");
}

// Execute seeding process
main()
  // Catch and log any errors during seeding
  .catch((e) => console.error(e))
  // Always disconnect Prisma client
  .finally(() => prisma.$disconnect());
