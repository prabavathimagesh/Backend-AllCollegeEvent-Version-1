import { Request, Response } from "express";
import { AcePerkService } from "../../services/master/acePerk.service";

export class AcePerkController {
  static create = async (req: Request, res: Response) =>
    res.json({ status: true, data: await AcePerkService.create(req.body.perkName) });

  static getAll = async (_: Request, res: Response) =>
    res.json({ status: true, data: await AcePerkService.getAll() });

  static getOne = async (req: Request, res: Response) =>
    res.json({ status: true, data: await AcePerkService.getById(req.params.id) });

  static update = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await AcePerkService.update(req.params.id, req.body.perkName),
    });

  static delete = async (req: Request, res: Response) => {
    await AcePerkService.delete(req.params.id);
    res.json({ status: true });
  };
}
