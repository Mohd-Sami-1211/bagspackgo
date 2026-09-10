import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';

const CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
};

export async function GET(_request, { params }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid package ID.' }, { status: 400 });
        }

        await dbConnect();
        const pkg = await Package.findOne({
            _id: new mongoose.Types.ObjectId(id),
            status: { $in: ['active', 'published'] },
            category: 'trip',
        })
            .select('-packagePhotos -photos -itinerary.hotelPhotos -itinerary.destinationPhotos')
            .lean();

        if (!pkg) {
            return NextResponse.json({ success: false, message: 'Package not found.' }, { status: 404 });
        }

        const [providerDetails, provider] = await Promise.all([
            GuideDetails.findOne({ guide: pkg.provider })
                .select('companyname bio destinationId rating reviews totalTrips totalTreks languages logo pausedServices.trip')
                .lean(),
            Guide.findById(pkg.provider).select('username').lean(),
        ]);

        if (providerDetails?.pausedServices?.trip === true) {
            return NextResponse.json({ success: false, message: 'Package is currently unavailable.' }, { status: 404 });
        }

        const providerId = pkg.provider.toString();
        const providerName = providerDetails?.companyname || provider?.username || 'Local travel company';
        const sortedTiers = [...(pkg.pricingTiers || [])].sort((first, second) => first.minPeople - second.minPeople);
        const baseTier = sortedTiers[0];
        const displayPrice = {
            individual: Number(baseTier?.price || 0),
            couple: Number(baseTier?.price || 0) * 2,
        };

        const formattedPackage = {
            id: pkg._id.toString(),
            label: pkg.name,
            days: pkg.days,
            type: pkg.packageCategory || 'budget',
            packageType: pkg.packageType,
            destination: pkg.destination,
            pickupDropCities: pkg.pickupDropCities || [],
            pricingTiers: pkg.pricingTiers || [],
            price: displayPrice,
            inclusives: pkg.inclusives,
            inclusivesList: pkg.inclusivesList || [],
            exclusivesList: pkg.exclusivesList || [],
            activities: pkg.activities || [],
            itinerary: pkg.itinerary || [],
            termsAndConditions: pkg.termsAndConditions || [],
            additionalPoints: pkg.additionalPoints || [],
            aboutPackage: pkg.aboutPackage || '',
            packagePhotos: [],
        };

        return NextResponse.json({
            success: true,
            data: [{
                id: providerId,
                providerId,
                name: providerName,
                companyName: providerName,
                bio: providerDetails?.bio || 'Experienced local travel company',
                logo: providerDetails?.logo || null,
                image: providerDetails?.logo || '/images/guides/kashmir1.jpg',
                rating: Number(providerDetails?.rating || pkg.rating || 0),
                reviews: Number(providerDetails?.reviews || pkg.totalRatings || 0),
                location: providerDetails?.destinationId?.toLowerCase() || pkg.destination?.toLowerCase() || '',
                price: displayPrice,
                languages: providerDetails?.languages?.length ? providerDetails.languages : ['English', 'Hindi'],
                touristsHandled: Number(providerDetails?.totalTrips || 0) + Number(providerDetails?.totalTreks || 0),
                packages: [formattedPackage],
            }],
            pagination: { page: 1, limit: 1, total: 1, totalPages: 1, hasMore: false },
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('Failed to fetch trip package:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
