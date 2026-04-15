import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

export const dynamic = 'force-dynamic';

/**
 * GET /api/events
 * Public API — returns all published events for the user-facing side.
 * Supports query params: ?location=&type=&sort=&page=&limit=
 */
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location");
        const type = searchParams.get("type");
        const sort = searchParams.get("sort");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 50;

        // Build query — only published events with future dates
        const query = {
            status: "published",
            date: { $gte: new Date() },
        };

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        if (type) {
            query.eventType = { $regex: type, $options: "i" };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { destination: { $regex: search, $options: "i" } },
                { eventType: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        // Build sort
        let sortObj = { date: 1 }; // default: nearest date first
        if (sort === "price_asc") sortObj = { pricePerSlot: 1 };
        if (sort === "price_desc") sortObj = { pricePerSlot: -1 };
        if (sort === "date_asc") sortObj = { date: 1 };
        if (sort === "date_desc") sortObj = { date: -1 };
        if (sort === "rating") sortObj = { rating: -1 };

        const skip = (page - 1) * limit;

        // Select only needed fields — exclude large text/binary fields like 'about' and 'photographs' for the list view
        const eventsList = await Event.find(query)
            .select('title date duration pricePerSlot eventType rating bookedSlots totalSlots location destination poster guide highlights whatsIncluded whatsExcluded faqs whatToBring restrictions pickupPoints itinerary destinationLink createdAt status')
            .sort(sortObj)
            .lean();

        // Fetch guide info and details concurrently
        const guideIds = [...new Set(eventsList.map((e) => e.guide.toString()))];
        const [guides, guideDetailsList] = await Promise.all([
            Guide.find({ _id: { $in: guideIds } }).select("username email").lean(),
            GuideDetails.find({ guide: { $in: guideIds } }).select("guide companyname pausedServices").lean(),
        ]);

        // 🛑 Filter out paused events
        const pausedEventGuides = new Set(
            guideDetailsList
                .filter(gd => gd.pausedServices?.event === true)
                .map(gd => gd.guide.toString())
        );

        let finalEvents = eventsList.filter(e => !pausedEventGuides.has(e.guide.toString()));
        const finalTotal = finalEvents.length;

        // Apply pagination after filtering
        finalEvents = finalEvents.slice(skip, skip + limit);



        const guideMap = {};
        guides.forEach((g) => {
            guideMap[g._id.toString()] = {
                name: g.username,
                email: g.email,
            };
        });
        guideDetailsList.forEach((gd) => {
            const id = gd.guide.toString();
            if (guideMap[id]) {
                guideMap[id].companyName = gd.companyname;
            }
        });

        // Derive organizers from already-fetched guideDetailsList instead of a separate DB query
        const allOrganizers = [...new Set(
            guideDetailsList
                .filter(gd => !gd.pausedServices?.event && gd.companyname)
                .map(gd => gd.companyname)
        )].map(name => ({ id: name, name }));

        return NextResponse.json({
            success: true,
            total: finalTotal,
            page,
            totalPages: Math.ceil(finalTotal / limit),
            organizers: allOrganizers,
            events: finalEvents.map((e) => {
                const guideInfo = guideMap[e.guide.toString()] || {};
                return {
                    // Map to the same shape the frontend EventCard expects
                    id: e._id.toString(),
                    name: e.title,
                    date: e.date,
                    duration: `${e.duration} day${e.duration > 1 ? "s" : ""}`,
                    price: e.pricePerSlot,
                    type: e.eventType,
                    rating: e.rating,
                    bookings: e.bookedSlots,
                    slotsLeft: e.totalSlots - e.bookedSlots,
                    totalSlots: e.totalSlots,
                    destinationId: e.location,
                    destination: e.destination,
                    image: e.poster || null,
                    guideName: guideInfo.companyName || guideInfo.name || "Local Guide",
                    about: e.about,
                    highlights: e.highlights,
                    whatsIncluded: e.whatsIncluded,
                    whatsExcluded: e.whatsExcluded,
                    faqs: e.faqs,
                    whatToBring: e.whatToBring,
                    restrictions: e.restrictions,
                    pickupPoints: e.pickupPoints,
                    itinerary: e.itinerary,
                    destinationLink: e.destinationLink,
                    createdAt: e.createdAt,
                    // Source flag so the frontend knows this is from DB
                    _source: "db",
                };
            }),
        });
    } catch (error) {
        console.error("Public Events Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}
