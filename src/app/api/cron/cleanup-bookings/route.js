import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Vercel Cron Authentication (if CRON_SECRET is defined)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, message: 'Unauthorized cron trigger' }, { status: 401 });
        }

        await dbConnect();

        // Calculate the timestamp for 5 minutes ago
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Delete pending bookings older than 5 minutes
        const filter = {
            status: 'pending',
            createdAt: { $lt: fiveMinutesAgo }
        };

        const [eventResult, tripResult, trekResult] = await Promise.all([
            Booking.deleteMany(filter),
            TripBooking.deleteMany(filter),
            TrekBooking.deleteMany(filter)
        ]);

        return NextResponse.json({
            success: true,
            message: 'Abandoned pending bookings cleaned up (5-minute window)',
            deleted: {
                events: eventResult.deletedCount,
                trips: tripResult.deletedCount,
                treks: trekResult.deletedCount
            }
        });
    } catch (error) {
        console.error('[Cron] Cleanup failed:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
