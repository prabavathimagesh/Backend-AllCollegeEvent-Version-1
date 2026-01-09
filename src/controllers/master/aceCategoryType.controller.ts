import { Request, Response } from "express";
import { AceCategoryTypeService } from "../../services/master/aceCategoryType.service";

export class AceCategoryTypeController {
  static create = async (req: Request, res: Response) =>
    res.json({ status: true, data: await AceCategoryTypeService.create(req.body.categoryName) });

  static getAll = async (_: Request, res: Response) =>
    res.json({ status: true, data: await AceCategoryTypeService.getAll() });
}
