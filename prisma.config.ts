// prisma.config.js
// Using CommonJS require syntax for maximum compatibility with Node.js environments.

const { defineConfig } = require("@prisma/config");
const dotenv = require("dotenv");

// Load the environment variables from the .env file immediately
dotenv.config();

module.exports = defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
  // NOTE: If you are moving to CommonJS for seeding, you should update this
  // command to use the plain 'node' runner.
  migrations: {
    seed: "node ./prisma/seed.js",
  },
});