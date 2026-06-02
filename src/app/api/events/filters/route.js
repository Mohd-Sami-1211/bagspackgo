import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { GuideDetails } from "@/models/guidedetails.model";
import { Event } from "@/models/event.model";
import { destinations as STATIC_DESTINATIONS } from "@/data/data.json";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 10;

// GET /api/events/filters
// Query params: ?type=organizer|destination&search=&page=&limit=
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        const type   = searchParams.get("type")?.trim()  || null;
        const search = searchParams.get("search")?.trim() || null;
        const page   = Math.max(1, parseInt(searchParams.get("page"))  || 1);
        const limit  = Math.min(50, parseInt(searchParams.get("limit")) || DEFAULT_LIMIT);
        const skip   = (page - 1) * limit;

        // ── ORGANIZER ──
        if (type === "organizer") {
            const pipeline = [
                {
                    $match: {
                        "pausedServices.event": { $ne: true },
                        companyname: { $exists: true, $ne: "" },
                        ...(search && { companyname: { $regex: search, $options: "i" } }),
                    },
                },
                {
                    $lookup: {
                        from:         "guides",
                        localField:   "guide",
                        foreignField: "_id",
                        as:           "guideInfo",
                        pipeline: [
                            { $match: { applicationStatus: "approved" } },
                            { $project: { _id: 1 } },
                        ],
                    },
                },
                { $match: { "guideInfo.0": { $exists: true } } },
                {
                    $facet: {
                        results: [
                            { $sort: { companyname: 1 } },
                            { $skip: skip },
                            { $limit: limit },
                            { $project: { _id: 0, id: "$companyname", name: "$companyname" } },
                        ],
                        totalCount: [{ $count: "count" }],
                    },
                },
            ];

            const [agg] = await GuideDetails.aggregate(pipeline);
            const results = agg?.results             || [];
            const total   = agg?.totalCount?.[0]?.count || 0;

            return NextResponse.json(
                { success: true, type, total, page, limit, hasMore: page * limit < total, results },
                { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
            );
        }

        // ── DESTINATION ──
        if (type === "destination") {
            // Static location IDs from data.json — used to exclude from dynamic results
            const staticLocationIds = STATIC_DESTINATIONS.map(d => d.value);
            const pipeline = [
                {
                    $match: {
                        status:     "published",
                        visibility: { $ne: "private" },
                        location:   { $nin: staticLocationIds },
                        ...(search && {
                        $or: [
                            { location:    { $regex: search, $options: "i" } },
                            { destination: { $regex: search, $options: "i" } },
                        ],
                        }),
                    },
                },
                {
                    $group: {
                        _id:  "$destination",
                        name: { $first: "$destination" },
                    },
                },
                { $sort: { name: 1 } },
                {
                    $facet: {
                        results: [
                            { $skip: skip },
                            { $limit: limit },
                            { $project: { _id: 0, id: "$_id", value: "$_id", name: "$name" } },
                        ],
                        totalCount: [{ $count: "count" }],
                    },
                },
            ];

            const [agg] = await Event.aggregate(pipeline);
            const results = agg?.results             || [];
            const total   = agg?.totalCount?.[0]?.count || 0;

            return NextResponse.json(
                { success: true, type, total, page, limit, hasMore: page * limit < total, results },
                { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } }
            );
        }

        return NextResponse.json(
            { success: false, message: "Invalid or missing 'type' param. Use: organizer | destination" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Events Filter API Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}