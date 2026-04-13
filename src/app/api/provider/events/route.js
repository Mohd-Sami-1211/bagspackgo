import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import { Event } from "@/models/event.model";
import { sanitizeString } from "@/lib/sanitize";

/**
 * POST /api/provider/events
 * Create a new event (must be an approved provider).
 */
export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        // Verify the guide exists and is approved
        const guide = await Guide.findById(user.userId)
            .select("applicationStatus username")
            .lean();

        if (!guide) {
            return NextResponse.json(
                { success: false, message: "Account not found" },
                { status: 404 }
            );
        }

        if (guide.applicationStatus !== "approved") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your application must be approved before hosting events.",
                },
                { status: 403 }
            );
        }

        const body = await request.json();

        // ── Validate required fields ──
        const requiredFields = [
            "title",
            "eventType",
            "location",
            "date",
            "totalSlots",
            "pricePerSlot",
            "destination",
            "about",
        ];

        const missing = requiredFields.filter(
            (f) => !body[f]?.toString().trim()
        );
        if (missing.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Missing required fields: ${missing.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Validate date is in the future
        const eventDate = new Date(body.date);
        if (isNaN(eventDate.getTime())) {
            return NextResponse.json(
                { success: false, message: "Invalid event date" },
                { status: 400 }
            );
        }
        if (eventDate < new Date()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Event date must be in the future",
                },
                { status: 400 }
            );
        }

        // Validate numeric fields
        const totalSlots = parseInt(body.totalSlots);
        const pricePerSlot = parseFloat(body.pricePerSlot);
        const duration = parseInt(body.duration) || 1;

        if (isNaN(totalSlots) || totalSlots < 1) {
            return NextResponse.json(
                { success: false, message: "Total slots must be at least 1" },
                { status: 400 }
            );
        }
        if (isNaN(pricePerSlot) || pricePerSlot < 0) {
            return NextResponse.json(
                { success: false, message: "Price must be a valid number" },
                { status: 400 }
            );
        }

        // Validate highlights (at least 1 non-empty)
        const highlights = (body.highlights || []).filter(
            (h) => typeof h === "string" && h.trim()
        );
        if (highlights.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "At least one highlight is required",
                },
                { status: 400 }
            );
        }

        // Validate whatsIncluded (at least 1 non-empty)
        const whatsIncluded = (body.whatsIncluded || []).filter(
            (w) => typeof w === "string" && w.trim()
        );
        if (whatsIncluded.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "At least one inclusion item is required",
                },
                { status: 400 }
            );
        }

        // Validate FAQs (at least 1 complete FAQ)
        const faqs = (body.faqs || []).filter(
            (f) =>
                f &&
                typeof f.question === "string" &&
                f.question.trim() &&
                typeof f.answer === "string" &&
                f.answer.trim()
        );
        if (faqs.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one FAQ with both question and answer is required",
                },
                { status: 400 }
            );
        }

        // Validate itinerary (at least 1 non-empty step)
        const itinerary = (body.itinerary || []).filter(
            (s) => typeof s === "string" && s.trim()
        );
        if (itinerary.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "At least one itinerary step is required",
                },
                { status: 400 }
            );
        }

        // Validate pickup points (at least 1 with location and time)
        const pickupPoints = (body.pickupPoints || []).filter(
            (p) =>
                p &&
                typeof p.location === "string" &&
                p.location.trim() &&
                typeof p.time === "string" &&
                p.time.trim()
        );
        if (pickupPoints.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one pickup point with location and time is required",
                },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const whatToBring = (body.whatToBring || []).filter(
            (w) => typeof w === "string" && w.trim()
        );
        const restrictions = (body.restrictions || []).filter(
            (r) => typeof r === "string" && r.trim()
        );
        const whatsExcluded = (body.whatsExcluded || []).filter(
            (w) => typeof w === "string" && w.trim()
        );
        const termsAndConditions = (body.termsAndConditions || []).filter(
            (t) => typeof t === "string" && t.trim()
        );

        // Create the event
        const event = await Event.create({
            guide: user.userId,
            title: sanitizeString(body.title),
            eventType: sanitizeString(body.eventType),
            location: sanitizeString(body.location),
            date: eventDate,
            duration,
            totalSlots,
            pricePerSlot,
            destination: sanitizeString(body.destination),
            destinationLink: sanitizeString(body.destinationLink || ""),
            about: sanitizeString(body.about),
            highlights: highlights.map(sanitizeString),
            whatsIncluded: whatsIncluded.map(sanitizeString),
            whatsExcluded: whatsExcluded.map(sanitizeString),
            faqs: faqs.map((f) => ({
                question: sanitizeString(f.question),
                answer: sanitizeString(f.answer),
            })),
            whatToBring: whatToBring.map(sanitizeString),
            restrictions: restrictions.map(sanitizeString),
            pickupPoints: pickupPoints.map((p) => ({
                location: sanitizeString(p.location),
                link: sanitizeString(p.link || ""),
                time: p.time,
            })),
            itinerary: itinerary.map(sanitizeString),
            photographs: body.photographs || [],
            termsAndConditions: termsAndConditions.map(sanitizeString),
            poster: body.poster || "",
            status: body.status === "draft" ? "draft" : "published",
        });

        const statusLabel = event.status === "draft" ? "saved as draft" : "published";

        return NextResponse.json(
            {
                success: true,
                message: `Event ${statusLabel} successfully!`,
                event: {
                    id: event._id,
                    title: event.title,
                    date: event.date,
                    status: event.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Event Error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json(
                { success: false, message: messages.join(". ") },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/provider/events
 * List all events created by the authenticated provider.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const events = await Event.find({ guide: user.userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: events.length,
            events: events.map((e) => ({
                id: e._id,
                title: e.title,
                eventType: e.eventType,
                location: e.location,
                date: e.date,
                duration: e.duration,
                totalSlots: e.totalSlots,
                bookedSlots: e.bookedSlots,
                pricePerSlot: e.pricePerSlot,
                destination: e.destination,
                poster: e.poster,
                status: e.status,
                rating: e.rating,
                about: e.about,
                createdAt: e.createdAt,
            })),
        });
    } catch (error) {
        console.error("List Events Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}
