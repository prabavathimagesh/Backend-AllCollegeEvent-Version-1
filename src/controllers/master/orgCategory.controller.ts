import { Request, Response } from "express";
import { OrgCategoryService } from "../../services/master/orgCategory.service";

export class OrgCategoryController {

  // CREATE
  static create = async (req: Request, res: Response) => {
    const { categoryName } = req.body;

    const data = await OrgCategoryService.create(categoryName);

    return res.json({
      status: true,
      data,
      message: "Organization category created successfully",
    });
  };

  // GET ALL
  static getAll = async (_: Request, res: Response) => {
    const data = await OrgCategoryService.getAll();

    return res.json({
      status: true,
      data,
    });
  };

  // GET BY ID
  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const data = await OrgCategoryService.getById(id as string);

    return res.json({
      status: true,
      data,
    });
  };

  // UPDATE
  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    const data = await OrgCategoryService.update(id as string, categoryName);

    return res.json({
      status: true,
      data,
      message: "Organization category updated successfully",
    });
  };

  // DELETE
  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    await OrgCategoryService.delete(id as string);

    return res.json({
      status: true,
      message: "Organization category deleted successfully",
    });
  };
}
