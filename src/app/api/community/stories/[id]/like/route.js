import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await dbConnect();
        
        const story = await Story.findById(id);
        if (!story) return NextResponse.json({ success: false }, { status: 404 });
        
        const stringUserId = user.userId.toString();
        const hasLiked = story.likes && story.likes.some(likedId => likedId.toString() === stringUserId);
        
        if (hasLiked) {
            story.likes = story.likes.filter(likedId => likedId.toString() !== stringUserId);
        } else {
            story.likes.push(user.userId);
        }
        await story.save();
        
        return NextResponse.json({ success: true, likes: story.likes.length, isLiked: !hasLiked }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
