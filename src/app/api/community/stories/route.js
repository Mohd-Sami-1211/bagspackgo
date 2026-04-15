import dbConnect from '@/lib/db';
import Story from '@/models/story.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        
        // Match user ID to see if they've toggled the like
        const user = await getCurrentUser();
        const currentUserId = user?.userId?.toString() || null;
        
        const stories = await Story.find({}).sort({ createdAt: -1 });

        // Retrieve all approved providers to patch old stories dynamically
        const approvedProviders = await GuideDetails.find({ status: 'approved' }).select('guide companyname logo').lean();
        const providerMap = new Map();
        approvedProviders.forEach(p => {
            if (p.guide) providerMap.set(p.guide.toString(), p);
        });
        
        const mappedStories = stories.map(s => {
            const obj = s.toObject();
            // Normalize media: ensure it's always an array
            let media = obj.media;
            if (media && !Array.isArray(media)) media = [media];
            if (!media) media = [];

            // Patch story with provider details retroactively if applicable
            if (obj.userId && providerMap.has(obj.userId.toString())) {
                const pInfo = providerMap.get(obj.userId.toString());
                obj.isVerifiedProvider = true;
                obj.providerId = pInfo.guide.toString();
                obj.providerLogo = pInfo.logo || '';
                obj.name = pInfo.companyname;
                // Leave handle and photo as they might be mapped or just fallback on frontend
            }
            
            const mappedComments = (obj.comments || []).map(c => {
                const commentUserStr = c.user?.toString();
                let cVProvider = c.isVerifiedProvider;
                let cPId = c.providerId;
                let cName = c.name;

                if (commentUserStr && providerMap.has(commentUserStr)) {
                    const pInfo = providerMap.get(commentUserStr);
                    cVProvider = true;
                    cPId = pInfo.guide.toString();
                    cName = pInfo.companyname;
                }

                return {
                    ...c,
                    name: cName,
                    isVerifiedProvider: cVProvider,
                    providerId: cPId,
                    likesCount: c.likes?.length || 0,
                    liked: currentUserId ? c.likes?.some(id => id.toString() === currentUserId) : false
                };
            });

            return {
                ...obj,
                media,
                likes: obj.likes?.length || 0,
                liked: currentUserId ? obj.likes?.some(id => id.toString() === currentUserId) : false,
                comments: obj.comments?.length || 0,
                commentsArray: mappedComments
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
        if (user) {
            body.userId = user.userId;

            // Check if this is the official bagspackgo account
            if (user.email === 'bagspackgo01@gmail.com') {
                body.name = 'bagspackgo';
                body.handle = '@bagspackgo';
                body.photo = '/favicon.ico';
            }

            // Check if logged-in user is an approved service provider
            if (user.role === 'provider') {
                await dbConnect();
                const guideDetails = await GuideDetails.findOne({ 
                    guide: user.userId, 
                    status: 'approved' 
                }).select('companyname logo guide').lean();

                if (guideDetails) {
                    body.isVerifiedProvider = true;
                    body.providerId = guideDetails.guide?.toString() || '';
                    body.providerLogo = guideDetails.logo || '';
                    body.name = guideDetails.companyname;
                    body.photo = guideDetails.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideDetails.companyname)}&background=10b981&color=fff`;
                    body.handle = `@${guideDetails.companyname.toLowerCase().replace(/\s+/g, '').substring(0, 15)}`;
                }
            }
        }

        // Ensure media is always an array
        if (body.media && !Array.isArray(body.media)) {
            body.media = [body.media];
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
