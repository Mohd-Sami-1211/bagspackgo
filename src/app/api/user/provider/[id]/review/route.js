import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Review from '@/models/review.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        await dbConnect();
        
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Provider ID' }, { status: 400 });
        }

        const session = await getCurrentUser();
        let userName = 'Traveler';
        if (session) {
            userName = session.username || session.email?.split('@')[0] || 'Traveler';
        }

        const body = await request.json();
        const { rating, comment } = body;

        if (!rating || !comment) {
            return NextResponse.json({ success: false, message: 'Rating and comment are required' }, { status: 400 });
        }

        const newReview = new Review({
            name: userName,
            content: comment,
            rating: Number(rating),
            provider: id
        });

        await newReview.save();

        // Update GuideDetails average rating
        const guideDetails = await GuideDetails.findOne({ guide: id });
        if (guideDetails) {
            const currentTotal = (guideDetails.rating || 0) * (guideDetails.reviews || 0);
            const newCount = (guideDetails.reviews || 0) + 1;
            const newAvg = (currentTotal + Number(rating)) / newCount;
            
            guideDetails.rating = Number(newAvg.toFixed(1));
            guideDetails.reviews = newCount;
            await guideDetails.save();
        }

        const reviewObj = {
            id: newReview._id.toString(),
            user: newReview.name,
            rating: newReview.rating,
            comment: newReview.content,
            date: newReview.createdAt ? new Date(newReview.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };

        return NextResponse.json({ success: true, message: 'Review added', review: reviewObj }, { status: 201 });
    } catch (error) {
        console.error('Add review error:', error);
        return NextResponse.json({ success: false, message: 'Failed to add review' }, { status: 500 });
    }
}
