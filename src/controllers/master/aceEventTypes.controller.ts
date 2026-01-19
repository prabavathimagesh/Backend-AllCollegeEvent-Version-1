import { Request, Response } from "express";
import { AceEventTypesService } from "../../services/master/aceEventTypes.service";

export class AceEventTypesController {
  static create = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await AceEventTypesService.create(
        req.body.name,
        req.body.categoryIdentity,
      ),
    });

  static getByCategory = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await AceEventTypesService.getByCategory(
        req.params.categoryId as string,
      ),
    });

  static async getAll(req: Request, res: Response) {
    try {
      const data = await AceEventTypesService.getAll();

      return res.status(200).json({
        status: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to fetch event types",
        error: error.message,
      });
    }
  }
}
