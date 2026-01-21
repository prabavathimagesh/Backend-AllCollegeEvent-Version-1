const prisma = require("../../src/config/db.config.ts");

async function seedAceEligibleDepartment() {
  try {
    await prisma.aceEligibleDepartment.createMany({
      data: [
        { name: "Engineering & Technology" },
        { name: "Computer Science & Information Technology" },
        { name: "Software Engineering" },
        { name: "Artificial Intelligence & Data Science" },
        { name: "Data Analytics & Business Intelligence" },
        { name: "Cyber Security & Information Security" },
        { name: "Electronics & Electrical Engineering" },
        { name: "Mechanical Engineering" },
        { name: "Civil & Infrastructure Engineering" },
        { name: "Robotics, Automation & IoT" },
        { name: "Manufacturing & Industrial Engineering" },
        { name: "Science & Applied Sciences" },
        { name: "Physics, Chemistry & Mathematics" },
        { name: "Life Sciences & Biotechnology" },
        { name: "Environmental Science & Sustainability" },
        { name: "Materials Science & Nanotechnology" },
        { name: "Research & Development (R&D)" },
        { name: "Healthcare & Medical Sciences" },
        { name: "Public Health & Allied Health Sciences" },
        { name: "Sports Science & Physical Education" },
        { name: "Fitness, Wellness & Mental Health" },
        { name: "Management & Business Administration" },
        { name: "Finance, Accounting & Economics" },
        { name: "Banking, Insurance & Financial Services" },
        { name: "Human Resource Management" },
        { name: "Marketing, Sales & Growth" },
        { name: "Digital Marketing & E-Commerce" },
        { name: "Operations & Process Management" },
        { name: "Supply Chain, Logistics & Procurement" },
        { name: "Product Management & Strategy" },
        { name: "Entrepreneurship & Innovation" },
        { name: "Startup & Incubation" },
        { name: "Quality Assurance & Compliance" },
        { name: "Risk Management & Governance" },
        { name: "Law & Legal Studies" },
        { name: "Corporate Law & Compliance" },
        { name: "Public Administration & Governance" },
        { name: "Policy, Economics & Development Studies" },
        { name: "Media, Journalism & Mass Communication" },
        { name: "Visual Communication & Graphic Design" },
        { name: "UI / UX, Animation & Multimedia" },
        { name: "Film, Television & Performing Arts" },
        { name: "Arts, Humanities & Cultural Studies" },
        { name: "Education, Training & Skill Development" },
        { name: "Corporate Services & Administration" },
        { name: "Facilities, Operations & Infrastructure Support" },
        { name: "Customer Experience & Support" },
        { name: "Sales Operations & Business Development" },
        { name: "IT Support & Systems Administration" },
        { name: "General / Open to All Departments" },
      ],
      skipDuplicates: true,
    });

    console.log("Ace eligible departments seeded successfully.");
  } catch (error) {
    console.error("Error seeding ace eligible departments:", error);
    throw error;
  }
}

module.exports = { seedAceEligibleDepartment };
