"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const fileUpload_1 = __importDefault(require("../middlewares/fileUpload"));
const router = (0, express_1.Router)();
router.post("/create", fileUpload_1.default.single("image"), event_controller_1.EventController.createEvent);
router.get("/", event_controller_1.EventController.getAllEvents);
router.get("/:id", event_controller_1.EventController.getEventById);
router.put("/:id", fileUpload_1.default.single("image"), event_controller_1.EventController.updateEvent);
router.delete("/:id", event_controller_1.EventController.deleteEvent);
module.exports = router;
