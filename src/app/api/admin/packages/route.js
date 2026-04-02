import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Package } from '@/models/package.model';
import { Event } from '@/models/event.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        // 1. Fetch Packages (Trips / Treks)
        const pkgMatch = {};
        if (search) pkgMatch.name = { $regex: search, $options: 'i' };
        let packages = await Package.find(pkgMatch).populate('guide', 'username email').sort({ createdAt: -1 }).lean();

        // 2. Fetch Events
        const evtMatch = {};
        if (search) evtMatch.title = { $regex: search, $options: 'i' };
        let events = await Event.find(evtMatch).populate('guide', 'username email').sort({ createdAt: -1 }).lean();

        // Normalize
        const normalizedPackages = packages.map(p => ({
            _id: p._id,
            type: p.category || 'package',
            title: p.name,
            destination: p.destination,
            status: p.status,
            guide: p.guide,
            createdAt: p.createdAt,
            model: 'Package'
        }));

        const normalizedEvents = events.map(e => ({
            _id: e._id,
            type: 'event',
            title: e.title,
            destination: e.location,
            status: e.status,
            guide: e.guide,
            createdAt: e.createdAt,
            model: 'Event'
        }));

        let all = [...normalizedPackages, ...normalizedEvents];
        // Sort by date newest
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({ success: true, items: all });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
