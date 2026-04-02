import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { GuideDetails } from '@/models/guidedetails.model';
import { Guide } from '@/models/guide.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { status, adminNotes } = await req.json(); // status = 'approved' or 'rejected'
        
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        const params = await context.params;
        const app = await GuideDetails.findById(params.id);
        if (!app) return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });

        app.status = status;
        if (status === 'rejected' && adminNotes) {
            app.adminNotes = adminNotes;
        }

        await app.save();

        // Also sync the Guide status
        await Guide.findByIdAndUpdate(app.guide, { applicationStatus: status });

        // NOTE: In a complete system, we might want to automatically create a notification 
        // for the provider or shoot them an email via NodeMailer here.

        return NextResponse.json({ success: true, application: app });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
