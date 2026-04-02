import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import { Event } from "@/models/event.model";
import { Booking } from "@/models/booking.model";
import { sanitizeString } from "@/lib/sanitize";

/**
 * GET /api/provider/events/[id]
 * Fetch a single event by ID (must belong to the authenticated provider).
 */
export async function GET(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findOne({
            _id: id,
            guide: user.userId,
        }).lean();

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        const bookings = await Booking.find({ event: id, status: { $in: ['confirmed', 'completed'] } }).lean();

        let guests = [];
        bookings.forEach(booking => {
            if (booking.participants && Array.isArray(booking.participants)) {
                booking.participants.forEach(p => {
                    guests.push({
                        id: p._id?.toString() || Math.random().toString(),
                        name: p.name,
                        email: p.email || booking.contactDetails?.email,
                        mobile: p.phone || booking.contactDetails?.phone,
                        age: p.age,
                        gender: p.gender,
                        idProofType: p.idType,
                        idProofNumber: p.idNumber,
                        address: p.address,
                        bookingDate: booking.createdAt,
                        passCode: p.passCode,
                        checkedIn: p.checkedIn || false,
                    });
                });
            }
        });

        return NextResponse.json({
            success: true,
            event: {
                id: event._id.toString(),
                title: event.title,
                eventType: event.eventType,
                location: event.location,
                date: event.date,
                duration: event.duration,
                totalSlots: event.totalSlots,
                bookedSlots: event.bookedSlots,
                pricePerSlot: event.pricePerSlot,
                destination: event.destination,
                destinationLink: event.destinationLink,
                about: event.about,
                highlights: event.highlights,
                whatsIncluded: event.whatsIncluded,
                faqs: event.faqs,
                whatToBring: event.whatToBring,
                restrictions: event.restrictions,
                pickupPoints: event.pickupPoints,
                itinerary: event.itinerary,
                poster: event.poster,
                status: event.status,
                rating: event.rating,
                reviewCount: event.reviewCount,
                deleteRequest: event.deleteRequest || null,
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            },
            guests
        });
    } catch (error) {
        console.error("Get Event Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/provider/events/[id]
 * Update an event (only allowed for draft/upcoming events).
 */
export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findOne({
            _id: id,
            guide: user.userId,
        });

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        // Only drafts can be edited
        if (event.status !== "draft") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only draft events can be edited. Published and past events are locked.",
                },
                { status: 403 }
            );
        }

        const body = await request.json();

        // If publishing a draft
        if (body.action === "publish") {
            event.status = "published";
            await event.save();
            return NextResponse.json({
                success: true,
                message: "Event published successfully!",
                event: { id: event._id, status: event.status },
            });
        }

        // Update allowed fields
        const updatableFields = [
            "title", "eventType", "location", "date", "duration",
            "totalSlots", "pricePerSlot", "destination", "destinationLink",
            "about", "poster",
        ];

        for (const field of updatableFields) {
            if (body[field] !== undefined) {
                if (typeof body[field] === "string") {
                    event[field] = sanitizeString(body[field]);
                } else {
                    event[field] = body[field];
                }
            }
        }

        // Update array fields
        const arrayFields = ["highlights", "whatsIncluded", "whatToBring", "restrictions", "itinerary"];
        for (const field of arrayFields) {
            if (Array.isArray(body[field])) {
                event[field] = body[field]
                    .filter((item) => typeof item === "string" && item.trim())
                    .map(sanitizeString);
            }
        }

        // Update FAQs
        if (Array.isArray(body.faqs)) {
            event.faqs = body.faqs
                .filter((f) => f && f.question?.trim() && f.answer?.trim())
                .map((f) => ({
                    question: sanitizeString(f.question),
                    answer: sanitizeString(f.answer),
                }));
        }

        // Update pickup points
        if (Array.isArray(body.pickupPoints)) {
            event.pickupPoints = body.pickupPoints
                .filter((p) => p && p.location?.trim())
                .map((p) => ({
                    location: sanitizeString(p.location),
                    link: sanitizeString(p.link || ""),
                    time: p.time || "",
                }));
        }

        // Validate date if changed
        if (body.date) {
            const newDate = new Date(body.date);
            if (isNaN(newDate.getTime()) || newDate < new Date()) {
                return NextResponse.json(
                    { success: false, message: "Event date must be a valid future date" },
                    { status: 400 }
                );
            }
            event.date = newDate;
        }

        await event.save();

        return NextResponse.json({
            success: true,
            message: "Event updated successfully!",
            event: { id: event._id, title: event.title, status: event.status },
        });
    } catch (error) {
        console.error("Update Event Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/provider/events/[id]
 * Submit a deletion request — admin must approve before actual deletion.
 */
export async function DELETE(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findOne({
            _id: id,
            guide: user.userId,
        });

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        // Check if a delete request is already pending
        if (event.deleteRequest?.requested && event.deleteRequest?.adminStatus === "pending") {
            return NextResponse.json(
                { success: false, message: "A deletion request for this event is already pending admin review." },
                { status: 409 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const reason = (body.reason || "").trim();

        // Mark the delete request
        event.deleteRequest = {
            requested: true,
            requestedAt: new Date(),
            reason,
            adminStatus: "pending",
            adminNotes: "",
            resolvedAt: null,
        };

        await event.save();

        return NextResponse.json({
            success: true,
            message: "Deletion request submitted successfully. It will be reviewed by the admin.",
        });
    } catch (error) {
        console.error("Delete Request Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
