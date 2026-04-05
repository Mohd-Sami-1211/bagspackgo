import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        
        // Match user ID to see if they've toggled the like
        const user = await getCurrentUser();
        const currentUserId = user?.userId?.toString() || null;
        
        const stories = await Story.find({}).sort({ createdAt: -1 });
        
        const mappedStories = stories.map(s => {
            const obj = s.toObject();
            return {
                ...obj,
                likes: obj.likes?.length || 0,
                liked: currentUserId ? obj.likes?.some(id => id.toString() === currentUserId) : false,
                comments: obj.comments?.length || 0,
                commentsArray: obj.comments || []
            };
        });
        
        return NextResponse.json({ success: true, data: mappedStories }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Attempt to associate with logged in user if available
        const user = await getCurrentUser();
        if (user && user.role === 'user') {
            body.userId = user.userId;
        }

        await dbConnect();
        const story = await Story.create(body);
        
        const mappedStory = {
            ...story.toObject(),
            likes: 0,
            liked: false,
            comments: 0,
            commentsArray: []
        };
        
        return NextResponse.json({ success: true, data: mappedStory }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
