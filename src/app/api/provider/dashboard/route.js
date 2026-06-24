import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Event } from '@/models/event.model';
import { Package } from '@/models/package.model';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'provider') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const guideId = user.userId;

    const now = new Date();
    const startOf30Days = new Date(now);
    startOf30Days.setDate(now.getDate() - 30);

    const startOfPrev30 = new Date(startOf30Days);
    startOfPrev30.setDate(startOfPrev30.getDate() - 30);

    // 1. Fetch Profile & Package Info
    const [guide, details, providerPackages, events] = await Promise.all([
      Guide.findById(guideId).select('username email applicationStatus createdAt').lean(),
      GuideDetails.findOne({ guide: guideId }).select('companyname logo bio speciality pausedServices').lean(),
      Package.find({ provider: guideId }).select('_id status').lean(),
      Event.find({ guide: guideId }).select('_id title date location totalSlots bookedSlots pricePerSlot poster status').lean(),
    ]);

    const packageIds = providerPackages.map((p) => p._id);
    const bookingQuery = packageIds.length > 0
      ? { $or: [{ package: { $in: packageIds } }, { provider: guideId }], status: { $ne: 'pending' } }
      : { provider: guideId, status: { $ne: 'pending' } };

    const statsPipeline = [
      { $match: bookingQuery },
      { $facet: {
          lifetime: [
            { $group: {
                _id: null,
                total: { $sum: 1 },
                confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $in: ['$status', ['cancelled', 'cancellation_requested', 'refund_initiated']] }, 1, 0] } },
                revenue: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $eq: ['$providerPaymentStatus', 'completed'] },
                        { $not: { $in: ['$status', ['cancelled', 'cancellation_requested', 'refund_initiated']] } },
                      ]}, '$totalAmount', 0,
                    ],
                  },
                },
            }},
          ],
          last30: [
            { $match: { createdAt: { $gte: startOf30Days } } },
            { $group: {
                _id: null, count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $eq: ['$providerPaymentStatus', 'completed'] },
                        { $not: { $in: ['$status', ['cancelled', 'cancellation_requested', 'refund_initiated']] } },
                      ]}, '$totalAmount', 0,
                    ],
                  },
                },
            }},
          ],
          prev30: [
            { $match: { createdAt: { $gte: startOfPrev30, $lt: startOf30Days } } },
            { $group: {
                _id: null, count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $and: [
                        { $eq: ['$providerPaymentStatus', 'completed'] },
                        { $not: { $in: ['$status', ['cancelled', 'cancellation_requested', 'refund_initiated']] } },
                      ]}, '$totalAmount', 0,
                    ],
                  },
                },
            }},
          ],
      }},
    ];

    const BOOKING_SELECT = 'status totalAmount createdAt providerPaymentStatus startDate numPeople bookingRef peopleRange package';

    const [
      tripStatsAgg, trekStatsAgg,
      recentTrips, recentTreks,
    ] = await Promise.all([
      TripBooking.aggregate(statsPipeline),
      TrekBooking.aggregate(statsPipeline),
      TripBooking.find(bookingQuery).sort({ createdAt: -1 }).limit(8).select(BOOKING_SELECT).populate('user', 'username email').lean(),
      TrekBooking.find(bookingQuery).sort({ createdAt: -1 }).limit(8).select(BOOKING_SELECT).populate('user', 'username email').lean(),
    ]);

    const extractStats = (agg) => {
      const res = agg[0] || { lifetime: [], last30: [], prev30: [] };
      return {
        life: res.lifetime[0] || { total: 0, confirmed: 0, cancelled: 0, revenue: 0 },
        l30:  res.last30[0]   || { count: 0, revenue: 0 },
        p30:  res.prev30[0]   || { count: 0, revenue: 0 },
      };
    };

    const tripStats = extractStats(tripStatsAgg);
    const trekStats = extractStats(trekStatsAgg);

    const totalBookings30   = tripStats.l30.count   + trekStats.l30.count;
    const totalBookingsPrev = tripStats.p30.count   + trekStats.p30.count;
    const earningsLast30    = tripStats.l30.revenue + trekStats.l30.revenue;
    const earningsPrev30    = tripStats.p30.revenue + trekStats.p30.revenue;

    const bookingChangePct = totalBookingsPrev > 0
      ? Math.round(((totalBookings30 - totalBookingsPrev) / totalBookingsPrev) * 100)
      : (totalBookings30 > 0 ? 100 : 0);

    const earningsChangePct = earningsPrev30 > 0
      ? Math.round(((earningsLast30 - earningsPrev30) / earningsPrev30) * 100)
      : (earningsLast30 > 0 ? 100 : 0);

    const recentBookings = [...recentTrips, ...recentTreks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map((b) => ({
        id:           b._id.toString(),
        bookingRef:   b.bookingRef || '',
        type:         b.peopleRange ? 'Trek' : 'Trip',
        amount:       b.totalAmount || 0,
        status:       b.status,
        numPeople:    b.numPeople,
        startDate:    b.startDate,
        createdAt:    b.createdAt,
        bookerName:   b.user?.username || 'Guest',
        bookerEmail:  b.user?.email || '',
      }));

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id:                guideId,
          name:              guide?.username || '',
          companyName:       details?.companyname || '',
          logo:              details?.logo || '',
          bio:               details?.bio || '',
          speciality:        details?.speciality || '',
          memberSince:       guide?.createdAt,
          applicationStatus: guide?.applicationStatus,
          pausedServices:    details?.pausedServices || { trip: false, trek: false, event: false },
        },
        stats: {
          totalBookings30,
          bookingChangePct,
          earningsLast30,
          earningsChangePct,
          activePackages:    providerPackages.filter((p) => p.status === 'active').length,
          totalPackages:     providerPackages.length,
          publishedEvents:   events.filter((e) => e.status === 'published').length,
          totalEvents:       events.length,
          totalTripBookings: tripStats.life.total,
          totalTrekBookings: trekStats.life.total,
          confirmedBookings: tripStats.life.confirmed + trekStats.life.confirmed,
          cancelledBookings: tripStats.life.cancelled + trekStats.life.cancelled,
          totalRevenue:      tripStats.life.revenue   + trekStats.life.revenue,
        },
        pipeline: [
          { name: 'Trips',  scheduled: tripStats.life.confirmed,                        pending: 0 },
          { name: 'Treks',  scheduled: trekStats.life.confirmed,                        pending: 0 },
          { name: 'Events', scheduled: events.filter((e) => e.bookedSlots > 0).length,  pending: 0 },
        ],
        recentBookings,
        upcomingEvents: events
          .filter((e) => e.status === 'published' && new Date(e.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3)
          .map((e) => ({
            id:           e._id.toString(),
            title:        e.title,
            date:         e.date,
            location:     e.location,
            totalSlots:   e.totalSlots,
            bookedSlots:  e.bookedSlots,
            pricePerSlot: e.pricePerSlot,
            poster:       e.poster,
          })),
      },
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 });
  }
}