import { Request, Response } from "express";
import { AceAccommodationService } from "../../services/master/aceAccommodation.service";

export class AceAccommodationController {
  static create = async (req: Request, res: Response) =>
    res.json({
      success: true,
      data: await AceAccommodationService.create(req.body.accommodationName),
    });

  static getAll = async (_: Request, res: Response) =>
    res.json({ success: true, data: await AceAccommodationService.getAll() });
}
