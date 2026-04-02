import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "bagspackgo_dev_admin_secret";

/**
 * GET /api/admin/events
 * List all events with pending delete requests.
 *
 * Usage (browser console):
 *   fetch('/api/admin/events', { headers: { 'x-admin-secret': 'your_secret' } }).then(r => r.json()).then(console.log)
 */
export async function GET(request) {
    try {
        const reqSecret = request.headers.get("x-admin-secret");
        if (reqSecret !== ADMIN_SECRET) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Find events with pending delete requests
        const events = await Event.find({
            "deleteRequest.requested": true,
        })
            .populate("guide", "username email")
            .select("title eventType location date status deleteRequest createdAt")
            .sort({ "deleteRequest.requestedAt": -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: events.length,
            deleteRequests: events.map((e) => ({
                eventId: e._id,
                title: e.title,
                eventType: e.eventType,
                location: e.location,
                date: e.date,
                status: e.status,
                provider: e.guide,
                deleteRequest: e.deleteRequest,
                createdAt: e.createdAt,
            })),
        });
    } catch (error) {
        console.error("Admin Events List Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/events
 * Approve or reject a provider's event delete request.
 *
 * Usage (browser console):
 *   fetch('/api/admin/events', {
 *     method: 'PATCH',
 *     headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'your_secret' },
 *     body: JSON.stringify({ eventId: '<id>', action: 'approve', adminNotes: 'OK to delete' })
 *   }).then(r => r.json()).then(console.log)
 */
export async function PATCH(request) {
    try {
        const reqSecret = request.headers.get("x-admin-secret");
        if (reqSecret !== ADMIN_SECRET) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { eventId, action, adminNotes } = body;

        if (!eventId) {
            return NextResponse.json(
                { success: false, message: "eventId is required" },
                { status: 400 }
            );
        }

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { success: false, message: "action must be 'approve' or 'reject'" },
                { status: 400 }
            );
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        if (!event.deleteRequest?.requested) {
            return NextResponse.json(
                { success: false, message: "No delete request found for this event" },
                { status: 400 }
            );
        }

        if (action === "approve") {
            // Actually delete the event
            await Event.findByIdAndDelete(eventId);
            return NextResponse.json({
                success: true,
                message: `Event "${event.title}" has been deleted.`,
            });
        } else {
            // Reject — clear the request
            event.deleteRequest.adminStatus = "rejected";
            event.deleteRequest.adminNotes = adminNotes || "";
            event.deleteRequest.resolvedAt = new Date();
            await event.save();
            return NextResponse.json({
                success: true,
                message: `Deletion request for "${event.title}" has been rejected.`,
                event: { id: event._id, title: event.title, deleteRequest: event.deleteRequest },
            });
        }
    } catch (error) {
        console.error("Admin Event Delete Review Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
