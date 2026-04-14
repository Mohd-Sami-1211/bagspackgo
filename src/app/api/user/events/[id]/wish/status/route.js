import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Wish } from '@/models/wish.model';

/**
 * GET /api/user/events/[id]/wish/status
 * Check if the current user has wished for this event
 */
export async function GET(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id: eventId } = await params;
        
        await dbConnect();

        const wish = await Wish.findOne({ event: eventId, user: user.userId });
        
        return NextResponse.json({
            success: true,
            isWished: !!wish
        });

    } catch (error) {
        console.error('Error checking wish status:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to check wish status' },
            { status: 500 }
        );
    }
}
