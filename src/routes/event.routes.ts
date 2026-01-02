import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { EventController } from "../controllers/event.controller";
import upload from "../middlewares/fileUpload";
import { validate } from "../utils/validate";
import { eventValidation } from "../validations/event.validation";

const router = Router();

/**
 * @route GET /api/v1/organizations/:orgId/events
 * @desc  Get all events of a specific organization
 */
router.get(
  "/organizations/:orgId/events",
  authMiddleware,
  validate(eventValidation.getAll),
  EventController.getOrgEvents
);

/**
 * @route GET /api/v1/organizations/:orgId/events/:eventId
 * @desc  Get a single event under an organization
 */
router.get(
  "/organizations/:orgId/events/:eventId",
  authMiddleware,
  validate(eventValidation.getSingle),
  EventController.getEventById
);

/**
 * @route POST /api/v1/organizations/:orgId/events
 * @desc  Create a new event (with image upload)
 */
router.post(
  "/organizations/:orgId/events",
  upload.array("bannerImages",5),
  EventController.createEvent
);

/**
 * @route PUT /api/v1/organizations/:orgId/events/:eventId
 * @desc  Update an event (with optional image upload)
 */
router.put(
  "/organizations/:orgId/events/:eventId",
  authMiddleware,
  validate(eventValidation.update),
  upload.single("image"),
  EventController.updateEvent
);

/**
 * @route DELETE /api/v1/organizations/:orgId/events/:eventId
 * @desc  Delete an event
 */
router.delete(
  "/organizations/:orgId/events/:eventId",
  authMiddleware,
  validate(eventValidation.deleteEvent),
  EventController.deleteEvent
);

/* ----------------------- PUBLIC EVENT ROUTES ----------------------- */

/**
 * @route GET /api/v1/events
 * @desc  Get all public events
 */
router.get("/events", EventController.getAllEvents);

/**
 * @route GET /api/v1/events/:eventId
 * @desc  Get a single public event
 */
router.get(
  "/events/:eventId",
  validate(eventValidation.getSinglePublicEvent),
  EventController.getSingleEvent
);

router.get("/event/statuses", EventController.getStatuses);


// ---------------------------------- Draft Work

router.post("/events/draft", authMiddleware,EventController.createDraft);
router.patch("/events/:id", authMiddleware,EventController.autoSave);
router.post("/events/:id/publish", authMiddleware,EventController.publishEvent);

export default router;
