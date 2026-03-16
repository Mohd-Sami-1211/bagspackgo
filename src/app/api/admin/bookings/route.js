import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Booking as EventBooking } from '@/models/booking.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'trips'; // 'trips', 'treks', 'events'
        const search = searchParams.get('search') || '';

        let bookings = [];

        if (type === 'trips') {
            const match = {};
            if (search) match.bookingRef = { $regex: search, $options: 'i' };
            bookings = await TripBooking.find(match)
                .populate('user', 'username email phone')
                .populate('package', 'name destination')
                .populate('provider', 'username email')
                .sort({ createdAt: -1 }).lean();
        } else if (type === 'treks') {
            const match = {};
            if (search) match.bookingRef = { $regex: search, $options: 'i' };
            bookings = await TrekBooking.find(match)
                .populate('user', 'username email phone')
                .populate('package', 'name destination')
                .populate('provider', 'username email')
                .sort({ createdAt: -1 }).lean();
        } else if (type === 'events') {
            // Event Bookings don't have a bookingRef, maybe search by paymentId
            const match = {};
            if (search) match.paymentId = { $regex: search, $options: 'i' };
            bookings = await EventBooking.find(match)
                .populate('user', 'username email phone')
                .populate('event', 'title location date')
                .sort({ createdAt: -1 }).lean();
        }

        return NextResponse.json({ success: true, bookings });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
