import { Request, Response } from "express";
import { AceCategoryTypeService } from "../../services/master/aceCategoryType.service";

export class AceCategoryTypeController {
  static create = async (req: Request, res: Response) => {
    const { categoryName } = req.body;
    const data = await AceCategoryTypeService.create(categoryName);
    return res.json({ status: true, data });
  };

  static getAll = async (_: Request, res: Response) => {
    const data = await AceCategoryTypeService.getAll();
    return res.json({ status: true, data });
  };

  static getOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await AceCategoryTypeService.getById(id as string);

    if (!data) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    return res.json({ status: true, data });
  };

  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    const data = await AceCategoryTypeService.update(id as string, categoryName);
    return res.json({ status: true, data });
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    await AceCategoryTypeService.delete(id as string);
    return res.json({ status: true, message: "Category deleted successfully" });
  };
}
