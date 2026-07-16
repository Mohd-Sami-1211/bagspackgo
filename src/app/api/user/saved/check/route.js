import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Saved } from '@/models/saved.model';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, isSaved: false });
        }
        
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        
        if (!itemId) {
            return NextResponse.json({ success: false, isSaved: false });
        }

        await dbConnect();
        
        const existing = await Saved.findOne({ userId: user.userId, itemId }).select('_id').lean();
        
        return NextResponse.json({ success: true, isSaved: !!existing });
    } catch (error) {
        console.error("Saved item check error:", error);
        return NextResponse.json({ success: false, isSaved: false }, { status: 500 });
    }
}
