import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanionRequest from '@/models/CompanionRequest';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, { params }) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        
        const { id } = await params;
        const body = await req.json();
        
        const validStatuses = ['pending', 'contacted', 'successful', 'unsuccessful', 'closed'];
        
        const updateData = {};
        if (body.status && validStatuses.includes(body.status)) {
            updateData.status = body.status;
        }
        if (body.adminNotes !== undefined) {
            updateData.adminNotes = body.adminNotes;
        }

        const request = await CompanionRequest.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!request) {
            return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, request });
    } catch (error) {
        console.error('Error updating companion request:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
