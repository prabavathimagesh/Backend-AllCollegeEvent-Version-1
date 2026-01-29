const prisma = require("../../config/db.config");

export class AceAccommodationService {

  // CREATE
  static create(accommodationName: string) {
    return prisma.aceAccommodation.create({
      data: { accommodationName },
    });
  }

  // GET ALL
  static getAll() {
    return prisma.aceAccommodation.findMany({
      orderBy: { accommodationName: "asc" },
    });
  }

  // GET BY ID
  static getById(id: string) {
    return prisma.aceAccommodation.findUnique({
      where: { identity: id },
    });
  }

  // UPDATE (optional fields)
  static update(id: string, accommodationName?: string) {
    return prisma.aceAccommodation.update({
      where: { identity: id },
      data: {
        ...(accommodationName && { accommodationName }),
      },
    });
  }

  // DELETE
  static delete(id: string) {
    return prisma.aceAccommodation.delete({
      where: { identity: id },
    });
  }
}
