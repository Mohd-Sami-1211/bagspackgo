import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { EventVisit } from '@/models/eventvisit.model';
import { User } from '@/models/user.model';
import { Event } from '@/models/event.model';

/**
 * POST /api/activity/track
 * Records or updates a user's visit to an event details page.
 * Fire-and-forget from the client — silently succeeds or fails.
 */
export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();

        // Only track authenticated users with role 'user'
        if (!currentUser || currentUser.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { eventId, heartbeat } = await req.json();
        if (!eventId) {
            return NextResponse.json({ success: false, message: 'eventId required' }, { status: 400 });
        }

        await dbConnect();

        // Fetch user details for the snapshot
        const user = await User.findById(currentUser.userId).select('username email phone').lean();
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Fetch event title for display
        const event = await Event.findById(eventId).select('title name').lean();
        const eventTitle = event?.title || event?.name || 'Unknown Event';

        const updateDoc = heartbeat 
            ? {
                  $set: {
                      lastVisitedAt: new Date(),
                      eventTitle,
                      userSnapshot: {
                          username: user.username || '',
                          email: user.email || '',
                          phone: user.phone || '',
                      },
                  }
              }
            : {
                  $inc: { visitCount: 1 },
                  $set: {
                      lastVisitedAt: new Date(),
                      eventTitle,
                      userSnapshot: {
                          username: user.username || '',
                          email: user.email || '',
                          phone: user.phone || '',
                      },
                  },
              };

        // Upsert: increment visitCount (if not heartbeat), update lastVisitedAt and userSnapshot
        await EventVisit.findOneAndUpdate(
            { user: currentUser.userId, event: eventId },
            updateDoc,
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Activity Track] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
