import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';

export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const { id } = await params;
        await dbConnect();
        const story = await Story.findByIdAndUpdate(
            id,
            { $inc: { likes: 1 } },
            { new: true }
        );
        if (!story) return NextResponse.json({ success: false }, { status: 404 });
        return NextResponse.json({ success: true, data: story }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
