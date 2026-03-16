import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Support } from '@/models/support.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const side = searchParams.get('side') || 'all'; // user, provider, all
        const search = searchParams.get('search') || '';

        const filter = {};
        if (side !== 'all') filter.side = side;
        if (search) {
            filter.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { ticketNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const supportTickets = await Support.find(filter)
            .populate('provider', 'username email')
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .lean();

        // Normalize
        const formatted = supportTickets.map(t => ({
            ...t,
            sender: t.side === 'provider' ? t.provider : t.user,
            senderEmail: t.senderEmail || (t.side === 'provider' ? t.provider?.email : t.user?.email),
            phone: t.phone || 'N/A'
        }));

        return NextResponse.json({ success: true, support: formatted });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
