import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { OffBeatVisit } from '@/models/offbeatvisit.model';

/**
 * GET /api/admin/activity/offbeats
 * Returns all offbeat visit records from the last 24 hours.
 * Sorted by lastVisitedAt descending (most recent / most revisits at top).
 * Protected: admin only.
 */
export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        // Only fetch records from the last 24 hours
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        let query = { lastVisitedAt: { $gte: since } };

        if (search) {
            query.$or = [
                { 'userSnapshot.username': { $regex: search, $options: 'i' } },
                { 'userSnapshot.email': { $regex: search, $options: 'i' } },
                { 'userSnapshot.phone': { $regex: search, $options: 'i' } },
                { offbeatTitle: { $regex: search, $options: 'i' } },
            ];
        }

        const visits = await OffBeatVisit.find(query)
            .sort({ lastVisitedAt: -1 })
            .lean();

        return NextResponse.json({ success: true, visits, total: visits.length });
    } catch (err) {
        console.error('[Admin Offbeats Activity] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
