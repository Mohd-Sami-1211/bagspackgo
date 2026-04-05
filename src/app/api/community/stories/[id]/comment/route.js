import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { text } = body;
        
        if (!text || text.trim() === '') {
            return NextResponse.json({ success: false, message: 'Comment text is required' }, { status: 400 });
        }

        const { id } = await params;
        await dbConnect();
        
        const story = await Story.findById(id);
        if (!story) return NextResponse.json({ success: false }, { status: 404 });
        
        const newComment = {
            user: user.userId,
            name: `${user.firstName || 'Traveler'} ${user.lastName || ''}`.trim(),
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'Traveler')}&background=10b981&color=fff`,
            text: text.trim(),
            createdAt: new Date()
        };
        
        story.comments.push(newComment);
        await story.save();
        
        const savedComment = story.comments[story.comments.length - 1];
        
        return NextResponse.json({ success: true, count: story.comments.length, comment: savedComment }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
