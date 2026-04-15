import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { text, parentId } = body;
        
        if (!text || text.trim() === '') {
            return NextResponse.json({ success: false, message: 'Comment text is required' }, { status: 400 });
        }

        const { id } = await params;
        await dbConnect();
        
        const story = await Story.findById(id);
        if (!story) return NextResponse.json({ success: false }, { status: 404 });
        
        let commenterName = user.name || user.username || user.firstName || user.email?.split('@')[0] || 'Traveler';
        let commenterPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(commenterName)}&background=10b981&color=fff`;
        let isVerifiedProvider = false;
        let providerId = '';
        let providerLogo = '';

        // Check if this is the official bagspackgo account
        const isOfficial = user.email === 'bagspackgo01@gmail.com';

        if (isOfficial) {
            commenterName = 'bagspackgo';
            commenterPhoto = '/favicon.ico';
        } else if (user.role === 'provider') {
            // Check if this provider is approved and fetch their company details
            const guideDetails = await GuideDetails.findOne({ 
                guide: user.userId, 
                status: 'approved' 
            }).select('companyname logo guide').lean();

            if (guideDetails) {
                isVerifiedProvider = true;
                providerId = guideDetails.guide?.toString() || '';
                providerLogo = guideDetails.logo || '';
                commenterName = guideDetails.companyname;
                commenterPhoto = guideDetails.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideDetails.companyname)}&background=10b981&color=fff`;
            }
        }

        const newComment = {
            user: user.userId,
            name: commenterName,
            photo: commenterPhoto,
            text: text.trim(),
            parentId: parentId || null,
            isVerifiedProvider,
            providerId,
            providerLogo,
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
