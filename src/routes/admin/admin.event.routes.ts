import { Router } from "express";
import { AdminEventController } from "../../controllers/admin/admin.event.controller";
import upload from "../../middlewares/fileUpload";
import { validate } from "../../utils/validate";
import { eventValidation } from "../../validations/event.validation";

const router = Router();

router.get("/events", AdminEventController.getAllEvents);
router.get(
  "/organizations/:orgId/events",
  validate(eventValidation.getAll),
  AdminEventController.getEventsByOrg
);
router.get(
  "/organizations/:orgId/events/:eventId",
  validate(eventValidation.getSingle),
  AdminEventController.getEventById
);
router.post(
  "/organizations/:orgId/events",
  validate(eventValidation.create),
  upload.single("image"),
  AdminEventController.createEvent
);
router.put(
  "/organizations/:orgId/events/:eventId",
   validate(eventValidation.update),
  upload.single("image"),
  AdminEventController.updateEvent
);
router.delete(
  "/organizations/:orgId/events/:eventId",
  validate(eventValidation.deleteEvent),
  AdminEventController.deleteEvent
);

export default router;
