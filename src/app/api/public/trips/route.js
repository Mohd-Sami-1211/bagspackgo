import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';

// Helper: Build formatted guide objects from packages
async function buildFormattedGuides(packages) {
    if (packages.length === 0) return [];

    const providerIds = [...new Set(packages.map(p => p.provider.toString()))];

    const guideDetailsList = await GuideDetails.find({
        guide: { $in: providerIds }
    })
        .select('guide companyname bio destinationId rating reviews totalTrips totalTreks languages logo pausedServices.trip')
        .populate('guide', 'username')
        .lean();

    // Filter out packages from providers who have paused trips
    const pausedProviderIds = new Set(
        guideDetailsList
            .filter(gd => gd.pausedServices?.trip === true)
            .map(gd => gd.guide._id.toString())
    );

    packages = packages.filter(pkg => !pausedProviderIds.has(pkg.provider.toString()));

    if (packages.length === 0) return [];

    const guideDetailsProviderIds = guideDetailsList.map(gd => gd.guide._id.toString());
    const missingProviderIds = providerIds.filter(id => !guideDetailsProviderIds.includes(id));

    const plainGuides = missingProviderIds.length > 0
        ? await Guide.find({ _id: { $in: missingProviderIds } }).select('username').lean()
        : [];

    const allGuideSources = [
        ...guideDetailsList.map(gd => ({
            id: gd.guide._id.toString(),
            name: gd.companyname || gd.guide.username,
            bio: gd.bio || `Specialist at ${gd.destinationId || 'various destinations'}`,
            location: gd.destinationId?.toLowerCase() || '',
            rating: gd.rating || 0,
            reviews: gd.reviews || 0,
            touristsHandled: (gd.totalTrips || 0) + (gd.totalTreks || 0),
            languages: gd.languages?.length ? gd.languages : ['English', 'Hindi'],
            logo: gd.logo || null
        })),
        ...plainGuides.map(g => ({
            id: g._id.toString(),
            name: g.username,
            bio: 'Experienced travel guide',
            location: '',
            rating: 0,
            reviews: 0,
            touristsHandled: 0,
            languages: ['English'],
            logo: null
        }))
    ];

    return allGuideSources.map(guideInfo => {
        const guidePackages = packages.filter(pkg =>
            pkg.provider.toString() === guideInfo.id
        );

        if (guidePackages.length === 0) return null;

        const formattedPackages = guidePackages.map(pkg => {
            let displayPrice = { individual: 0, couple: 0 };
            if (pkg.pricingTiers && pkg.pricingTiers.length > 0) {
                const sortedTiers = [...pkg.pricingTiers].sort((a, b) => a.minPeople - b.minPeople);
                const baseTier = sortedTiers[0];
                displayPrice.individual = baseTier.price;
                displayPrice.couple = baseTier.price * 2;
            }

            return {
                id: pkg._id.toString(),
                label: pkg.name,
                days: pkg.days,
                type: pkg.packageCategory || 'budget',
                packageType: pkg.packageType,
                destination: pkg.destination,
                pickupDropCities: pkg.pickupDropCities,
                pricingTiers: pkg.pricingTiers,
                price: displayPrice,
                inclusives: pkg.inclusives,
                inclusivesList: pkg.inclusivesList,
                exclusivesList: pkg.exclusivesList,
                activities: pkg.activities,
                itinerary: pkg.itinerary,
                termsAndConditions: pkg.termsAndConditions,
                additionalPoints: pkg.additionalPoints || [],
                aboutPackage: pkg.aboutPackage || '',
                packagePhotos: pkg.packagePhotos || [],
            };
        });

        const firstPkg = formattedPackages[0];

        return {
            id: guideInfo.id,
            name: guideInfo.name,
            bio: guideInfo.bio,
            logo: guideInfo.logo,
            image: guideInfo.logo || '/images/guides/kashmir1.jpg',
            rating: guideInfo.rating,
            reviews: guideInfo.reviews,
            location: guideInfo.location || (firstPkg?.destination?.toLowerCase() || ''),
            price: firstPkg?.price || { individual: 0, couple: 0 },
            languages: guideInfo.languages,
            touristsHandled: guideInfo.touristsHandled,
            packages: formattedPackages,
        };
    }).filter(Boolean);
}

function packageStartingPrice(pkg) {
    const tiers = Array.isArray(pkg.pricingTiers) ? pkg.pricingTiers : [];
    if (tiers.length) {
        return Math.min(...tiers.map((tier) => {
            const price = Number(tier.price || 0);
            const discount = Number(tier.discount || 0);
            return price > 0 ? price * (1 - discount / 100) : Number.POSITIVE_INFINITY;
        }));
    }

    const price = pkg.price;
    if (price && typeof price === 'object') return Number(price.individual || price.couple || 0) || Number.POSITIVE_INFINITY;
    return Number(price || 0) || Number.POSITIVE_INFINITY;
}

function stablePackageHash(pkg) {
    const key = String(pkg?._id || pkg?.id || pkg?.name || 'package');
    let hash = 2166136261;
    for (let index = 0; index < key.length; index += 1) {
        hash ^= key.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function shufflePackages(packages) {
    return [...packages].sort((first, second) => {
        const hashDifference = stablePackageHash(first) - stablePackageHash(second);
        if (hashDifference !== 0) return hashDifference;
        return String(first?._id || '').localeCompare(String(second?._id || ''));
    });
}

function orderPackages(packages) {
    const ranked = [...packages].sort((first, second) => packageStartingPrice(first) - packageStartingPrice(second));
    return [
        ...shufflePackages(ranked.slice(0, 4)),
        ...shufflePackages(ranked.slice(4)),
    ];
}

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const destination = searchParams.get('destination') || '';
        const daysRange = searchParams.get('daysRange') || '';
        const peopleRange = searchParams.get('peopleRange') || '';
        const category = searchParams.get('category') || '';
        const providerId = searchParams.get('id') || '';
        const requestedPackageId = searchParams.get('packageId') || '';
        const isDetailRequest = searchParams.get('detail') === '1';
        const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(12, Math.max(1, Number.parseInt(searchParams.get('limit') || '12', 10)));

        if (requestedPackageId && !mongoose.Types.ObjectId.isValid(requestedPackageId)) {
            return NextResponse.json({ success: false, message: 'Invalid package ID.' }, { status: 400 });
        }

        // Build package query - filter strictly for 'trip' category
        const pkgQuery = { 
            status: { $in: ['active', 'published'] },
            category: 'trip' 
        };

        if (requestedPackageId && mongoose.Types.ObjectId.isValid(requestedPackageId)) {
            pkgQuery._id = new mongoose.Types.ObjectId(requestedPackageId);
        } else if (providerId) {
            // Check if the passed ID is actually a package ID
            const isPackage = mongoose.Types.ObjectId.isValid(providerId)
                ? await Package.findById(providerId).select('provider').lean()
                : null;
            if (isPackage) {
                if (isDetailRequest) pkgQuery._id = isPackage._id;
                else pkgQuery.provider = isPackage.provider;
            } else if (mongoose.Types.ObjectId.isValid(providerId)) {
                pkgQuery.provider = new mongoose.Types.ObjectId(providerId);
            } else {
                return NextResponse.json({ success: false, message: 'Invalid provider ID.' }, { status: 400 });
            }
        }

        // Filter by destination (case-insensitive exact match to allow index usage)
        if (destination) {
            pkgQuery.destination = { $regex: new RegExp(`^${destination}$`, 'i') };
        }

        // Filter by days range e.g. "3-5"
        if (daysRange && daysRange !== 'other') {
            const parts = daysRange.split('-').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                pkgQuery.days = { $gte: parts[0], $lte: parts[1] };
            }
        }

        // Filter by packageType matching trip category
        if (category && (category === 'individual' || category === 'couple')) {
            pkgQuery.packageType = category;
        }

        // Fetch matching packages. Select out heavy base64 photos if this is a general search.
        let packagesQuery = Package.find(pkgQuery);
        if (!providerId && !requestedPackageId) {
            packagesQuery = packagesQuery.select('-packagePhotos -photos -itinerary -inclusives -inclusivesList -exclusivesList -activities -termsAndConditions -additionalPoints -aboutPackage -pickupDropCities');
        } else {
            // For details view, include the text details but strip the heavy base64 images!
            packagesQuery = packagesQuery.select('-packagePhotos -photos -itinerary.hotelPhotos -itinerary.destinationPhotos');
        }
        let packages = await packagesQuery.lean();

        // Filter by peopleRange on the pricing tiers
        if (peopleRange) {
            const isPlus = peopleRange.endsWith('+');
            if (isPlus) {
                const minPeople = parseInt(peopleRange) || 0;
                packages = packages.filter(pkg =>
                    pkg.pricingTiers?.some(tier =>
                        tier.maxPeople >= minPeople
                    )
                );
            } else {
                const [minP, maxP] = peopleRange.split('-').map(Number);
                if (!isNaN(minP) && !isNaN(maxP)) {
                    packages = packages.filter(pkg =>
                        pkg.pricingTiers?.some(tier =>
                            tier.minPeople <= minP && tier.maxPeople >= maxP
                        )
                    );
                }
            }
        }

        const orderedPackages = orderPackages(packages);
        const totalPackages = orderedPackages.length;
        const pagedPackages = orderedPackages.slice((page - 1) * limit, page * limit);

        // Build primary results from one lightweight page
        const formattedGuides = await buildFormattedGuides(pagedPackages);

        // --- Fetch "other packages" for the same destination ---
        let otherGuides = [];
        if (destination && !providerId && !requestedPackageId && page === 1) {
            const matchedPkgIds = new Set(orderedPackages.map(p => p._id.toString()));
            const otherPkgQuery = {
                status: { $in: ['active', 'published'] },
                category: 'trip',
                destination: { $regex: new RegExp(`^${destination}$`, 'i') },
                _id: { $nin: [...matchedPkgIds] }
            };
            // Respect the selected packageType so "More Packages" doesn't
            // show individual packages when the user searched for couple (and vice-versa)
            if (category && (category === 'individual' || category === 'couple')) {
                otherPkgQuery.packageType = category;
            }
            const otherPackages = await Package.find(otherPkgQuery).select('-packagePhotos -photos -itinerary -inclusives -inclusivesList -exclusivesList -activities -termsAndConditions -additionalPoints -aboutPackage -pickupDropCities').lean();
            otherGuides = await buildFormattedGuides(otherPackages);
        }

        return NextResponse.json(
            {
                success: true,
                data: formattedGuides,
                otherPackages: otherGuides,
                pagination: {
                    page,
                    limit,
                    total: totalPackages,
                    totalPages: Math.ceil(totalPackages / limit),
                    hasMore: page * limit < totalPackages,
                },
            },
            { headers: { 'Cache-Control': isDetailRequest ? 'public, s-maxage=300, stale-while-revalidate=900' : 'public, s-maxage=60, stale-while-revalidate=120' } }
        );
    } catch (error) {
        console.error('Failed to fetch public trips:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

