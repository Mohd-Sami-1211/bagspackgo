import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Wish } from '@/models/wish.model';

/**
 * POST /api/user/events/[id]/wish
 * Create a wish for a sold-out event
 */
export async function POST(request, { params }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id: eventId } = await params;
        
        await dbConnect();

        // Check if a wish already exists for this user and event
        const existingWish = await Wish.findOne({ event: eventId, user: user.userId });
        if (existingWish) {
            return NextResponse.json(
                { success: false, message: 'You have already wished for this event.' },
                { status: 400 }
            );
        }

        const wish = new Wish({
            event: eventId,
            user: user.userId,
            status: 'pending'
        });

        await wish.save();

        return NextResponse.json({
            success: true,
            message: 'Wish submitted successfully',
            wish
        });

    } catch (error) {
        console.error('Error creating wish:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to submit wish' },
            { status: 500 }
        );
    }
}
