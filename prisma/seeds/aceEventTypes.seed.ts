const prisma = require("../../src/config/db.config.ts");
import type { AceCategory } from "../../src/types/type";

async function seedAceEventTypes() {
  try {
    const categories = await prisma.aceCategoryType.findMany();

    if (!categories.length) {
      throw new Error("AceCategoryType table is empty. Seed categories first.");
    }

    const map = Object.fromEntries(
      categories.map((c: AceCategory) => [
        c.categoryName.toLowerCase(),
        c.identity,
      ])
    );

    const data = [
      // NETWORKING
      { name: "Meetups", categoryIdentity: map["networking"] },
      { name: "Career Fairs", categoryIdentity: map["networking"] },
      { name: "Industry Conferences", categoryIdentity: map["networking"] },
      { name: "Startup Pitch Events", categoryIdentity: map["networking"] },
      { name: "Alumni Meets", categoryIdentity: map["networking"] },
      { name: "Expo & Trade Shows", categoryIdentity: map["networking"] },
      { name: "Others", categoryIdentity: map["networking"] },

      // SPORTS
      { name: "Tournaments", categoryIdentity: map["sports"] },
      { name: "Matches", categoryIdentity: map["sports"] },
      { name: "Athletic Meets", categoryIdentity: map["sports"] },
      { name: "Sports Fests", categoryIdentity: map["sports"] },
      { name: "Marathons", categoryIdentity: map["sports"] },
      { name: "E-Sports", categoryIdentity: map["sports"] },
      { name: "Fitness Challenges", categoryIdentity: map["sports"] },
      { name: "Inter-College Competitions", categoryIdentity: map["sports"] },

      // ENTERTAINMENT
      { name: "Concerts", categoryIdentity: map["entertainment"] },
      { name: "Cultural Shows", categoryIdentity: map["entertainment"] },
      { name: "Comedy Nights", categoryIdentity: map["entertainment"] },
      { name: "Dance Competitions", categoryIdentity: map["entertainment"] },
      { name: "Music Festivals", categoryIdentity: map["entertainment"] },
      { name: "Stage Plays", categoryIdentity: map["entertainment"] },
      { name: "Magic Shows", categoryIdentity: map["entertainment"] },

      // EDUCATION
      { name: "Workshops", categoryIdentity: map["education"] },
      { name: "Seminars / Webinars", categoryIdentity: map["education"] },
      { name: "Conferences", categoryIdentity: map["education"] },
      { name: "Training Programs", categoryIdentity: map["education"] },
      { name: "Hackathons", categoryIdentity: map["education"] },
      { name: "Project Expo", categoryIdentity: map["education"] },
      {
        name: "Symposium / Panel Discussions",
        categoryIdentity: map["education"],
      },

      // OTHERS
      { name: "Cultural Events", categoryIdentity: map["others"] },
      { name: "Technical Events", categoryIdentity: map["others"] },
      { name: "Blood Donation Camps", categoryIdentity: map["others"] },
      { name: "Mental Wellness Workshops", categoryIdentity: map["others"] },
      { name: "Painting / Photo Exhibition", categoryIdentity: map["others"] },
      { name: "Prayer Meeting", categoryIdentity: map["others"] },
      { name: "Awareness Campaigns", categoryIdentity: map["others"] },
      { name: "Civic Festivals", categoryIdentity: map["others"] },
      { name: "Food & Drink", categoryIdentity: map["others"] },
    ].filter((d) => d.categoryIdentity);

    await prisma.aceEventTypes.createMany({
      data,
      skipDuplicates: true,
    });

    console.log("Ace event types seeded successfully");
  } catch (err) {
    console.error("Seeding ace_event_types failed", err);
    throw err;
  }
}

module.exports = { seedAceEventTypes };
