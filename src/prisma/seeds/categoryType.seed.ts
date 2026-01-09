const prisma = require("../../src/config/db.config.ts");

async function seedAceCategoryTypes() {
  try {
    await prisma.aceCategoryType.createMany({
      data: [
        { categoryName: "Education" },
        { categoryName: "Sports" },
        { categoryName: "Entertainment" },
        { categoryName: "Networking" },
        { categoryName: "Others" },
      ],
      skipDuplicates: false,
    });

    console.log("Ace category types seeded successfully.");
  } catch (error) {
    console.error("Error seeding ace category types:", error);
    throw error;
  }
}

module.exports = { seedAceCategoryTypes };
