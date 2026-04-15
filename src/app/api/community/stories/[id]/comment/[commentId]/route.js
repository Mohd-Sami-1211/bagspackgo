import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request, context) {
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

        // User can delete if they own the comment OR they own the entire post OR they are the official account
        const isCommentOwner = comment.user?.toString() === decoded.userId;
        const isPostOwner = story.userId?.toString() === decoded.userId;
        const isAdmin = user.email === 'bagspackgo01@gmail.com';

        if (!isCommentOwner && !isPostOwner && !isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized to delete this comment' }, { status: 403 });
        }

        // We pull the comment from the array. Additionally, we must pull any replies that point to this parent
        story.comments.pull(commentId);
        
        // Remove replies to this comment
        const repliesToRemove = story.comments.filter(c => c.parentId?.toString() === commentId);
        repliesToRemove.forEach(r => story.comments.pull(r._id));

        await story.save();
        return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Comment delete error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
