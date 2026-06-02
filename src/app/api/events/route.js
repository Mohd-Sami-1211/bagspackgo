import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";

export const dynamic = "force-dynamic";

// GET /api/events
// Query params: ?search=&destination=&type=&organizer=&sort=&dateFilter=&dateStart=&dateEnd=&page=&limit=
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        const page  = Math.max(1, parseInt(searchParams.get("page"))  || 1);
        const limit = Math.min(50, parseInt(searchParams.get("limit")) || 20);
        const skip  = (page - 1) * limit;

        const search      = searchParams.get("search")?.trim()      || null;
        const destination = searchParams.get("destination")?.trim() || null;
        const type        = searchParams.get("type")?.trim()        || null;
        const organizer   = searchParams.get("organizer")?.trim()   || null;
        const sort        = searchParams.get("sort")                 || null;
        const dateFilter  = searchParams.get("dateFilter")           || null;
        const dateStart   = searchParams.get("dateStart")            || null;
        const dateEnd     = searchParams.get("dateEnd")              || null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const baseMatch = {
            status:     "published",
            date:       { $gte: today },
            visibility: { $ne: "private" },
        };

        if (search) {
            baseMatch.$or = [
                { title:       { $regex: search, $options: "i" } },
                { destination: { $regex: search, $options: "i" } },
                { eventType:   { $regex: search, $options: "i" } },
                { location:    { $regex: search, $options: "i" } },
            ];
        }

        if (destination) {
            const destinations = destination.split(",").map(d => d.trim()).filter(Boolean);
            const regexes = destinations.map(d => new RegExp(d, "i"));
            baseMatch.$or = [
                { location:    { $in: regexes } },
                { destination: { $in: regexes } },
            ];
        }

        if (type) {
            const types = type.split(",").map(t => t.trim()).filter(Boolean);
            baseMatch.eventType = types.length === 1
                ? { $regex: types[0], $options: "i" }
                : { $in: types.map(t => new RegExp(t, "i")) };
        }

        if (dateFilter && !dateStart && !dateEnd) {
            const now = new Date();
            switch (dateFilter) {
                case "Today": {
                    const end = new Date(now); end.setHours(23, 59, 59, 999);
                    baseMatch.date = { $gte: now, $lte: end }; break;
                }
                case "Tomorrow": {
                    const start = new Date(now); start.setDate(now.getDate() + 1); start.setHours(0, 0, 0, 0);
                    const end   = new Date(start); end.setHours(23, 59, 59, 999);
                    baseMatch.date = { $gte: start, $lte: end }; break;
                }
                case "This Week": {
                    const end = new Date(now); end.setDate(now.getDate() + 7);
                    baseMatch.date = { $gte: now, $lte: end }; break;
                }
                case "This Month": {
                    const end = new Date(now); end.setMonth(now.getMonth() + 1);
                    baseMatch.date = { $gte: now, $lte: end }; break;
                }
            }
        }

        if (dateStart || dateEnd) {
            baseMatch.date = {};
            if (dateStart) {
                const start = new Date(dateStart);
                start.setUTCHours(0, 0, 0, 0);
                baseMatch.date.$gte = start;
            }
            if (dateEnd) {
                const end = new Date(dateEnd);
                end.setUTCHours(23, 59, 59, 999);
                baseMatch.date.$lte = end;
            }
        }

        let sortStage = { slotsLeft: 1, rating: -1 };
        switch (sort) {
            case "price_asc":   sortStage = { pricePerSlot: 1  }; break;
            case "price_desc":  sortStage = { pricePerSlot: -1 }; break;
            case "date_asc":    sortStage = { date: 1          }; break;
            case "date_desc":   sortStage = { date: -1         }; break;
            case "rating":      sortStage = { rating: -1       }; break;
            case "most_booked": sortStage = { bookedSlots: -1  }; break;
        }

        // Organizer filter applied after $lookup since companyname lives in guidedetails
        let organizerMatch = null;
        if (organizer) {
            const organizerNames = organizer.split(",").map(o => o.trim());
            organizerMatch = {
                $or: organizerNames.map(name => ({
                    "guideDetails.companyname": { $regex: name, $options: "i" },
                })),
            };
        }

        const pipeline = [
            { $match: baseMatch },
            { $addFields: { slotsLeft: { $subtract: ["$totalSlots", "$bookedSlots"] } } },
            {
                $lookup: {
                    from:         "guidedetails",
                    localField:   "guide",
                    foreignField: "guide",
                    as:           "guideDetails",
                    pipeline: [
                        { $project: { companyname: 1, "pausedServices.event": 1, guide: 1 } },
                    ],
                },
            },
            { $unwind: { path: "$guideDetails", preserveNullAndEmptyArrays: false } },
            { $match: { "guideDetails.pausedServices.event": { $ne: true } } },
            ...(organizerMatch ? [{ $match: organizerMatch }] : []),
            {
                $lookup: {
                    from:         "guides",
                    localField:   "guide",
                    foreignField: "_id",
                    as:           "guideInfo",
                    pipeline: [
                        { $project: { username: 1 } },
                    ],
                },
            },
            { $unwind: { path: "$guideInfo", preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    events: [
                        { $sort: sortStage },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id:          1,
                                guide:        1,
                                title:        1,
                                date:         1,
                                duration:     1,
                                pricePerSlot: 1,
                                eventType:    1,
                                rating:       1,
                                bookedSlots:  1,
                                totalSlots:   1,
                                slotsLeft:    1,
                                location:     1,
                                destination:  1,
                                poster:       1,
                                createdAt:    1,
                                "guideDetails.companyname": 1,
                                "guideInfo.username":       1,
                            },
                        },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const [aggregationResult] = await Event.aggregate(pipeline);

        const rawEvents = aggregationResult?.events || [];
        const total     = aggregationResult?.totalCount?.[0]?.count || 0;
        const hasMore   = page * limit < total;

        const events = rawEvents.map(e => ({
            id:          e._id.toString(),
            guideId:     e.guide?.toString() ?? null,
            name:        e.title,
            date:        e.date,
            duration:    `${e.duration} day${e.duration > 1 ? "s" : ""}`,
            price:       e.pricePerSlot,
            type:        e.eventType,
            rating:      e.rating,
            bookings:    e.bookedSlots,
            slotsLeft:   e.slotsLeft,
            totalSlots:  e.totalSlots,
            destination: e.destination,
            destinationId: e.location,
            image:       e.poster || null,
            createdAt:   e.createdAt,
            guideName:   e.guideDetails?.companyname || e.guideInfo?.username || "Local Guide",
        }));

        return NextResponse.json(
            {
                success: true,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore,
                events,
            },
            {
                headers: {
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