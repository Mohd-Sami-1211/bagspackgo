import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

export const dynamic = 'force-dynamic';

/**
 * GET /api/events
 * Public API — returns published events for the user-facing side.
 *
 * Query params:
 *   tab        = 'upcoming' (default) | 'past'
 *   page       = page number (default: 1)
 *   limit      = items per page (default: 12)
 *   location   = destination filter
 *   type       = event type filter
 *   sort       = price_asc | price_desc | date_asc | date_desc | rating
 *   search     = text search across title, destination, eventType, location
 */
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const tab = searchParams.get("tab") || "upcoming"; // 'upcoming' | 'past'
        const location = searchParams.get("location");
        const type = searchParams.get("type");
        const sort = searchParams.get("sort");
        const search = searchParams.get("search");
        const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 12));
        const skip = (page - 1) * limit;

        const now = new Date();

        // ── Build base query ──────────────────────────────────────────────────
        const query = {
            status: "published",
            visibility: { $ne: "private" },
        };

        // Upcoming vs Past
        if (tab === "past") {
            query.date = { $lt: now };
        } else {
            query.date = { $gte: now };
        }

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

        // ── Build sort ────────────────────────────────────────────────────────
        let sortObj = tab === "past" ? { date: -1 } : { date: 1 }; // default: nearest upcoming / most recent past
        if (sort === "price_asc") sortObj = { pricePerSlot: 1 };
        if (sort === "price_desc") sortObj = { pricePerSlot: -1 };
        if (sort === "date_asc") sortObj = { date: 1 };
        if (sort === "date_desc") sortObj = { date: -1 };
        if (sort === "rating") sortObj = { rating: -1 };

        // ── Fetch events — lightweight fields only (detail fields excluded) ───
        // 'about', 'photographs', 'faqs', 'highlights', 'whatsIncluded/Excluded',
        // 'whatToBring', 'restrictions', 'pickupPoints', 'itinerary' are NOT
        // fetched here — they are only loaded on the detail page.
        const eventsList = await Event.find(query)
            .select(
                "title date duration pricePerSlot eventType rating bookedSlots totalSlots " +
                "location destination poster guide destinationLink createdAt status"
            )
            .sort(sortObj)
            .lean();

        // ── Filter out events from paused guides ──────────────────────────────
        const guideIds = [...new Set(eventsList.map((e) => e.guide.toString()))];
        const [guides, guideDetailsList] = await Promise.all([
            Guide.find({ _id: { $in: guideIds } }).select("username email applicationStatus").lean(),
            GuideDetails.find({ guide: { $in: guideIds } }).select("guide companyname logo pausedServices").lean(),
        ]);

        const pausedEventGuides = new Set(
            guideDetailsList
                .filter((gd) => gd.pausedServices?.event === true)
                .map((gd) => gd.guide.toString())
        );

        let finalEvents = eventsList.filter((e) => !pausedEventGuides.has(e.guide.toString()));
        const total = finalEvents.length;
        const totalPages = Math.ceil(total / limit);

        // Apply pagination after paused-guide filtering
        finalEvents = finalEvents.slice(skip, skip + limit);

        // ── Build guide/company name map ──────────────────────────────────────
        const guideMap = {};
        guides.forEach((g) => {
            guideMap[g._id.toString()] = { name: g.username, email: g.email };
        });
        guideDetailsList.forEach((gd) => {
            const id = gd.guide.toString();
            if (guideMap[id]) {
                guideMap[id].companyName = gd.companyname;
                guideMap[id].logo = gd.logo;
            }
        });

        // ── Fetch all organizers for filter panel ─────────────────────────────
        const allCompanies = await GuideDetails.find({ "pausedServices.event": { $ne: true } })
            .populate("guide", "applicationStatus")
            .select("companyname guide")
            .lean();

        const allOrganizers = [
            ...new Set(
                allCompanies
                    .filter((gd) => gd.guide && gd.guide.applicationStatus === "approved")
                    .map((gd) => gd.companyname)
                    .filter(Boolean)
            ),
        ].map((name) => ({ id: name, name }));

        // ── Shape response ────────────────────────────────────────────────────
        const events = finalEvents.map((e) => {
            const guideInfo = guideMap[e.guide.toString()] || {};
            return {
                id: e._id.toString(),
                name: e.title,
                date: e.date,
                duration: `${e.duration} day${e.duration > 1 ? "s" : ""}`,
                price: e.pricePerSlot,
                type: e.eventType,
                rating: e.rating,
                bookings: e.bookedSlots,
                slotsLeft: e.totalSlots - (e.bookedSlots || 0),
                totalSlots: e.totalSlots,
                destinationId: e.location,
                destination: e.destination,
                image: e.poster || null,
                guideName: guideInfo.companyName || guideInfo.name || "Local Guide",
                guideLogo: guideInfo.logo || null,
                guideId: e.guide.toString(),
                destinationLink: e.destinationLink,
                createdAt: e.createdAt,
                isPast: tab === "past",
                _source: "db",
            };
        });

        return NextResponse.json(
            {
                success: true,
                total,
                page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                tab,
                organizers: allOrganizers,
                events,
            },
            {
                headers: {
                    // Edge / CDN can serve stale for up to 30s, then revalidate in background
                    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
                },
            }
        );
    } catch (error) {
        console.error("Public Events Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
