import { Router } from "express";
import { AdminEventController } from "../../controllers/admin/admin.event.controller";
import upload from "../../middlewares/fileUpload";
import { validate } from "../../utils/validate";
import { eventValidation } from "../../validations/event.validation";
import { authMiddleware } from "../../middlewares/authMiddleware";

// Initialize router
const router = Router();

/**
 * ADMIN EVENT ROUTES
 * Handles event management by admin
 */

// Get all events in the system
router.get(
  "/events",
  authMiddleware,
  AdminEventController.getAllEvents
);

// Get all events of a specific organization
router.get(
  "/organizations/:orgId/events",
  authMiddleware,
  validate(eventValidation.getAll1),
  AdminEventController.getEventsByOrg
);

// Get single event by organization and event ID
router.get(
  "/organizations/:orgId/events/:eventId",
  authMiddleware,
  validate(eventValidation.getSingle),
  AdminEventController.getEventById
);

// Create a new event under an organization
router.post(
  "/organizations/:orgId/events",
  authMiddleware,
  validate(eventValidation.create),
  upload.single("image"),
  AdminEventController.createEvent
);

// Update an existing event
router.put(
  "/organizations/:orgId/events/:eventId",
  authMiddleware,
  validate(eventValidation.update),
  upload.single("image"),
  AdminEventController.updateEvent
);

// Delete an event
router.delete(
  "/organizations/:orgId/events/:eventId",
  authMiddleware,
  validate(eventValidation.deleteEvent),
  AdminEventController.deleteEvent
);

// Update event approval/status
router.put(
  "/event/:eventId/status",
  authMiddleware,
  AdminEventController.updateEventStatus
);

// Export router
export default router;
