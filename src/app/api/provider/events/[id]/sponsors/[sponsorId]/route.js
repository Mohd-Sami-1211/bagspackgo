import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Event } from "@/models/event.model";
import { sanitizeString } from "@/lib/sanitize";

/**
 * PATCH /api/provider/events/[id]/sponsors/[sponsorId]
 * Update a specific sponsor.
 */
export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id, sponsorId } = params;

        const event = await Event.findOne({ _id: id, guide: user.userId });
        if (!event) {
            return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        }

        const sponsor = event.sponsors.id(sponsorId);
        if (!sponsor) {
            return NextResponse.json({ success: false, message: "Sponsor not found" }, { status: 404 });
        }

        const body = await request.json();

        if (body.name !== undefined) {
            if (!body.name?.trim()) {
                return NextResponse.json({ success: false, message: "Sponsor name cannot be empty" }, { status: 400 });
            }
            sponsor.name = sanitizeString(body.name);
        }
        if (body.image !== undefined) sponsor.image = body.image;
        if (body.description !== undefined) sponsor.description = sanitizeString(body.description);
        if (body.website !== undefined) sponsor.website = sanitizeString(body.website);

        if (body.socialMedia) {
            sponsor.socialMedia = {
                instagram: sanitizeString(body.socialMedia.instagram || sponsor.socialMedia?.instagram || ""),
                facebook: sanitizeString(body.socialMedia.facebook || sponsor.socialMedia?.facebook || ""),
                twitter: sanitizeString(body.socialMedia.twitter || sponsor.socialMedia?.twitter || ""),
                youtube: sanitizeString(body.socialMedia.youtube || sponsor.socialMedia?.youtube || ""),
                linkedin: sanitizeString(body.socialMedia.linkedin || sponsor.socialMedia?.linkedin || ""),
            };
        }

        if (Array.isArray(body.links)) {
            sponsor.links = body.links
                .filter((l) => l && l.label?.trim() && l.url?.trim())
                .map((l) => ({
                    label: sanitizeString(l.label),
                    url: sanitizeString(l.url),
                }));
        }

        event.markModified('sponsors');
        await event.save();

        return NextResponse.json({ success: true, message: "Sponsor updated successfully!", sponsor });
    } catch (error) {
        console.error("Update Sponsor Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Something went wrong" }, { status: 500 });
    }
}

/**
 * DELETE /api/provider/events/[id]/sponsors/[sponsorId]
 * Remove a specific sponsor from an event.
 */
export async function DELETE(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id, sponsorId } = params;

        const event = await Event.findOne({ _id: id, guide: user.userId });
        if (!event) {
            return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        }

        const sponsorIndex = event.sponsors.findIndex((s) => s._id.toString() === sponsorId);
        if (sponsorIndex === -1) {
            return NextResponse.json({ success: false, message: "Sponsor not found" }, { status: 404 });
        }

        event.sponsors.splice(sponsorIndex, 1);
        event.markModified('sponsors');
        await event.save();

        return NextResponse.json({ success: true, message: "Sponsor removed successfully!" });
    } catch (error) {
        console.error("Delete Sponsor Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Something went wrong" }, { status: 500 });
    }
}
