import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Support } from '@/models/support.model';

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const queries = await Support.find({ user: user.userId, side: 'user' }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, queries });
    } catch (error) {
        console.error("Fetch support error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, phone, subject, message } = body;

        if (!type) {
            return NextResponse.json({ success: false, message: "Request type is required" }, { status: 400 });
        }

        await dbConnect();

        const query = await Support.create({
            side: 'user',
            user: user.userId,
            senderEmail: user.email || '',
            type,
            phone: phone || '',
            subject: subject || '',
            message: message || '',
            status: 'pending'
        });

        return NextResponse.json({ success: true, query });
    } catch (error) {
        console.error("Create support error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
