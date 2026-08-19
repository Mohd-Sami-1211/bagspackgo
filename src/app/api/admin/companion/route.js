import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanionRequest from '@/models/CompanionRequest';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const requests = await CompanionRequest.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching companion requests:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
