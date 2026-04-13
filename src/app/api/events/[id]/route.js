import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";
import { GuideDetails } from "@/models/guidedetails.model";
import mongoose from "mongoose";

/**
 * GET /api/events/[id]
 * Fetch a single public (published) event by ID.
 */
export async function GET(request, context) {
    const params = await context.params;
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid Event ID format" },
                { status: 404 }
            );
        }

        const event = await Event.findById(id).populate('guide', 'name username email profileImage').lean();

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        let guideName = event.guide?.companyName || event.guide?.username || event.guide?.name || "Local Guide";
        if (event.guide && event.guide._id) {
            const gd = await GuideDetails.findOne({ guide: event.guide._id }).select('companyname').lean();
            if (gd && gd.companyname) {
                guideName = gd.companyname;
            }
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
                about: event.about,
                highlights: event.highlights,
                whatsIncluded: event.whatsIncluded,
                whatsExcluded: event.whatsExcluded,
                faqs: event.faqs,
                whatToBring: event.whatToBring,
                restrictions: event.restrictions,
                pickupPoints: event.pickupPoints,
                itinerary: event.itinerary,
                image: event.poster, // Map poster to image
                status: event.status,
                rating: event.rating,
                reviewCount: event.reviewCount || 0,
                guide: event.guide,
                guideName: guideName,
                photographs: event.photographs || [],
                termsAndConditions: event.termsAndConditions || [],
                destinationLink: event.destinationLink,
                createdAt: event.createdAt
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
