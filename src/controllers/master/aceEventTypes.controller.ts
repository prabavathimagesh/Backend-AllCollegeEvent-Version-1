import { Request, Response } from "express";
import { AceEventTypesService } from "../../services/master/aceEventTypes.service";

export class AceEventTypesController {
  static create = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await AceEventTypesService.create(req.body.name, req.body.categoryIdentity),
    });

  static getByCategory = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await AceEventTypesService.getByCategory(req.params.categoryId as string),
    });
}
