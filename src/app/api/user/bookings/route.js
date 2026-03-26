import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        // Providers & admins cannot use user booking routes
        if (user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Access denied. This endpoint is for users only.' }, { status: 403 });
        }

        await dbConnect();

        // Fetch all bookings for this user, populate the event details
        const bookings = await Booking.find({ user: user.userId })
            .populate('event', 'title eventType date duration slots location destination poster pricePerSlot guide')
            .sort({ createdAt: -1 })
            .exec();

        // Format the bookings to match the frontend expectations
        const formattedBookings = bookings.map(b => {
            const event = b.event;
            if (!event) return null; // Defensive check

            const isUpcoming = b.status === 'confirmed' && new Date(event.date || b.bookingDate) >= new Date();

            const passUrl = `/user/bookings/${b._id}/pass`;

            return {
                id: b._id.toString(),
                category: event.eventType || 'Event',
                name: event.title,
                guide: event.guide?.username || 'Assigned Guide',
                date: event.date || b.bookingDate,
                duration: event.duration ? `${event.duration} days` : '1 day',
                people: b.slots || 1,
                destination: event.location || event.destination || 'TBD',
                price: b.amountPaid || event.pricePerSlot,
                image: event.poster || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
                status: b.status,
                passUrl: b.status === 'confirmed' ? passUrl : null
            };
        }).filter(b => b !== null);

        return NextResponse.json({ success: true, count: formattedBookings.length, data: formattedBookings });
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
