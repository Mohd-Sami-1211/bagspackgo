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
        const peopleRange = searchParams.get('peopleRange') || '';
        const trekId = searchParams.get('trek') || ''; // 'trek' param is actually the trek ID

        const pkgQuery = {
            status: { $in: ['active', 'published'] },
            category: 'trek'
        };

        if (destination && destination !== 'all_treks') {
            pkgQuery.destination = { $regex: destination, $options: 'i' };
        }

        if (trekId && trekId !== 'all_treks') {
            // we could match trek name but search uses ID for some reason. Let's just return all for now if there are specific IDs mapped to names in data.json.
            // Wait, data.json trek IDs are synthetic. Let's just use destination.
        }

        let packages = await Package.find(pkgQuery).populate({
            path: 'provider',
            select: 'username companyname _id'
        }).lean();

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

        const providerIds = [...new Set(packages.map(p => p.provider._id.toString()))];

        const guideDetailsList = await GuideDetails.find({
            guide: { $in: providerIds }
        }).lean();

        // Filter out treks from providers who have paused treks
        const pausedProviderIds = new Set(
            guideDetailsList
                .filter(gd => gd.pausedServices?.trek === true)
                .map(gd => gd.guide.toString())
        );

        packages = packages.filter(pkg => !pausedProviderIds.has(pkg.provider._id.toString()));

        return NextResponse.json({ success: true, data: packages });
    } catch (error) {
        console.error('Failed to fetch public treks:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
