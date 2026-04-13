import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import { Wish } from '@/models/wish.model';

export async function GET(request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const wishes = await Wish.find()
            .populate('event', 'title destination')
            .populate('user', 'username email phone')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, items: wishes });
    } catch (error) {
        console.error('Failed to fetch wishes:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
