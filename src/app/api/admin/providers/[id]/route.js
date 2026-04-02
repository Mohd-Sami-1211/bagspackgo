import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { isActive } = await req.json();
        
        const provider = await Guide.findByIdAndUpdate(params.id, { isActive }, { new: true });
        if (!provider) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

        return NextResponse.json({ success: true, provider });
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
        
        const provider = await Guide.findByIdAndDelete(params.id);
        if (!provider) return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });

        // Would also need to delete packages, guide details, etc in a robust system
        return NextResponse.json({ success: true, message: 'Provider deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
