import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Simulating actual database notifications for user
        const dummyNotifications = [
           { id: 1, title: 'Welcome to Bagspackgo!', message: 'Explore the best travel packages and start planning your next adventure today.', type: 'info', date: new Date().toISOString(), read: false },
           { id: 2, title: 'Profile Updated', message: 'Your profile details have been successfully updated.', type: 'success', date: new Date(Date.now() - 86400000).toISOString(), read: true }
        ];

        return NextResponse.json({ success: true, notifications: dummyNotifications });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
    }
}
