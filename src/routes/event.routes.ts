import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import upload from "../middlewares/fileUpload";

const router = Router();

router.post("/create", upload.single("image") ,EventController.createEvent);
router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getEventById);
router.put("/:id", upload.single("image"), EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);

module.exports = router;
