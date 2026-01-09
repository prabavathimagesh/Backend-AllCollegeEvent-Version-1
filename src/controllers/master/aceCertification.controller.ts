import { Request, Response } from "express";
import { AceCertificationService } from "../../services/master/aceCertification.service";

export class AceCertificationController {
  static create = async (req: Request, res: Response) =>
    res.json({ status: true, data: await AceCertificationService.create(req.body.certName) });

  static getAll = async (_: Request, res: Response) =>
    res.json({ status: true, data: await AceCertificationService.getAll() });

  static update = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await AceCertificationService.update(req.params.id, req.body.certName),
    });

  static delete = async (req: Request, res: Response) => {
    await AceCertificationService.delete(req.params.id);
    res.json({ status: true });
  };
}
