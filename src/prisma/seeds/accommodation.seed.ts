const prisma = require("../../src/config/db.config.ts");

async function seedAceAccommodation() {
  try {
    await prisma.aceAccommodation.createMany({
      data: [
        { accommodationName: "Stay" },
        { accommodationName: "Travel Assistance" },
        { accommodationName: "Wi-Fi" },
        { accommodationName: "Food" },
        { accommodationName: "Parking" },
        { accommodationName: "Medical Assistance" },
        { accommodationName: "Restrooms" },
        { accommodationName: "Accessibility Support" },
        { accommodationName: "Event Kit" },
      ],
      skipDuplicates: true,
    });

    console.log("Ace accommodation seeded successfully.");
  } catch (error) {
    console.error("Error seeding ace accommodation:", error);
    throw error;
  }
}

module.exports = { seedAceAccommodation };
