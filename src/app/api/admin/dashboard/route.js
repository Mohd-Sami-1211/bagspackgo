import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Event } from '@/models/event.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Support } from '@/models/support.model';
import { AdminNotification } from '@/models/adminnotification.model';
import { Package } from '@/models/package.model';

/**
 * GET /api/admin/dashboard
 * Returns all stats, charts data, and quick lists for the dashboard.
 */
export async function GET() {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // ── Core Stats ──────────────────────────────────────
        const [totalUsers, totalProviders, totalTripBookings, totalTrekBookings,
            pendingApplications, unresolvedSupport, unreadNotifications] = await Promise.all([
            User.countDocuments({}),
            Guide.countDocuments({}),
            TripBooking.countDocuments({ status: { $ne: 'pending' } }),
            TrekBooking.countDocuments({ status: { $ne: 'pending' } }),
            GuideDetails.countDocuments({ status: 'pending' }),
            Support.countDocuments({ status: { $in: ['pending', 'in-progress'] } }),
            AdminNotification.countDocuments({ isRead: false }),
        ]);

        // ── Revenue This Month ───────────────────────────────
        const [tripRevThisMonth, trekRevThisMonth] = await Promise.all([
            TripBooking.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            TrekBooking.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
        ]);
        const revenueThisMonth = (tripRevThisMonth[0]?.total || 0) + (trekRevThisMonth[0]?.total || 0);

        // ── Monthly Bookings Chart (last 6 months) ───────────
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const [tripMonthly, trekMonthly] = await Promise.all([
            TripBooking.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            TrekBooking.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
        ]);

        // ── Booking Status Breakdown ─────────────────────────
        const [tripStatus, trekStatus] = await Promise.all([
            TripBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            TrekBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        ]);

        const statusMap = {};
        [...tripStatus, ...trekStatus].forEach(s => {
            statusMap[s._id] = (statusMap[s._id] || 0) + s.count;
        });

        // ── Recent items ─────────────────────────────────────
        const [recentApplications, recentSupport, recentTripBookings] = await Promise.all([
            GuideDetails.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).lean(),
            Support.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).lean(),
            TripBooking.find({ status: { $ne: 'pending' } }).sort({ createdAt: -1 }).limit(5).populate('user', 'username email').populate('package', 'name').lean(),
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers, totalProviders,
                totalBookings: totalTripBookings + totalTrekBookings,
                revenueThisMonth,
                pendingApplications,
                unresolvedSupport,
                unreadNotifications,
            },
            charts: {
                monthlyBookings: { trips: tripMonthly, treks: trekMonthly },
                statusBreakdown: statusMap,
            },
            recent: {
                applications: recentApplications,
                support: recentSupport,
                bookings: recentTripBookings,
            }
        });
    } catch (err) {
        console.error('[Dashboard Error]', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
