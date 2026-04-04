import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { UserNotification } from '@/models/usernotification.model';

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        let dbNotifications = await UserNotification.find({ userId: user.userId })
            .sort({ createdAt: -1 })
            .lean();
            
        // Map _id to id and createdAt to date for frontend compatibility
        const mapped = dbNotifications.map(n => ({
            ...n,
            id: n._id.toString(),
            date: n.createdAt
        }));

        return NextResponse.json({ success: true, notifications: mapped });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') return NextResponse.json({ success: false }, { status: 401 });
        
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        await dbConnect();
        if (id) {
            await UserNotification.findOneAndUpdate({ _id: id, userId: user.userId }, { read: true });
        } else {
            await UserNotification.updateMany({ userId: user.userId }, { read: true });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') return NextResponse.json({ success: false }, { status: 401 });
        
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        await dbConnect();
        if (id) {
            await UserNotification.findOneAndDelete({ _id: id, userId: user.userId });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
