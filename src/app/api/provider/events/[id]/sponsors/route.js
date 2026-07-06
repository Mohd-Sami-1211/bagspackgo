import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Event } from "@/models/event.model";
import { sanitizeString } from "@/lib/sanitize";

/**
 * GET /api/provider/events/[id]/sponsors
 * Get all sponsors for an event (must belong to the authenticated provider).
 */
export async function GET(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        const event = await Event.findOne({ _id: id, guide: user.userId })
            .select("sponsors")
            .lean();

        if (!event) {
            return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, sponsors: event.sponsors || [] });
    } catch (error) {
        console.error("Get Sponsors Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Something went wrong" }, { status: 500 });
    }
}

/**
 * POST /api/provider/events/[id]/sponsors
 * Add a new sponsor to an event.
 */
export async function POST(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        const event = await Event.findOne({ _id: id, guide: user.userId });
        if (!event) {
            return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        }

        const body = await request.json();

        if (!body.name?.trim()) {
            return NextResponse.json({ success: false, message: "Sponsor name is required" }, { status: 400 });
        }

        const newSponsor = {
            name: sanitizeString(body.name),
            image: body.image || "",
            description: sanitizeString(body.description || ""),
            website: sanitizeString(body.website || ""),
            socialMedia: {
                instagram: sanitizeString(body.socialMedia?.instagram || ""),
                facebook: sanitizeString(body.socialMedia?.facebook || ""),
                twitter: sanitizeString(body.socialMedia?.twitter || ""),
                youtube: sanitizeString(body.socialMedia?.youtube || ""),
                linkedin: sanitizeString(body.socialMedia?.linkedin || ""),
            },
            links: (body.links || [])
                .filter((l) => l && l.label?.trim() && l.url?.trim())
                .map((l) => ({
                    label: sanitizeString(l.label),
                    url: sanitizeString(l.url),
                })),
        };

        event.sponsors.push(newSponsor);
        await event.save();

        const addedSponsor = event.sponsors[event.sponsors.length - 1];

        return NextResponse.json(
            { success: true, message: "Sponsor added successfully!", sponsor: addedSponsor },
            { status: 201 }
        );
    } catch (error) {
        console.error("Add Sponsor Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Something went wrong" }, { status: 500 });
    }
}
