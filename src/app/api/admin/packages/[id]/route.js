import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Package } from '@/models/package.model';
import { Event } from '@/models/event.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { status, model } = await req.json();
        
        // 'published', 'inactive', 'draft' etc
        let doc;
        if (model === 'Package') {
            doc = await Package.findByIdAndUpdate(params.id, { status }, { new: true });
        } else if (model === 'Event') {
            doc = await Event.findByIdAndUpdate(params.id, { status }, { new: true });
        }
        
        if (!doc) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, item: { _id: doc._id, status: doc.status } });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { searchParams } = new URL(req.url);
        const model = searchParams.get('model');
        
        let doc;
        if (model === 'Package') {
            doc = await Package.findByIdAndDelete(params.id);
        } else if (model === 'Event') {
            doc = await Event.findByIdAndDelete(params.id);
        }

        if (!doc) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
