import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event } from '@/models/event.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET() {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const events = await Event.find({ 'deleteRequest.requested': true })
            .populate('guide', 'username email')
            .sort({ 'deleteRequest.requestedAt': -1 })
            .lean();

        // If we latter add Package deletion requests, we'd fetch those too and combine.
        // For now, it's just Events.
        const requests = events.map(e => ({
            _id: e._id,
            model: 'Event',
            title: e.title,
            guide: e.guide,
            deleteRequest: e.deleteRequest
        }));

        return NextResponse.json({ success: true, requests });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
