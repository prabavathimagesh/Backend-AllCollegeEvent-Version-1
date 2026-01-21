const pkg = require("@prisma/client");
const { PrismaClient } = pkg;
const { seedRoles } = require("./seeds/role.seed.ts");
const { seedAceCertifications } = require("./seeds/certification.seed.ts");
const { seedAcePerks } = require("./seeds/perk.seed.ts");
const { seedAceCategoryTypes } = require("./seeds/categoryType.seed.ts");
const { seedAceEventTypes } = require("./seeds/aceEventTypes.seed.ts");
const { seedAceAccommodation } = require("./seeds/accommodation.seed.ts");
const { seedOrgCategory } = require("./seeds/orgCategory.seed.ts");
const { seedCountries } = require("./seeds/countries.seed.ts");
const { seedAceDepartment } = require("./seeds/aceDepartment.seed.ts");
const { seedAceEligibleDepartment } = require("./seeds/aceEligibleDepartment.seed.ts");

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
  // await seedRoles();
  // await seedAceCertifications();
  // await seedAcePerks();
  // await seedAceCategoryTypes();
  // await seedAceEventTypes();
  // await seedAceAccommodation()
  // await seedOrgCategory();
  // await seedCountries();
  await seedAceDepartment();
  await seedAceEligibleDepartment()

  // Log completion
  console.log("Seed completed!");
}

// Execute seeding process
main()
  // Catch and log any errors during seeding
  .catch((e) => console.error(e))
  // Always disconnect Prisma client
  .finally(() => prisma.$disconnect());
