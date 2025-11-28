// prisma/seeds/role.seed.js
// Converted to CommonJS module system for reliable execution.

// Import the shared, initialized Prisma client from your config/database.js file
const prisma = require('../../src/config/db.config.ts'); 

/**
 * Seeds the initial application roles into the database.
 */
async function seedRoles() {
    // NOTE: This assumes you have a 'Role' model defined in your schema.prisma
    try {
        await prisma.role.createMany({
            data: [
                { name: "org" },
                { name: "user" }
            ],
            skipDuplicates: true, // prevents duplicate inserts if run multiple times
        });
        console.log("✔ Roles seeded successfully.");
    } catch (error) {
        console.error("Error seeding roles:", error);
        // Throwing the error here allows the main seed.js function to catch it and disconnect.
        throw error;
    }
}

// Export the function using CommonJS syntax
module.exports = {
    seedRoles,
};