import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const providers = await Guide.find(query).sort({ createdAt: -1 }).lean();
        
        // Fetch GuideDetails for company names
        const guideIds = providers.map(p => p._id);
        const details = await GuideDetails.find({ guide: { $in: guideIds } }).lean();
        const detailsMap = details.reduce((acc, d) => {
            acc[d.guide.toString()] = d;
            return acc;
        }, {});

        const enrichedProviders = providers.map(p => ({
            ...p,
            details: detailsMap[p._id.toString()] || null
        }));

        return NextResponse.json({ success: true, providers: enrichedProviders });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
