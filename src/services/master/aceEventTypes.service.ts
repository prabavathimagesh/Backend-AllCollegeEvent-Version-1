const prisma = require("../../config/db.config");

export class AceEventTypesService {
  static create(name: string, categoryIdentity: string, imageUrl?: string | null, color?: string) {
    console.log(color);
    
    return prisma.aceEventTypes.create({
      data: {
        name,
        categoryIdentity,
        imageUrl, // store S3 URL
        color
      },
    });
  }

  static getByCategory(categoryIdentity: string) {
    return prisma.aceEventTypes.findMany({
      where: { categoryIdentity }, //correct field name
    });
  }

  static getAll() {
    return prisma.aceEventTypes.findMany({
      orderBy: { name: "asc" },
    });
  }

  //Get single event type by id
  static getById(id: string) {
    return prisma.aceEventTypes.findUnique({
      where: { identity: id }, // change if PK is id
    });
  }

  // Update event type
  static update(
    id: string,
    payload: {
      name?: string;
      categoryIdentity?: string;
      color?: string;
      imageUrl?: string;
    }
  ) {
    const data: any = {};

    if (payload.name) data.name = payload.name;
    if (payload.categoryIdentity) data.categoryIdentity = payload.categoryIdentity;
    if (payload.color) data.color = payload.color;
    if (payload.imageUrl) data.imageUrl = payload.imageUrl;

    return prisma.aceEventTypes.update({
      where: { identity: id },
      data,
    });
  }

  // Delete event type
  static delete(id: string) {
    return prisma.aceEventTypes.delete({
      where: { identity: id },
    });
  }
}
