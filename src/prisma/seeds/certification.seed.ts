const prisma = require("../../src/config/db.config.ts");

async function seedAceCertifications() {
  try {
    await prisma.aceCertification.createMany({
      data: [
        { certName: "For all participants" },
        { certName: "Exclusive winners" },
        { certName: "Not provided" },
      ],
      skipDuplicates: false,
    });

    console.log("Ace certifications seeded successfully.");
  } catch (error) {
    console.error("Error seeding ace certifications:", error);
    throw error;
  }
}

module.exports = { seedAceCertifications };
