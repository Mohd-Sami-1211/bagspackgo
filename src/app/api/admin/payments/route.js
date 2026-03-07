import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TripBooking } from "@/models/tripbooking.model";
import { TrekBooking } from "@/models/trekbooking.model";
import { Booking } from "@/models/booking.model";
import { Event } from "@/models/event.model";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getCurrentUser();

        // Check if user is admin
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch Bookings with confirmed status
        const tripBookings = await TripBooking.find({ status: "confirmed" })
            .populate("package", "title")
            .populate("provider", "username email phone")
            .lean();

        const trekBookings = await TrekBooking.find({ status: "confirmed" })
            .populate("package", "title")
            .populate("provider", "username email phone")
            .lean();

        const eventBookings = await Booking.find({ status: "confirmed" })
            .populate({
                path: "event",
                select: "title guide",
                populate: { path: "guide", select: "username email phone" }
            })
            .lean();

        // Normalize data to a common structure
        const normalizedTrips = tripBookings.map(b => ({
            _id: b._id,
            type: 'trip',
            title: b.package?.title || 'Trip Package',
            bookingRef: b.bookingRef,
            date: b.createdAt,
            amount: b.totalAmount,
            providerId: b.provider?._id || null,
            providerName: b.provider?.username || 'Unknown',
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
            providerId: b.provider?._id || null,
            providerName: b.provider?.username || 'Unknown',
            providerPaymentStatus: b.providerPaymentStatus || "pending",
            providerTransactionId: b.providerTransactionId || "",
            providerPaymentDate: b.providerPaymentDate || null,
            providerDepositedAccount: b.providerDepositedAccount || ""
        }));

        const normalizedEvents = eventBookings.map(b => ({
            _id: b._id,
            type: 'event',
            title: b.event?.title || 'Event',
            bookingRef: b._id,
            date: b.createdAt,
            amount: b.amountPaid,
            providerId: b.event?.guide?._id || null,
            providerName: b.event?.guide?.username || 'Unknown',
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
        console.error("Fetch Admin Payments Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch payments data" },
            { status: 500 }
        );
    }
}
