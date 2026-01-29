import { Request, Response } from "express";
import { AceAccommodationService } from "../../services/master/aceAccommodation.service";

export class AceAccommodationController {
  // CREATE
  static create = async (req: Request, res: Response) => {
    const { accommodationName } = req.body;

    const data = await AceAccommodationService.create(accommodationName);

    return res.json({
      status: true,
      data,
      message: "Accommodation created successfully",
    });
  };

  // GET ALL
  static getAll = async (_: Request, res: Response) => {
    const data = await AceAccommodationService.getAll();

    return res.json({
      status: true,
      data,
    });
  };

  // GET BY ID
  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const data = await AceAccommodationService.getById(id as string);

    return res.json({
      status: true,
      data,
    });
  };

  // UPDATE
  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { accommodationName } = req.body;

    const data = await AceAccommodationService.update(id as string, accommodationName);

    return res.json({
      status: true,
      data,
      message: "Accommodation updated successfully",
    });
  };

  // DELETE
  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    await AceAccommodationService.delete(id as string);

    return res.json({
      status: true,
      message: "Accommodation deleted successfully",
    });
  };
}
