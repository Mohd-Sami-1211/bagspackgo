import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Event } from '@/models/event.model';
import { Package } from '@/models/package.model';
import { User } from '@/models/user.model';

export const dynamic = 'force-dynamic';

// Build chart data for a specific time window
// Build chart data for a specific time window
function buildChartData(allBookings, windowKey) {
    const now = new Date();
    const isDeposited = (b) => !['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status) && b.providerPaymentStatus === 'completed';

    if (windowKey === '1D') {
        const data = [];
        for (let h = 23; h >= 0; h--) {
            const start = new Date(now);
            start.setHours(now.getHours() - h, 0, 0, 0);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);
            const label = start.getHours() === 0 ? '12a' : start.getHours() < 12
                ? `${start.getHours()}a`
                : start.getHours() === 12 ? '12p'
                : `${start.getHours() - 12}p`;
            const amount = allBookings
                .filter(b => {
                    const d = new Date(b.createdAt);
                    return isDeposited(b) && d >= start && d < end;
                })
                .reduce((s, b) => s + (b.totalAmount || 0), 0);
            data.push({ name: label, value: Math.round(amount / 1000) });
        }
        return data;
    }

    if (windowKey === '1W') {
        const data = [];
        for (let d = 6; d >= 0; d--) {
            const start = new Date(now);
            start.setDate(now.getDate() - d);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 1);
            const label = start.toLocaleDateString('en-IN', { weekday: 'short' });
            const amount = allBookings
                .filter(b => {
                    const bd = new Date(b.createdAt);
                    return isDeposited(b) && bd >= start && bd < end;
                })
                .reduce((s, b) => s + (b.totalAmount || 0), 0);
            data.push({ name: label, value: Math.round(amount / 1000) });
        }
        return data;
    }

    if (windowKey === '1M') {
        const data = [];
        for (let w = 3; w >= 0; w--) {
            const start = new Date(now);
            start.setDate(now.getDate() - (w + 1) * 7);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now);
            end.setDate(now.getDate() - w * 7);
            end.setHours(23, 59, 59, 999);
            const label = `Wk ${4 - w}`;
            const amount = allBookings
                .filter(b => {
                    const bd = new Date(b.createdAt);
                    return isDeposited(b) && bd >= start && bd < end;
                })
                .reduce((s, b) => s + (b.totalAmount || 0), 0);
            data.push({ name: label, value: Math.round(amount / 1000) });
        }
        return data;
    }

    if (windowKey === '3M') {
        const data = [];
        for (let i = 2; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const label = d.toLocaleString('default', { month: 'short' });
            const amount = allBookings
                .filter(b => {
                    const bd = new Date(b.createdAt);
                    return !isCancelled(b.status) && bd >= d && bd < end;
                })
                .reduce((s, b) => s + (b.totalAmount || 0), 0);
            data.push({ name: label, value: Math.round(amount / 1000) });
        }
        return data;
    }

    const data = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const label = d.toLocaleString('default', { month: 'short' });
        const amount = allBookings
            .filter(b => {
                const bd = new Date(b.createdAt);
                return !isCancelled(b.status) && bd >= d && bd < end;
            })
            .reduce((s, b) => s + (b.totalAmount || 0), 0);
        data.push({ name: label, value: Math.round(amount / 1000) });
    }
    return data;
}

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'provider') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const guideId = user.userId;

        // Fetch profile / guide details in parallel
        const [guide, details] = await Promise.all([
            Guide.findById(guideId).select('username email phone applicationStatus createdAt').lean(),
            GuideDetails.findOne({ guide: guideId }).lean(),
        ]);

        // Date range helpers
        const now = new Date();
        const startOf30Days = new Date(now);
        startOf30Days.setDate(startOf30Days.getDate() - 30);
        const startOfPrev30 = new Date(startOf30Days);
        startOfPrev30.setDate(startOfPrev30.getDate() - 30);

        // Get all packages for this provider
        const providerPackages = await Package.find({ provider: guideId }).select('_id name destination category status').lean();
        const packageIds = providerPackages.map(p => p._id);

        // Fetch all trip & trek bookings with user population
        const [tripBookings, trekBookings, events] = await Promise.all([
            packageIds.length > 0
                ? TripBooking.find({
                    $or: [{ package: { $in: packageIds } }, { provider: guideId }]
                })
                    .populate('user', 'username email phone')
                    .lean()
                : [],
            packageIds.length > 0
                ? TrekBooking.find({
                    $or: [{ package: { $in: packageIds } }, { provider: guideId }]
                })
                    .populate('user', 'username email phone')
                    .lean()
                : [],
            Event.find({ guide: guideId }).lean(),
        ]);

        const allBookings = [...tripBookings, ...trekBookings];

        // ── Stats ─────────────────────────────────────────────
        const bookingsLast30 = allBookings.filter(b => new Date(b.createdAt) >= startOf30Days);
        const bookingsPrev30 = allBookings.filter(b => {
            const d = new Date(b.createdAt);
            return d >= startOfPrev30 && d < startOf30Days;
        });

        const totalBookings30 = bookingsLast30.length;
        const totalBookingsPrev = bookingsPrev30.length;
        const bookingChangePct = totalBookingsPrev > 0
            ? Math.round(((totalBookings30 - totalBookingsPrev) / totalBookingsPrev) * 100)
            : totalBookings30 > 0 ? 100 : 0;

        const isNotCancelled = (b) => !['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status);
        const isDeposited = (b) => isNotCancelled(b) && b.providerPaymentStatus === 'completed';
        const earningsLast30 = bookingsLast30.filter(isDeposited).reduce((s, b) => s + (b.totalAmount || 0), 0);
        const earningsPrev30 = bookingsPrev30.filter(isDeposited).reduce((s, b) => s + (b.totalAmount || 0), 0);
        const earningsChangePct = earningsPrev30 > 0
            ? Math.round(((earningsLast30 - earningsPrev30) / earningsPrev30) * 100)
            : earningsLast30 > 0 ? 100 : 0;

        const activePackages = providerPackages.filter(p => p.status === 'active').length;
        const totalPackages = providerPackages.length;
        const publishedEvents = events.filter(e => e.status === 'published').length;
        const totalEvents = events.length;

        // ── Multi-timeline chart data ─────────────────────────
        const chartTimelines = {
            '1D': buildChartData(allBookings, '1D'),
            '1W': buildChartData(allBookings, '1W'),
            '1M': buildChartData(allBookings, '1M'),
            '3M': buildChartData(allBookings, '3M'),
            '6M': buildChartData(allBookings, '6M'),
        };

        // ── Pipeline bar chart ────────────────────────────────
        const pipeline = [
            { name: 'Trips', scheduled: tripBookings.filter(b => b.status === 'confirmed').length, pending: tripBookings.filter(b => b.status === 'pending').length },
            { name: 'Treks', scheduled: trekBookings.filter(b => b.status === 'confirmed').length, pending: trekBookings.filter(b => b.status === 'pending').length },
            { name: 'Events', scheduled: events.filter(e => e.bookedSlots > 0).length, pending: 0 },
        ];

        // ── Recent bookings with booker name ─────────────────
        const recentBookings = allBookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
            .map(b => {
                const isTrek = !!b.peopleRange;
                // get name from populated user, then fall back to personalDetails, then snapshot
                const bookerName =
                    b.user?.username ||
                    b.personalDetails?.name ||
                    b.personalDetails?.fullName ||
                    b.packageSnapshot?.bookedBy ||
                    'Guest';
                return {
                    id: b._id.toString(),
                    bookingRef: b.bookingRef || '',
                    type: isTrek ? 'Trek' : 'Trip',
                    packageName: b.package?.name || b.packageSnapshot?.name || 'Package',
                    destination: b.package?.destination || b.packageSnapshot?.destination || '',
                    status: b.status,
                    numPeople: b.numPeople,
                    startDate: b.startDate,
                    createdAt: b.createdAt,
                    bookerName,
                    bookerEmail: b.user?.email || '',
                };
            });

        // ── Upcoming events ───────────────────────────────────
        const upcomingEvents = events
            .filter(e => e.status === 'published' && new Date(e.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3)
            .map(e => ({
                id: e._id.toString(),
                title: e.title,
                date: e.date,
                location: e.location,
                totalSlots: e.totalSlots,
                bookedSlots: e.bookedSlots,
                pricePerSlot: e.pricePerSlot,
                poster: e.poster,
            }));

        return NextResponse.json({
            success: true,
            data: {
                profile: {
                    id: guideId,
                    name: guide?.username || '',
                    companyName: details?.companyname || '',
                    logo: details?.logo || '',
                    bio: details?.bio || '',
                    speciality: details?.speciality || '',
                    memberSince: guide?.createdAt,
                    applicationStatus: guide?.applicationStatus,
                    pausedServices: details?.pausedServices || { trip: false, trek: false, event: false },
                },
                stats: {
                    totalBookings30,
                    bookingChangePct,
                    earningsLast30,
                    earningsChangePct,
                    activePackages,
                    totalPackages,
                    publishedEvents,
                    totalEvents,
                    totalTripBookings: tripBookings.length,
                    totalTrekBookings: trekBookings.length,
                    confirmedBookings: allBookings.filter(b => b.status === 'confirmed').length,
                    pendingBookings: allBookings.filter(b => b.status === 'pending').length,
                    cancelledBookings: allBookings.filter(b => ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status)).length,
                    totalRevenue: allBookings.filter(isDeposited).reduce((s, b) => s + (b.totalAmount || 0), 0),
                },
                charts: {
                    timelines: chartTimelines,
                    pipeline,
                },
                recentBookings,
                upcomingEvents,
            },
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
