const prisma = require("../../config/db.config");

export class AceCertificationService {
  static create(certName: string) {
    return prisma.aceCertification.create({ data: { certName } });
  }

  static getAll() {
    return prisma.aceCertification.findMany();
  }

  static update(identity: string, certName: string) {
    return prisma.aceCertification.update({
      where: { identity },
      data: { certName },
    });
  }

  static delete(identity: string) {
    return prisma.aceCertification.delete({ where: { identity } });
  }
}
