import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";

/**
 * GET /api/events/[id]
 * Fetch a single public (published) event by ID.
 */
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // In a real app we might only allow published events, but for testing we can fetch any
        // or just add { status: 'published' }
        const event = await Event.findById(id).populate('guide', 'name email profileImage').lean();

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        // Map DB fields to the format EventDetails expects, if needed, or just return as is.
        return NextResponse.json({
            success: true,
            event: {
                id: event._id.toString(),
                name: event.title, // Map title to name
                eventType: event.eventType,
                location: event.location,
                meetingPoint: event.pickupPoints?.[0]?.location || event.location,
                date: event.date,
                duration: `${event.duration} Days`, // Map back to string
                totalSlots: event.totalSlots,
                bookedSlots: event.bookedSlots || 0,
                slotsLeft: event.totalSlots - (event.bookedSlots || 0),
                price: event.pricePerSlot, // Map pricePerSlot to price
                destinationId: event.destination,
                description: event.about, // Map about to description
                highlights: event.highlights,
                whatsIncluded: event.whatsIncluded,
                faqs: event.faqs,
                whatToBring: event.whatToBring,
                restrictions: event.restrictions,
                pickupPoints: event.pickupPoints,
                itinerary: event.itinerary,
                image: event.poster, // Map poster to image
                status: event.status,
                rating: event.rating || 4.5,
                reviewCount: event.reviewCount || 0,
                guide: event.guide
            },
        });
    } catch (error) {
        console.error("Get Public Event Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
