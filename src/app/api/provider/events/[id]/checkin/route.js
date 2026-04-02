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
export async function POST(request, context) {
    const params = await context.params;
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

        let booking = await Booking.findOne({
            event: id,
            status: { $in: ["confirmed", "completed"] },
            "participants.passCode": { $regex: new RegExp(`^${trimmedCode}$`, 'i') }
        });

        let participant = null;

        if (booking) {
            // Found by passCode
            participant = booking.participants.find(p => p.passCode?.toLowerCase() === trimmedCode.toLowerCase());
        } else {
            // Fallback: try to find by the 8-character Booking Reference (first 8 chars of _id)
            const allBookings = await Booking.find({ 
                event: id, 
                status: { $in: ["confirmed", "completed"] } 
            });
            booking = allBookings.find(b => b._id.toString().substring(0, 8).toUpperCase() === trimmedCode.toUpperCase());
            
            if (booking && booking.participants.length > 0) {
                // Try to find the first participant not checked in yet
                participant = booking.participants.find(p => !p.checkedIn);
                // If all are checked in, pick the first one so the system properly reports "already checked in"
                if (!participant) {
                    participant = booking.participants[0];
                }
            }
        }

        if (!booking || !participant) {
            return NextResponse.json({
                success: false,
                message: "Error: Invalid Code. This pass code or booking reference was not found for this event.",
            });
        }

        const alreadyCheckedIn = participant.checkedIn;

        if (alreadyCheckedIn) {
            return NextResponse.json({
                success: false,
                message: "Error: This QR code has already been used for check-in!"
            });
        }

        // Mark as checked-in
        participant.checkedIn = true;
        await booking.save();

        return NextResponse.json({
            success: true,
            alreadyCheckedIn: false,
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
            message: "Guest successfully checked in!",
        });
    } catch (error) {
        console.error("Check-In Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
