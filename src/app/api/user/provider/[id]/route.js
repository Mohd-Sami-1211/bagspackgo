import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { Package } from '@/models/package.model';
import Review from '@/models/review.model';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        // Await params for Next.js 15+ compatibility
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Provider ID' }, { status: 400 });
        }
        
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
            rating: details.rating || 0,
            reviews: details.reviews || 0,
            isVerified: details.status === 'approved' || guideData.isEmailVerified,
            totalTrips: details.totalTrips || 0,
            totalTreks: details.totalTreks || 0,
            speciality: details.speciality || details.businessType || ''
        };

        // Fetch packages for this provider using the correct 'provider' field
        const packages = await Package.find({ provider: id, status: 'active' })
            .populate('reviews').lean();
            
        // Fetch provider's direct reviews
        const providerReviews = await Review.find({ provider: id }).lean();
        
        let feedbacks = [];
        
        // Add direct reviews
        providerReviews.forEach(rev => {
             feedbacks.push({
                 id: rev._id.toString(),
                 user: rev.name || "Happy Traveler",
                 rating: rev.rating || 5,
                 comment: rev.content || "Great experience!",
                 date: rev.createdAt ? new Date(rev.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
             });
        });

        // Collect real reviews from the provider's packages
        packages.forEach(pkg => {
            if (pkg.reviews && Array.isArray(pkg.reviews)) {
                pkg.reviews.forEach(rev => {
                    if (rev && typeof rev === 'object' && rev._id) {
                        feedbacks.push({
                            id: rev._id.toString(),
                            user: rev.name || "Happy Traveler",
                            rating: rev.rating || 5,
                            comment: rev.content || "Great experience!",
                            date: rev.createdAt ? new Date(rev.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        });
                    }
                });
            }
        });

        // Fetch events hosted by this provider
        const { Event } = await import('@/models/event.model');
        const events = await Event.find({ guide: id, status: 'published' }).lean();

        // Sort latest first
        feedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return NextResponse.json({ 
            success: true, 
            provider,
            packages,
            events,
            feedbacks
        });
    } catch (error) {
        console.error("Provider profile fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch provider profile" }, { status: 500 });
    }
}
