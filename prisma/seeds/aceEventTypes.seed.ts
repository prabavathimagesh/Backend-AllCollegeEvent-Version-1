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

    const COLORS = ["#E7F7FF", "#FDF1DC", "#FFD7D7", "#EDDAFF"];

    function shuffle<T>(array: T[]): T[] {
      return [...array].sort(() => Math.random() - 0.5);
    }

    const shuffledColors = shuffle(COLORS);

    const data = [
      // NETWORKING
      { name: "Meetups", categoryIdentity: map["networking"] },
      { name: "Job Fairs", categoryIdentity: map["networking"] },
      { name: "Startup Events", categoryIdentity: map["networking"] },
      { name: "Alumni Meets", categoryIdentity: map["networking"] },
      { name: "Expo & Tradeshows", categoryIdentity: map["networking"] },
      { name: "Explore More", categoryIdentity: map["networking"] }

      // SPORTS
      { name: "Tournaments", categoryIdentity: map["sports"] },
      { name: "Athletic Meets", categoryIdentity: map["sports"] },
      { name: "Marathons", categoryIdentity: map["sports"] },
      { name: "Fitness Challenges", categoryIdentity: map["sports"] },

      // ENTERTAINMENT
      { name: "Concerts", categoryIdentity: map["entertainment"] },
      { name: "Cultural Events", categoryIdentity: map["entertainment"] },
      { name: "Comedy Shows", categoryIdentity: map["entertainment"] },
      { name: "Music Festivals", categoryIdentity: map["entertainment"] },
      { name: "Stage Plays", categoryIdentity: map["entertainment"] },
      { name: "Magic Shows", categoryIdentity: map["entertainment"] },
      { name: "Guest Lectures", categoryIdentity: map["entertainment"] },
      { name: "Fashion Show", categoryIdentity: map["entertainment"] },
      { name: "Dance Competition", categoryIdentity: map["entertainment"] },

      // EDUCATION
      { name: "Workshops", categoryIdentity: map["education"] },
      { name: "Seminars", categoryIdentity: map["education"] },
      { name: "Webinars", categoryIdentity: map["education"] },
      { name: "Conferences", categoryIdentity: map["education"] },
      { name: "Training Programs", categoryIdentity: map["education"] },
      { name: "Hackathons", categoryIdentity: map["education"] }, 
      { name: "Art Gallery", categoryIdentity: map["education"] },
      { name: "Video Games", categoryIdentity: map["education"] },
      {
        name: "Symposium",
        categoryIdentity: map["education"],
      },

      // OTHERS
      { name: "Technical Events", categoryIdentity: map["others"] },
      { name: "Blood Donation Camps", categoryIdentity: map["others"] },
      { name: "Mental Wellness", categoryIdentity: map["others"] },
      { name: "Painting", categoryIdentity: map["others"] },
      { name: "Prayer Meeting", categoryIdentity: map["others"] },
      { name: "Awareness Program", categoryIdentity: map["others"] },
      { name: "Civic Festivals", categoryIdentity: map["others"] },
      { name: "Food Festival", categoryIdentity: map["others"] },
    ]
      .filter((d) => d.categoryIdentity)
      .map((item, index) => ({
        ...item,
        color: shuffledColors[index % shuffledColors.length],
      }));

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