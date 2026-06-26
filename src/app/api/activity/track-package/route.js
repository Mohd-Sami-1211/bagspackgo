import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PackageVisit } from '@/models/packagevisit.model';
import { User } from '@/models/user.model';
import { Package } from '@/models/package.model';

/**
 * POST /api/activity/track-package
 * Records or updates a user's visit to a trip/trek package details page.
 * Fire-and-forget from the client — silently succeeds or fails.
 */
export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();

        // Only track authenticated users with role 'user'
        if (!currentUser || currentUser.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { packageId, heartbeat } = await req.json();
        if (!packageId) {
            return NextResponse.json({ success: false, message: 'packageId required' }, { status: 400 });
        }

        await dbConnect();

        // Fetch user details for the snapshot
        const user = await User.findById(currentUser.userId).select('username email phone').lean();
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Fetch package title for display
        const pkg = await Package.findById(packageId).select('name destination').lean();
        const packageTitle = pkg?.name || 'Unknown Package';

        const snapshot = {
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
        };

        const updateDoc = heartbeat
            ? {
                  $set: {
                      lastVisitedAt: new Date(),
                      packageTitle,
                      userSnapshot: snapshot,
                  },
              }
            : {
                  $inc: { visitCount: 1 },
                  $set: {
                      lastVisitedAt: new Date(),
                      packageTitle,
                      userSnapshot: snapshot,
                  },
              };

        // Upsert: increment visitCount (if not heartbeat), update lastVisitedAt and userSnapshot
        await PackageVisit.findOneAndUpdate(
            { user: currentUser.userId, package: packageId },
            updateDoc,
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Activity Track Package] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
