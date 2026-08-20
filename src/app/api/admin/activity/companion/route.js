import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { CompanionVisit } from '@/models/companionvisit.model';

/**
 * GET /api/admin/activity/companion
 * Returns all companion page visit records from the last 24 hours.
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

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        let query = { lastVisitedAt: { $gte: since } };

        if (search) {
            query.$or = [
                { 'userSnapshot.username': { $regex: search, $options: 'i' } },
                { 'userSnapshot.email': { $regex: search, $options: 'i' } },
                { 'userSnapshot.phone': { $regex: search, $options: 'i' } },
            ];
        }

        const rawVisits = await CompanionVisit.find(query)
            .sort({ lastVisitedAt: -1 })
            .lean();

        // Inject titles for UI parity with other visits
        const visits = rawVisits.map(v => ({
            ...v,
            companionTitle: 'Companion Page',
        }));

        return NextResponse.json({ success: true, visits, total: visits.length });
    } catch (err) {
        console.error('[Admin Companion Activity] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
