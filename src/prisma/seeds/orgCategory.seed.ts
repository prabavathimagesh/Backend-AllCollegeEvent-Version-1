const prisma = require("../../src/config/db.config.ts");

async function seedOrgCategory() {
  try {
    await prisma.orgCategory.createMany({
      data: [
        { categoryName: "College / University" },
        { categoryName: "Training & Coaching Institute" },
        { categoryName: "Individual / Freelancer" },
        { categoryName: "Tech / Professional Community" },
        { categoryName: "Event Management Company" },
        { categoryName: "Sports Club / Fitness Association" },
        { categoryName: "Corporate / Company" },
        { categoryName: "Government Organization" },
        { categoryName: "NGO / Non-Profit Organization" },
      ],
      skipDuplicates: true,
    });

    console.log("Org categories seeded successfully.");
  } catch (error) {
    console.error("Error seeding org categories:", error);
    throw error;
  }
}

module.exports = { seedOrgCategory };
