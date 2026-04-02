import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/user.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { isActive } = await req.json();
        
        const user = await User.findByIdAndUpdate(params.id, { isActive }, { new: true });
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        return NextResponse.json({ success: true, user });
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
        
        const user = await User.findByIdAndDelete(params.id);
        if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

        // Note: For a complete system, we might also want to hard-delete or archive their bookings
        // For now, we just delete the user document
        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
