import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import { Wish } from '@/models/wish.model';

// Update wish status (e.g., mark resolved)
export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        
        await dbConnect();
        const updated = await Wish.findByIdAndUpdate(id, { status: body.status }, { new: true }).lean();

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Wish not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, item: updated });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        
        await dbConnect();
        const deleted = await Wish.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Wish not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Wish deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
