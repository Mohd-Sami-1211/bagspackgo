import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event } from '@/models/event.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { status, adminNotes } = await req.json(); // status: 'approved' | 'rejected'

        const event = await Event.findById(params.id);
        if (!event || !event.deleteRequest.requested) {
            return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
        }

        event.deleteRequest.adminStatus = status;
        event.deleteRequest.adminNotes = adminNotes || '';
        event.deleteRequest.resolvedAt = new Date();

        if (status === 'approved') {
            event.status = 'cancelled'; // or deleted
        }

        await event.save();

        return NextResponse.json({ success: true, request: {
            _id: event._id,
            model: 'Event',
            title: event.title,
            guide: event.guide, // Need populate if returning full
            deleteRequest: event.deleteRequest
        } });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
