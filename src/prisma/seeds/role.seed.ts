const prisma = require("../../src/config/db.config.ts");

/**
 * Seed default roles into database
 * This function inserts admin, org, and user roles
 */
async function seedRoles() {
  try {
    // Insert multiple roles at once
    await prisma.role.createMany({
      data: [
        { name: "admin" },
        { name: "org" },
        { name: "user" }
      ],

      // Do not skip duplicates (will throw error if exists)
      skipDuplicates: false,
    });

    // Log success message
    console.log("Roles seeded successfully.");
  } catch (error) {
    // Log error if seeding fails
    console.error("Error seeding roles:", error);

    // Re-throw error for upstream handling
    throw error;
  }
}

// Export seed function for main seed runner
module.exports = {
  seedRoles,
};
