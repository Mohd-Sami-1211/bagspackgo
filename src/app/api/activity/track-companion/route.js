import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { CompanionVisit } from '@/models/companionvisit.model';
import { User } from '@/models/user.model';

/**
 * POST /api/activity/track-companion
 * Records or updates a user's visit to the companion section.
 * Fire-and-forget from the client.
 */
export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();

        // Only track authenticated users with role 'user'
        if (!currentUser || currentUser.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { heartbeat } = await req.json();

        await dbConnect();

        // Fetch user details for the snapshot
        const user = await User.findById(currentUser.userId).select('username email phone').lean();
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const snapshot = {
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
        };

        const updateDoc = heartbeat
            ? {
                  $set: {
                      lastVisitedAt: new Date(),
                      userSnapshot: snapshot,
                  },
              }
            : {
                  $inc: { visitCount: 1 },
                  $set: {
                      lastVisitedAt: new Date(),
                      userSnapshot: snapshot,
                  },
              };

        // Upsert based on the user ID
        await CompanionVisit.findOneAndUpdate(
            { user: currentUser.userId },
            updateDoc,
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Activity Track Companion] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
