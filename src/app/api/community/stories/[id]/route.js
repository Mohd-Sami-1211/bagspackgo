import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await dbConnect();
        
        const story = await Story.findById(id);
        if (!story) return NextResponse.json({ success: false }, { status: 404 });
        
        // Allow deletion if owner OR if user is the official bagspackgo account
        const isAdmin = user.email === 'bagspackgo01@gmail.com';
        if (!isAdmin && story.userId && story.userId !== user.userId) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
        
        await Story.findByIdAndDelete(id);
        
        return NextResponse.json({ success: true, message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
