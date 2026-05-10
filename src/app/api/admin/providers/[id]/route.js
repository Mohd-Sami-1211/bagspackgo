import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Event } from '@/models/event.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();

        const guide = await Guide.findById(params.id).lean();
        if (!guide) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

        const details = await GuideDetails.findOne({ guide: params.id }).lean();

        // Fetch packages
        const packages = await Package.find({ provider: params.id })
            .select('name category packageType packageCategory destination days status rating totalRatings createdAt trekName trekLevel pricingTiers')
            .sort({ createdAt: -1 })
            .lean();

        // Fetch booking stats
        const [tripBookings, trekBookings] = await Promise.all([
            TripBooking.find({ provider: params.id, status: { $ne: 'pending' } }).select('status totalAmount providerPaymentStatus createdAt').lean(),
            TrekBooking.find({ provider: params.id, status: { $ne: 'pending' } }).select('status totalAmount providerPaymentStatus createdAt').lean(),
        ]);

        const allBookings = [...tripBookings, ...trekBookings];
        const bookingStats = {
            total: allBookings.length,
            confirmed: allBookings.filter(b => b.status === 'confirmed').length,
            pending: allBookings.filter(b => b.status === 'pending').length,
            cancelled: allBookings.filter(b => ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status)).length,
            totalRevenue: allBookings.filter(b => !['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status)).reduce((s, b) => s + (b.totalAmount || 0), 0),
            deposited: allBookings.filter(b => b.providerPaymentStatus === 'completed').reduce((s, b) => s + (b.totalAmount || 0), 0),
            pendingPayout: allBookings.filter(b => b.providerPaymentStatus !== 'completed' && !['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status)).reduce((s, b) => s + (b.totalAmount || 0), 0),
        };

        // Fetch events
        const events = await Event.find({ guide: params.id })
            .select('title date location status totalSlots bookedSlots pricePerSlot createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            provider: {
                ...guide,
                details: details || null,
                packages,
                bookingStats,
                events,
            }
        });
    } catch (err) {
        console.error('Admin provider detail error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { isActive } = await req.json();
        
        const provider = await Guide.findByIdAndUpdate(params.id, { isActive }, { new: true });
        if (!provider) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

        return NextResponse.json({ success: true, provider });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const provider = await Guide.findByIdAndDelete(params.id);
        if (!provider) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

        // Would also need to delete packages, guide details, etc in a robust system
        return NextResponse.json({ success: true, message: 'Provider deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
