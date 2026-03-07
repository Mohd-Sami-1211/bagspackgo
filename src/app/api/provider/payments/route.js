import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TripBooking } from "@/models/tripbooking.model";
import { TrekBooking } from "@/models/trekbooking.model";
import { Booking } from "@/models/booking.model";
import { Event } from "@/models/event.model";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch Trip Bookings
        const tripBookings = await TripBooking.find({
            provider: user.userId,
            status: "confirmed"
        }).populate("package", "title").lean();

        // Fetch Trek Bookings
        const trekBookings = await TrekBooking.find({
            provider: user.userId,
            status: "confirmed"
        }).populate("package", "title").lean();

        // Fetch Event Bookings
        const events = await Event.find({ guide: user.userId }).distinct("_id");
        const eventBookings = await Booking.find({
            event: { $in: events },
            status: "confirmed"
        }).populate("event", "title").lean();

        // Normalize data
        const normalizedTrips = tripBookings.map(b => ({
            _id: b._id,
            type: 'trip',
            title: b.package?.title || 'Trip Package',
            bookingRef: b.bookingRef,
            date: b.createdAt,
            amount: b.totalAmount,
            providerPaymentStatus: b.providerPaymentStatus || "pending",
            providerTransactionId: b.providerTransactionId || "",
            providerPaymentDate: b.providerPaymentDate || null,
            providerDepositedAccount: b.providerDepositedAccount || ""
        }));

        const normalizedTreks = trekBookings.map(b => ({
            _id: b._id,
            type: 'trek',
            title: b.package?.title || 'Trek Package',
            bookingRef: b.bookingRef,
            date: b.createdAt,
            amount: b.totalAmount,
            providerPaymentStatus: b.providerPaymentStatus || "pending",
            providerTransactionId: b.providerTransactionId || "",
            providerPaymentDate: b.providerPaymentDate || null,
            providerDepositedAccount: b.providerDepositedAccount || ""
        }));

        const normalizedEvents = eventBookings.map(b => ({
            _id: b._id,
            type: 'event',
            title: b.event?.title || 'Event',
            bookingRef: b._id, // Event bookings use object ID as ref mostly, or we map it to string
            date: b.createdAt,
            amount: b.amountPaid,
            providerPaymentStatus: b.providerPaymentStatus || "pending",
            providerTransactionId: b.providerTransactionId || "",
            providerPaymentDate: b.providerPaymentDate || null,
            providerDepositedAccount: b.providerDepositedAccount || ""
        }));

        const allPayments = [...normalizedTrips, ...normalizedTreks, ...normalizedEvents].sort((a, b) => new Date(b.date) - new Date(a.date));

        return NextResponse.json({
            success: true,
            payments: allPayments
        });

    } catch (error) {
        console.error("Fetch Provider Payments Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch payments data" },
            { status: 500 }
        );
    }
}
