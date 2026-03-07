import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TripBooking } from "@/models/tripbooking.model";
import { TrekBooking } from "@/models/trekbooking.model";
import { Booking } from "@/models/booking.model";

export async function PUT(req, { params }) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await req.json();

        // Expect type ('trip', 'trek', 'event'), trans ID, deposited account optionally
        const { type, providerTransactionId, providerDepositedAccount } = body;

        if (!['trip', 'trek', 'event'].includes(type)) {
            return NextResponse.json(
                { success: false, message: "Invalid booking type provided" },
                { status: 400 }
            );
        }

        await dbConnect();

        let Model;
        if (type === 'trip') Model = TripBooking;
        else if (type === 'trek') Model = TrekBooking;
        else if (type === 'event') Model = Booking;

        const updated = await Model.findByIdAndUpdate(
            id,
            {
                $set: {
                    providerPaymentStatus: 'completed',
                    providerTransactionId: providerTransactionId || '',
                    providerDepositedAccount: providerDepositedAccount || '',
                    providerPaymentDate: new Date()
                }
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Booking not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Payment marked as completed successfully."
        });

    } catch (error) {
        console.error("Update Admin Payment Error:", error);
        return NextResponse.json(
            { success: false, message: "Server Error updating payment" },
            { status: 500 }
        );
    }
}
