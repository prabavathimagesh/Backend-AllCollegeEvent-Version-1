import { Request, Response } from "express";
import { AceEventTypesService } from "../../services/master/aceEventTypes.service";
import { uploadToS3 } from "../../utils/s3Upload";

export class AceEventTypesController {
  static create = async (req: Request, res: Response) => {
    try {
      const { name, categoryIdentity, color } = req.body;

      let imageUrl: string | null = null;

      // if image exists, upload to S3
      if (req.file) {
        const uploaded = await uploadToS3(req.file, "categories"); // folder name
        imageUrl = uploaded.url;
      }
      console.log(color);

      const data = await AceEventTypesService.create(
        name,
        categoryIdentity,
        imageUrl,
        color
      );

      return res.json({
        status: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: "Failed to create event type",
        error: error.message,
      });
    }
  };


  static getByCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    console.log(categoryId);

    res.json({
      status: true,
      data: await AceEventTypesService.getByCategory(
        categoryId as string
      ),
    });
  }

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

  // Get single event type
  static getOne = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await AceEventTypesService.getById(id as string);

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Event type not found",
      });
    }

    return res.json({ status: true, data });
  };

  // Update event type
  static update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, categoryIdentity, color } = req.body;

      let imageUrl: string | undefined;

      // optional image upload
      if (req.file) {
        const uploaded = await uploadToS3(req.file, "categories");
        imageUrl = uploaded.url;
      }

      const data = await AceEventTypesService.update(id as string, {
        name,
        categoryIdentity,
        color,
        imageUrl,
      });

      return res.json({
        status: true,
        data,
        message: "Event type updated successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        status: false,
        message: "Update failed",
        error: error.message,
      });
    }
  };

  // Delete event type
  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    await AceEventTypesService.delete(id as string);

    return res.json({
      status: true,
      message: "Event type deleted successfully",
    });
  };
}
