import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/user.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const query = { role: 'user' };
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, users });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
