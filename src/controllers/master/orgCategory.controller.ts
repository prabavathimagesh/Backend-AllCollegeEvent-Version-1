import { Request, Response } from "express";
import { OrgCategoryService } from "../../services/master/orgCategory.service";

export class OrgCategoryController {
  static create = async (req: Request, res: Response) =>
    res.json({
      status: true,
      data: await OrgCategoryService.create(req.body.categoryName),
    });

  static getAll = async (_: Request, res: Response) =>
    res.json({ status: true, data: await OrgCategoryService.getAll() });
}
