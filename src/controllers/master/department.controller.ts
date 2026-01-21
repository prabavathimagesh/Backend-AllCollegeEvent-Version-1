import { Request, Response } from "express";
import DepartmentService from "../../services/master/department.service";

class DepartmentController {
  // GET /departments
  static async getDepartments(req: Request, res: Response) {
    try {
      const data = await DepartmentService.getAllDepartments();
      return res.status(200).json({
        status: true,
        message: "Departments fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  // GET /eligible-departments
  static async getEligibleDepartments(req: Request, res: Response) {
    try {
      const data = await DepartmentService.getAllEligibleDepartments();
      return res.status(200).json({
        status: true,
        message: "Eligible departments fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default DepartmentController;
