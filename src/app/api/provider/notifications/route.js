import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Guide } from '@/models/guide.model';
import { ProviderNotification } from '@/models/providernotification.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Event } from '@/models/event.model';
import { User } from '@/models/user.model';

export const dynamic = 'force-dynamic';

/**
 * Sync new bookings/events into the notifications table so the provider
 * always sees up-to-date notifications even without a webhook.
 */
async function syncNotifications(guide) {
  const providerId = guide._id;

  // ── Trip bookings ─────────────────────────────────────────
  const tripBookings = await TripBooking.find({ provider: providerId })
    .populate('user', 'name email')
    .lean();

  for (const b of tripBookings) {
    // Only notify for confirmed or cancelled bookings
    if (b.status !== 'confirmed' && b.status !== 'cancelled') continue;

    const refId = `${b._id.toString()}_${b.status}`;
    const exists = await ProviderNotification.exists({ provider: providerId, refId, type: 'trip_booking' });
    if (!exists) {
      const userName = b.user?.name || 'A traveller';
      const pkgName  = b.packageSnapshot?.name || 'a trip package';

      let title, message;
      if (b.status === 'cancelled') {
        title   = 'Trip booking cancelled';
        message = `${userName} cancelled their booking for ${pkgName}.`;
      } else {
        title   = 'New trip booking received';
        message = `${userName} booked ${pkgName}. Ref: ${b.bookingRef}`;
      }

      await ProviderNotification.create({
        provider: providerId, type: 'trip_booking',
        title, message, refId, refType: 'TripBooking',
      });
    }
  }

  // ── Trek bookings ─────────────────────────────────────────
  const trekBookings = await TrekBooking.find({ provider: providerId })
    .populate('user', 'name email')
    .lean();

  for (const b of trekBookings) {
    // Only notify for confirmed or cancelled bookings
    if (b.status !== 'confirmed' && b.status !== 'cancelled') continue;

    const refId = `${b._id.toString()}_${b.status}`;
    const exists = await ProviderNotification.exists({ provider: providerId, refId, type: 'trek_booking' });
    if (!exists) {
      const userName = b.user?.name || 'A traveller';
      const pkgName  = b.packageSnapshot?.name || 'a trek package';

      let title, message;
      if (b.status === 'cancelled') {
        title   = 'Trek booking cancelled';
        message = `${userName} cancelled their trek booking for ${pkgName}.`;
      } else {
        title   = 'New trek booking received';
        message = `${userName} booked ${pkgName}. Ref: ${b.bookingRef}`;
      }

      await ProviderNotification.create({
        provider: providerId, type: 'trek_booking',
        title, message, refId, refType: 'TrekBooking',
      });
    }
  }


  // ── Events ────────────────────────────────────────────────
  const events = await Event.find({ guide: providerId }).lean();
  for (const ev of events) {
    const refId = `event_${ev._id.toString()}`;
    const exists = await ProviderNotification.exists({ provider: providerId, refId, type: 'event' });
    if (!exists) {
      await ProviderNotification.create({
        provider: providerId, type: 'event',
        title:   'Event published',
        message: `Your event "${ev.title}" went live and is now visible to travellers.`,
        refId, refType: 'Event',
      });
    }
  }
}

// GET /api/provider/notifications
export async function GET(req) {
  try {
    await dbConnect();
    const user  = await getCurrentUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const guide = await Guide.findById(user.userId).lean();
    if (!guide) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

    // Sync latest bookings / events into the notifications store
    await syncNotifications(guide);

    // Fetch latest 50 notifications
    const notifications = await ProviderNotification.find({ provider: guide._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await ProviderNotification.countDocuments({ provider: guide._id, read: false });

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        id:        n._id.toString(),
        type:      n.type,
        title:     n.title,
        message:   n.message,
        read:      n.read,
        refId:     n.refId,
        refType:   n.refType,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (err) {
    console.error('[notifications GET]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/provider/notifications — mark one or all as read
export async function PATCH(req) {
  try {
    await dbConnect();
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const guide = await Guide.findById(user.userId).lean();
    if (!guide) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    if (body.markAllRead) {
      await ProviderNotification.updateMany({ provider: guide._id, read: false }, { $set: { read: true } });
    } else if (body.id) {
      await ProviderNotification.findOneAndUpdate(
        { _id: body.id, provider: guide._id },
        { $set: { read: true } },
      );
    }

    const unreadCount = await ProviderNotification.countDocuments({ provider: guide._id, read: false });
    return NextResponse.json({ success: true, unreadCount });
  } catch (err) {
    console.error('[notifications PATCH]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
