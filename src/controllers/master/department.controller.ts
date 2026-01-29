import { Request, Response } from "express";
import DepartmentService from "../../services/master/department.service";

class DepartmentController {

  /* ================= DEPARTMENTS ================= */

  static async createDepartment(req: Request, res: Response) {
    try {
      const { name } = req.body;

      const data = await DepartmentService.createDepartment(name);

      return res.status(201).json({
        status: true,
        message: "Department created successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

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

  static async getDepartmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await DepartmentService.getDepartmentById(id as string);

      return res.status(200).json({
        status: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  static async updateDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const data = await DepartmentService.updateDepartment(id as string, name);

      return res.status(200).json({
        status: true,
        message: "Department updated successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  static async deleteDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await DepartmentService.deleteDepartment(id as string);

      return res.status(200).json({
        status: true,
        message: "Department deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  /* ================= ELIGIBLE DEPARTMENTS ================= */

  static async createEligibleDepartment(req: Request, res: Response) {
    try {
      const { name } = req.body;

      const data = await DepartmentService.createEligibleDepartment(name);

      return res.status(201).json({
        status: true,
        message: "Eligible department created successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

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

  static async getEligibleDepartmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = await DepartmentService.getEligibleDepartmentById(id as string);

      return res.status(200).json({
        status: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  static async updateEligibleDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const data = await DepartmentService.updateEligibleDepartment(id as string, name);

      return res.status(200).json({
        status: true,
        message: "Eligible department updated successfully",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  static async deleteEligibleDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await DepartmentService.deleteEligibleDepartment(id as string);

      return res.status(200).json({
        status: true,
        message: "Eligible department deleted successfully",
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
