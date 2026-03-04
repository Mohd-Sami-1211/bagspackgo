import dbConnect from '@/lib/db';
import Review from '@/models/review.model';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: reviews }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        await dbConnect();
        const review = await Review.create(body);
        return NextResponse.json({ success: true, data: review }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
