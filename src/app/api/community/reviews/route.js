import dbConnect from '@/lib/db';
import Review from '@/models/review.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        
        // Context to map whether auth user finds it helpful
        const user = await getCurrentUser();
        const currentUserId = user?.userId?.toString() || null;
        
        const reviews = await Review.find({ $or: [{ provider: { $exists: false } }, { provider: null }] }).sort({ createdAt: -1 });
        
        const mappedReviews = reviews.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                helpful: obj.helpful?.length || 0,
                isHelpful: currentUserId ? obj.helpful?.some(id => id.toString() === currentUserId) : false,
            };
        });
        
        return NextResponse.json({ success: true, data: mappedReviews }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        
        const user = await getCurrentUser();
        if (user) {
            body.userId = user.userId;
        }

        await dbConnect();
        const review = await Review.create(body);
        
        const mappedReview = {
            ...review.toObject(),
            helpful: 0,
            isHelpful: false
        };
        
        return NextResponse.json({ success: true, data: mappedReview }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
