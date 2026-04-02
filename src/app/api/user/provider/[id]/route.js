import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { Package } from '@/models/package.model';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        // Await params for Next.js 15+ compatibility
        const resolvedParams = await params;
        const id = resolvedParams.id;
        
        const guideData = await Guide.findById(id).select('-password -paymentDetails -applicationFormDocs').lean();
        
        if (!guideData) {
            return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
        }
        
        // Remove direct contact details to prevent bypassing platform
        delete guideData.email;
        delete guideData.phone;
        delete guideData.socialLinks;
        delete guideData.website;
        delete guideData.alternatePhone;
        
        // Fetch GuideDetails
        const { GuideDetails } = await import('@/models/guidedetails.model');
        const details = await GuideDetails.findOne({ guide: id }).lean() || {};
        
        // Merge into a comprehensive provider object
        const provider = {
            ...guideData,
            name: details.companyname || guideData.username,
            bio: details.bio || guideData.bio,
            logo: details.logo,
            location: details.destinationId || details.address || '',
            rating: details.rating || 4.8,
            reviews: details.reviews || 10,
            isVerified: details.status === 'approved' || guideData.isEmailVerified,
            totalTrips: details.totalTrips || 0,
            totalTreks: details.totalTreks || 0
        };

        // Fetch packages for this provider using the correct 'provider' field
        const packages = await Package.find({ provider: id, status: { $in: ['active', 'published'] } }).lean();
        
        return NextResponse.json({ 
            success: true, 
            provider,
            packages
        });
    } catch (error) {
        console.error("Provider profile fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch provider profile" }, { status: 500 });
    }
}
