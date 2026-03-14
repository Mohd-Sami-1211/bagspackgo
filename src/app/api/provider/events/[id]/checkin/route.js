import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Event } from "@/models/event.model";
import { Booking } from "@/models/booking.model";

/**
 * POST /api/provider/events/[id]/checkin
 * Verify a pass code and mark participant as checked-in.
 * Body: { passCode: "BPG-EVT-xxx-Gxxx" }
 */
export async function POST(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const { passCode } = await request.json();

        if (!passCode || typeof passCode !== "string" || !passCode.trim()) {
            return NextResponse.json({ success: false, message: "Pass code is required" }, { status: 400 });
        }

        const trimmedCode = passCode.trim();

        // Verify the event belongs to this provider
        const event = await Event.findOne({ _id: id, guide: user.userId }).lean();
        if (!event) {
            return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        }

        // Find the booking that contains this passCode
        const booking = await Booking.findOne({
            event: id,
            status: { $in: ["confirmed", "completed"] },
            "participants.passCode": trimmedCode,
        });

        if (!booking) {
            return NextResponse.json({
                success: false,
                message: "Invalid pass code. No booking found for this event.",
            });
        }

        // Find the specific participant
        const participant = booking.participants.find(p => p.passCode === trimmedCode);

        if (!participant) {
            return NextResponse.json({
                success: false,
                message: "Pass code not found in booking.",
            });
        }

        const alreadyCheckedIn = participant.checkedIn;

        if (!alreadyCheckedIn) {
            // Mark as checked-in
            participant.checkedIn = true;
            await booking.save();
        }

        return NextResponse.json({
            success: true,
            alreadyCheckedIn,
            guest: {
                name: participant.name,
                age: participant.age,
                gender: participant.gender,
                mobile: participant.phone,
                idProofType: participant.idType,
                idProofNumber: participant.idNumber,
                passCode: participant.passCode,
                checkedIn: participant.checkedIn,
            },
            message: alreadyCheckedIn
                ? "This guest was already checked in."
                : "Guest successfully checked in!",
        });
    } catch (error) {
        console.error("Check-In Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
