import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { AdminNotification } from '@/models/adminnotification.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        let notif;
        if (params.id === 'mark-all-read') {
            await AdminNotification.updateMany({ isRead: false }, { isRead: true });
        } else {
            notif = await AdminNotification.findByIdAndUpdate(params.id, { isRead: true }, { new: true });
        }

        return NextResponse.json({ success: true, notification: notif });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
