import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { AdminNotification } from '@/models/adminnotification.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Support } from '@/models/support.model';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { Event } from '@/models/event.model';

/**
 * GET /api/admin/notifications/counts
 * Returns badge counts for sidebar labels
 */
export async function GET() {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false }, { status: 401 });

        await connectDB();

        const [notifications, applications, requests, support] = await Promise.all([
            AdminNotification.countDocuments({ isRead: false }),
            GuideDetails.countDocuments({ status: 'pending' }),
            Event.countDocuments({ 'deleteRequest.requested': true, 'deleteRequest.adminStatus': 'pending' }),
            Support.countDocuments({ status: 'pending' }),
        ]);

        return NextResponse.json({ success: true, counts: { notifications, applications, requests, support } });
    } catch (err) {
        console.error('[Counts Error]', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
