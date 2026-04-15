import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, context) {
    try {
        await dbConnect();
        
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        const decoded = { userId: user.userId };
        const { id, commentId } = await context.params;

        const story = await Story.findById(id);
        if (!story) return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });

        const comment = story.comments.id(commentId);
        if (!comment) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });

        const hasLiked = comment.likes.some(likeId => likeId.toString() === decoded.userId);
        
        if (hasLiked) {
            comment.likes.pull(decoded.userId);
        } else {
            comment.likes.push(decoded.userId);
        }

        await story.save();
        return NextResponse.json({ 
            success: true, 
            liked: !hasLiked,
            likes: comment.likes.length 
        });
    } catch (error) {
        console.error('Comment like error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
