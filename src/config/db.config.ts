const { PrismaClient } = require("@prisma/client");

// creating a single Prisma client instance to interact with database
const prisma = new PrismaClient();

module.exports = prisma;
