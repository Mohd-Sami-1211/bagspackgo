import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { GuideDetails } from '@/models/guidedetails.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || 'pending'; // 'pending', 'approved', 'rejected', 'all'

        const query = {};
        if (filter !== 'all') {
            query.status = filter;
        }

        const applications = await GuideDetails.find(query)
            .populate('guide', 'username email phone isActive')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, applications });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
