import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const destination = searchParams.get('destination') || '';
        const daysRange = searchParams.get('daysRange') || '';
        const peopleRange = searchParams.get('peopleRange') || '';
        const category = searchParams.get('category') || '';

        // Build package query — accept both 'active' and legacy 'published'
        const pkgQuery = { status: { $in: ['active', 'published'] } };

        // Filter by destination (case-insensitive)
        if (destination) {
            pkgQuery.destination = { $regex: destination, $options: 'i' };
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

        // Fetch matching packages
        let packages = await Package.find(pkgQuery).lean();

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

        if (packages.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Group packages by provider
        const providerIds = [...new Set(packages.map(p => p.provider.toString()))];

        // Try to get GuideDetails for these providers to check if they have paused trip services
        const guideDetailsList = await GuideDetails.find({
            guide: { $in: providerIds }
        }).populate('guide').lean();

        // 🛑 Filter out packages from providers who have paused trips
        const pausedProviderIds = new Set(
            guideDetailsList
                .filter(gd => gd.pausedServices?.trip === true)
                .map(gd => gd.guide._id.toString())
        );

        packages = packages.filter(pkg => !pausedProviderIds.has(pkg.provider.toString()));

        if (packages.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // For provider IDs that have no GuideDetails, use plain Guide records
        const guideDetailsProviderIds = guideDetailsList.map(gd => gd.guide._id.toString());
        const missingProviderIds = providerIds.filter(id => !guideDetailsProviderIds.includes(id));

        // Fetch plain Guide records for providers without GuideDetails
        const plainGuides = missingProviderIds.length > 0
            ? await Guide.find({ _id: { $in: missingProviderIds } }).lean()
            : [];

        // Build combined guide list
        const allGuideSources = [
            ...guideDetailsList.map(gd => ({
                id: gd.guide._id.toString(),
                name: gd.companyname || gd.guide.username,
                bio: `Specialist at ${gd.destinationId || 'various destinations'}`,
                location: gd.destinationId?.toLowerCase() || '',
            })),
            ...plainGuides.map(g => ({
                id: g._id.toString(),
                name: g.username,
                bio: 'Experienced travel guide',
                location: '',
            }))
        ];

        // Build formatted result
        const formattedGuides = allGuideSources.map(guideInfo => {
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
                    pricingTiers: pkg.pricingTiers,
                    price: displayPrice,
                    inclusives: pkg.inclusives,
                    activities: pkg.activities,
                    itinerary: pkg.itinerary,
                    termsAndConditions: pkg.termsAndConditions,
                };
            });

            const firstPkg = formattedPackages[0];

            return {
                id: guideInfo.id,
                name: guideInfo.name,
                bio: guideInfo.bio,
                image: '/images/guides/kashmir1.jpg',
                rating: 4.5,
                reviews: 10,
                location: guideInfo.location || (firstPkg?.destination?.toLowerCase() || ''),
                price: firstPkg?.price || { individual: 0, couple: 0 },
                languages: ['English', 'Hindi'],
                touristsHandled: 100,
                packages: formattedPackages,
            };
        }).filter(Boolean);

        return NextResponse.json({ success: true, data: formattedGuides });
    } catch (error) {
        console.error('Failed to fetch public trips:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
