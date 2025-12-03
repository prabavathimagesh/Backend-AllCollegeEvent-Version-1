"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma = require("../config/db.config");
class EventService {
    static async createEventService(data) {
        const event = await prisma.event.create({
            data: {
                org_id: data.org_id1,
                title: data.event_title,
                description: data.description,
                banner_image: data.image, // 🔥 Store the uploaded filename
                event_date: data.event_date,
                event_time: data.event_time,
                mode: data.mode,
                venue_name: data.venue,
            },
        });
        return event;
    }
    static async getAllEventsService() {
        return await prisma.event.findMany({
            orderBy: { created_at: "desc" },
        });
    }
    static async getEventByIdService(id) {
        return await prisma.event.findUnique({
            where: { id },
        });
    }
    static async updateEventService(id, data) {
        return await prisma.event.update({
            where: { id },
            data: {
                title: data.event_title,
                description: data.description,
                banner_image: data.image ?? undefined,
                event_date: data.event_date,
                event_time: data.event_time,
                mode: data.mode,
                venue_name: data.venue,
            },
        });
    }
    static async deleteEventService(id) {
        return await prisma.event.delete({
            where: { id },
        });
    }
}
exports.EventService = EventService;
