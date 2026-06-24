import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Package } from '@/models/package.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';

export const dynamic = 'force-dynamic';

function windowToLookbackDays(windowKey) {
  return { '1D': 1, '1W': 7, '1M': 28, '3M': 92, '6M': 183 }[windowKey] ?? 28;
}

function buildChartData(bookings, windowKey) {
  const now = new Date();
  const isCancelled = (s) =>
    s === 'cancelled' || s === 'cancellation_requested' || s === 'refund_initiated';

  const sum = (list) =>
    Math.round(
      list
        .filter((b) => !isCancelled(b.status))
        .reduce((acc, b) => acc + (b.totalAmount || 0), 0) / 1000
    );

  if (windowKey === '1D') {
    return Array.from({ length: 24 }, (_, i) => {
      const h = 23 - i;
      const start = new Date(now);
      start.setHours(now.getHours() - h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      const hh = start.getHours();
      const label = hh === 0 ? '12a' : hh < 12 ? `${hh}a` : hh === 12 ? '12p' : `${hh - 12}p`;
      return {
        name: label,
        value: sum(bookings.filter((b) => {
          const d = new Date(b.createdAt);
          return d >= start && d < end;
        })),
      };
    });
  }

  if (windowKey === '1W') {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const start = new Date(now);
      start.setDate(now.getDate() - offset);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      return {
        name: start.toLocaleDateString('en-IN', { weekday: 'short' }),
        value: sum(bookings.filter((b) => {
          const d = new Date(b.createdAt);
          return d >= start && d < end;
        })),
      };
    });
  }

  if (windowKey === '1M') {
    return Array.from({ length: 4 }, (_, i) => {
      const w = 3 - i;
      const start = new Date(now);
      start.setDate(now.getDate() - (w + 1) * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);
      end.setHours(23, 59, 59, 999);
      return {
        name: `Wk ${i + 1}`,
        value: sum(bookings.filter((b) => {
          const d = new Date(b.createdAt);
          return d >= start && d < end;
        })),
      };
    });
  }

  const months = windowKey === '3M' ? 3 : 6;
  return Array.from({ length: months }, (_, i) => {
    const offset = months - 1 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    return {
      name: start.toLocaleString('default', { month: 'short' }),
      value: sum(bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d >= start && d < end;
      })),
    };
  });
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const chartWindow = searchParams.get('window') || '1M';
    const guideId = user.userId;

    const chartLookback = new Date();
    chartLookback.setDate(chartLookback.getDate() - windowToLookbackDays(chartWindow));

    const providerPackages = await Package.find({ provider: guideId }).select('_id').lean();
    const packageIds = providerPackages.map((p) => p._id);

    const bookingQuery = packageIds.length > 0
      ? { $or: [{ package: { $in: packageIds } }, { provider: guideId }], status: { $ne: 'pending' } }
      : { provider: guideId, status: { $ne: 'pending' } };

    const [chartTrips, chartTreks] = await Promise.all([
      TripBooking.find({ ...bookingQuery, createdAt: { $gte: chartLookback } })
        .select('status totalAmount createdAt')
        .lean(),
      TrekBooking.find({ ...bookingQuery, createdAt: { $gte: chartLookback } })
        .select('status totalAmount createdAt')
        .lean(),
    ]);

    const chartData = buildChartData([...chartTrips, ...chartTreks], chartWindow);

    return NextResponse.json({ success: true, data : chartData });

  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}