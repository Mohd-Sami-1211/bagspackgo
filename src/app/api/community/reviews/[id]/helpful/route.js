import dbConnect from '@/lib/db';
import Review from '@/models/review.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await dbConnect();
        
        const review = await Review.findById(id);
        if (!review) return NextResponse.json({ success: false }, { status: 404 });
        
        const stringUserId = user.userId.toString();
        const hasVoted = review.helpful && review.helpful.some(likedId => likedId.toString() === stringUserId);
        
        if (hasVoted) {
            review.helpful = review.helpful.filter(likedId => likedId.toString() !== stringUserId);
        } else {
            review.helpful.push(user.userId);
        }
        await review.save();
        
        return NextResponse.json({ success: true, helpful: review.helpful.length, isHelpful: !hasVoted }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
