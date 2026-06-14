import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid event ID" }, { status: 400 });
        }

        await dbConnect();

        const event = await Event.findById(id)
            .select("totalSlots bookedSlots status")
            .lean();

        if (!event) {
            return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
        }

        const bookedSlots = event.bookedSlots || 0;
        const slotsLeft = event.totalSlots - bookedSlots;

        return NextResponse.json({
            success: true,
            totalSlots: event.totalSlots,
            bookedSlots,
            slotsLeft,
            status: event.status,
            isSoldOut: slotsLeft <= 0,
        });

    } catch (error) {
        console.error("Availability fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}