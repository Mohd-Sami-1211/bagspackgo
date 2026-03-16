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
        const search = searchParams.get('search') || '';
        const payoutStatus = searchParams.get('payout') || 'all'; 

        let query = { status: 'confirmed' };
        if (payoutStatus !== 'all') {
            query.providerPaymentStatus = payoutStatus;
        }

        const [trips, treks, events] = await Promise.all([
            TripBooking.find(query).populate('user', 'username').populate('provider', 'username').populate('package', 'name title').lean(),
            TrekBooking.find(query).populate('user', 'username').populate('provider', 'username').populate('package', 'name title').lean(),
            EventBooking.find(query).populate('user', 'username').populate({ path: 'event', select: 'title guide', populate: { path: 'guide', select: 'username' } }).lean()
        ]);

        const formatBooking = (b, type) => ({
            _id: b._id,
            model: type,
            bookingRef: type === 'EventBooking' ? b.paymentId : b.bookingRef,
            user: b.user?.username || 'Unknown',
            provider: type === 'EventBooking' ? b.event?.guide?.username : b.provider?.username,
            amount: type === 'EventBooking' ? b.amountPaid : b.totalAmount,
            date: b.bookingDate || b.createdAt,
            platformFee: b.platformFee || 0,
            providerPaymentStatus: b.providerPaymentStatus || 'pending',
            providerTransactionId: b.providerTransactionId || '',
            providerPaymentDate: b.providerPaymentDate || null
        });

        const all = [
            ...trips.map(t => formatBooking(t, 'TripBooking')),
            ...treks.map(t => formatBooking(t, 'TrekBooking')),
            ...events.map(e => formatBooking(e, 'EventBooking'))
        ];

        let filtered = all;
        if (search) {
            const s = search.toLowerCase();
            filtered = all.filter(p => 
                p.bookingRef?.toLowerCase().includes(s) || 
                p.provider?.toLowerCase().includes(s) || 
                p.providerTransactionId?.toLowerCase().includes(s)
            );
        }

        filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

        return NextResponse.json({ success: true, payments: filtered });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
