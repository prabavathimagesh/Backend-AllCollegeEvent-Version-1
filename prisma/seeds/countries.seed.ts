const prisma = require("../../src/config/db.config.ts");

async function seedCountries() {
  try {
    await prisma.country.createMany({
      data: [
        {
          name: "India",
          code: "IN",
          phoneCode: "+91",
        },
        {
          name: "United States",
          code: "US",
          phoneCode: "+1",
        },
        {
          name: "United Kingdom",
          code: "GB",
          phoneCode: "+44",
        },
        {
          name: "Canada",
          code: "CA",
          phoneCode: "+1",
        },
        {
          name: "Australia",
          code: "AU",
          phoneCode: "+61",
        },
        {
          name: "United Arab Emirates",
          code: "AE",
          phoneCode: "+971",
        },
        {
          name: "Saudi Arabia",
          code: "SA",
          phoneCode: "+966",
        },
        {
          name: "Singapore",
          code: "SG",
          phoneCode: "+65",
        },
        {
          name: "Malaysia",
          code: "MY",
          phoneCode: "+60",
        },
        {
          name: "Germany",
          code: "DE",
          phoneCode: "+49",
        },
        {
          name: "South Africa",
          code: "ZA",
          phoneCode: "+27",
        },
        {
          name: "Nigeria",
          code: "NG",
          phoneCode: "+234",
        },
      ],
      skipDuplicates: true,
    });

    console.log("Countries seeded successfully.");
  } catch (error) {
    console.error("Error seeding countries:", error);
    throw error;
  }
}

module.exports = { seedCountries };