// src/app/api/public/provider/[id]/route.js
// Public API for provider profile — used by both the page and generateMetadata
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        const resolvedParams = await params;
        const id = resolvedParams.id;

        const guideData = await Guide.findById(id)
            .select('-password -loginAttempts -lockUntil')
            .lean();

        if (!guideData) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }

        const details = (await GuideDetails.findOne({ guide: id }).lean()) || {};

        // Only return if the provider is approved
        if (
            guideData.applicationStatus !== 'approved' &&
            details.status !== 'approved'
        ) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }

        // Build public‑safe provider object (no sensitive fields)
        const provider = {
            _id: guideData._id,
            name: details.companyname || guideData.username,
            bio: details.bio || '',
            logo: details.logo || '',
            location: details.destinationId || '',
            address: details.address || '',
            speciality: details.speciality || '',
            rating: details.rating || 0,
            reviews: details.reviews || 0,
            totalTrips: details.totalTrips || 0,
            totalTreks: details.totalTreks || 0,
            totalEvents: details.totalEvents || 0,
            isVerified: true, // only approved providers reach here
        };

        // Fetch active packages
        const packages = await Package.find({
            provider: id,
            status: { $in: ['active', 'published'] },
        })
            .select('name category packageType packageCategory destination days pricingTiers photos rating totalRatings trekName trekLevel')
            .lean();

        return NextResponse.json({ success: true, provider, packages });
    } catch (error) {
        console.error('Public provider fetch error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
