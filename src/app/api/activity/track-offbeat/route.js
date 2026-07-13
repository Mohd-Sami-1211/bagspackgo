import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { OffBeatVisit } from '@/models/offbeatvisit.model';
import { User } from '@/models/user.model';
import { OffBeat } from '@/models/offbeat.model';

export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();

        // Only track authenticated users
        if (!currentUser || currentUser.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const { offbeatId, heartbeat } = await req.json();
        if (!offbeatId) {
            return NextResponse.json({ success: false, message: 'offbeatId required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(currentUser.userId).select('username email phone').lean();
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const offbeat = await OffBeat.findById(offbeatId).select('title').lean();
        const offbeatTitle = offbeat?.title || 'Unknown OffBeat';

        const updateDoc = heartbeat 
            ? {
                  $set: {
                      lastVisitedAt: new Date(),
                      offbeatTitle,
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
                      offbeatTitle,
                      userSnapshot: {
                          username: user.username || '',
                          email: user.email || '',
                          phone: user.phone || '',
                      },
                  },
              };

        await OffBeatVisit.findOneAndUpdate(
            { user: currentUser.userId, offbeat: offbeatId },
            updateDoc,
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Activity Track] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
