const prisma = require("../../src/config/db.config.ts");

async function seedAcePerks() {
  try {
    await prisma.acePerk.createMany({
      data: [
        { perkName: "cash" },
        { perkName: "award" },
        { perkName: "medal" },
      ],
      skipDuplicates: false,
    });

    console.log("Ace perks seeded successfully.");
  } catch (error) {
    console.error("Error seeding ace perks:", error);
    throw error;
  }
}

module.exports = { seedAcePerks };
