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
    }).select('-idFile -licenseFile -adminNotes').populate('guide', '-password').lean();

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
        ? await Guide.find({ _id: { $in: missingProviderIds } }).lean()
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

function shufflePackages(packages) {
    const shuffled = [...packages];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
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
        console.time('totalApiTime');
        console.time('dbConnect');
        await dbConnect();
        console.timeEnd('dbConnect');

        const { searchParams } = new URL(req.url);
        const destination = searchParams.get('destination') || '';
        const daysRange = searchParams.get('daysRange') || '';
        const peopleRange = searchParams.get('peopleRange') || '';
        const category = searchParams.get('category') || '';
        const providerId = searchParams.get('id') || '';
        const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(12, Math.max(1, Number.parseInt(searchParams.get('limit') || '12', 10)));

        // Build package query - filter strictly for 'trip' category
        const pkgQuery = { 
            status: { $in: ['active', 'published'] },
            category: 'trip' 
        };

        if (providerId) {
            // Check if the passed ID is actually a package ID
            const isPackage = await Package.findById(providerId).select('provider').lean();
            if (isPackage) {
                pkgQuery.provider = isPackage.provider;
            } else if (mongoose.Types.ObjectId.isValid(providerId)) {
                pkgQuery.provider = new mongoose.Types.ObjectId(providerId);
            } else {
                pkgQuery.provider = providerId;
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
        console.time('fetchPackages');
        let packagesQuery = Package.find(pkgQuery);
        if (!providerId) {
            packagesQuery = packagesQuery.select('-packagePhotos -photos -itinerary -inclusives -inclusivesList -exclusivesList -activities -termsAndConditions -additionalPoints -aboutPackage -pickupDropCities');
        } else {
            // For details view, include the text details but strip the heavy base64 images!
            packagesQuery = packagesQuery.select('-packagePhotos -photos -itinerary.hotelPhotos');
        }
        let packages = await packagesQuery.lean();
        console.timeEnd('fetchPackages');

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
        console.time('buildFormattedGuides1');
        const formattedGuides = await buildFormattedGuides(pagedPackages);
        console.timeEnd('buildFormattedGuides1');

        // --- Fetch "other packages" for the same destination ---
        let otherGuides = [];
        if (destination && !providerId && page === 1) {
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
            console.time('fetchOtherPackages');
            const otherPackages = await Package.find(otherPkgQuery).select('-packagePhotos -photos -itinerary -inclusives -inclusivesList -exclusivesList -activities -termsAndConditions -additionalPoints -aboutPackage -pickupDropCities').lean();
            console.timeEnd('fetchOtherPackages');
            console.time('buildFormattedGuides2');
            otherGuides = await buildFormattedGuides(otherPackages);
            console.timeEnd('buildFormattedGuides2');
        }

        console.timeEnd('totalApiTime');
        const finalData = [...formattedGuides, ...otherGuides];
        console.log(`[TRIP API] Returning ${finalData.length} guides for id:`, providerId);
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
            { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
        );
    } catch (error) {
        console.error('Failed to fetch public trips:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

