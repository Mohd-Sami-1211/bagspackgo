import dbConnect from '@/lib/db';
import Review from '@/models/review.model';
import { NextResponse } from 'next/server';

export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const { id } = await params;
        await dbConnect();
        const review = await Review.findByIdAndUpdate(
            id,
            { $inc: { helpful: 1 } },
            { new: true }
        );
        if (!review) return NextResponse.json({ success: false }, { status: 404 });
        return NextResponse.json({ success: true, data: review }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
