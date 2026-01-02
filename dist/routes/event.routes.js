"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const event_controller_1 = require("../controllers/event.controller");
const fileUpload_1 = __importDefault(require("../middlewares/fileUpload"));
const validate_1 = require("../utils/validate");
const event_validation_1 = require("../validations/event.validation");
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/organizations/:orgId/events
 * @desc  Get all events of a specific organization
 */
router.get("/organizations/:orgId/events", authMiddleware_1.authMiddleware, (0, validate_1.validate)(event_validation_1.eventValidation.getAll), event_controller_1.EventController.getOrgEvents);
/**
 * @route GET /api/v1/organizations/:orgId/events/:eventId
 * @desc  Get a single event under an organization
 */
router.get("/organizations/:orgId/events/:eventId", authMiddleware_1.authMiddleware, (0, validate_1.validate)(event_validation_1.eventValidation.getSingle), event_controller_1.EventController.getEventById);
/**
 * @route POST /api/v1/organizations/:orgId/events
 * @desc  Create a new event (with image upload)
 */
router.post("/organizations/:orgId/events", fileUpload_1.default.array("bannerImages", 5), event_controller_1.EventController.createEvent);
/**
 * @route PUT /api/v1/organizations/:orgId/events/:eventId
 * @desc  Update an event (with optional image upload)
 */
router.put("/organizations/:orgId/events/:eventId", authMiddleware_1.authMiddleware, (0, validate_1.validate)(event_validation_1.eventValidation.update), fileUpload_1.default.single("image"), event_controller_1.EventController.updateEvent);
/**
 * @route DELETE /api/v1/organizations/:orgId/events/:eventId
 * @desc  Delete an event
 */
router.delete("/organizations/:orgId/events/:eventId", authMiddleware_1.authMiddleware, (0, validate_1.validate)(event_validation_1.eventValidation.deleteEvent), event_controller_1.EventController.deleteEvent);
/* ----------------------- PUBLIC EVENT ROUTES ----------------------- */
/**
 * @route GET /api/v1/events
 * @desc  Get all public events
 */
router.get("/events", event_controller_1.EventController.getAllEvents);
/**
 * @route GET /api/v1/events/:eventId
 * @desc  Get a single public event
 */
router.get("/events/:eventId", (0, validate_1.validate)(event_validation_1.eventValidation.getSinglePublicEvent), event_controller_1.EventController.getSingleEvent);
router.get("/event/statuses", event_controller_1.EventController.getStatuses);
// ---------------------------------- Draft Work
router.post("/events/draft", authMiddleware_1.authMiddleware, event_controller_1.EventController.createDraft);
router.patch("/events/:id", authMiddleware_1.authMiddleware, event_controller_1.EventController.autoSave);
router.post("/events/:id/publish", authMiddleware_1.authMiddleware, event_controller_1.EventController.publishEvent);
exports.default = router;
