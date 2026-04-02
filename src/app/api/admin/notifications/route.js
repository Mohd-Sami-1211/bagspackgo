import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { AdminNotification } from '@/models/adminnotification.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const notifications = await AdminNotification.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({ success: true, notifications });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
