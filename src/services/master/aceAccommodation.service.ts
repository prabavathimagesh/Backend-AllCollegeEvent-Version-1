const prisma = require("../../config/db.config");

export class AceAccommodationService {
  static create(accommodationName: string) {
    return prisma.aceAccommodation.create({ data: { accommodationName } });
  }

  static getAll() {
    return prisma.aceAccommodation.findMany();
  }
}
