import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const stories = await Story.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: stories }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        await dbConnect();
        const story = await Story.create(body);
        return NextResponse.json({ success: true, data: story }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
