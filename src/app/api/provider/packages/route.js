import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Package } from '@/models/package.model';
import { getCurrentUser } from '@/lib/auth';
import { Guide } from '@/models/guide.model';

export async function POST(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== 'provider') {
            return NextResponse.json({ success: false, message: 'Unauthorized. Only providers can create packages.' }, { status: 401 });
        }

        await dbConnect();

        // Verify the provider exists
        const guide = await Guide.findById(user.userId);
        if (!guide) {
            return NextResponse.json({ success: false, message: 'Provider account not found' }, { status: 404 });
        }

        const data = await req.json();

        // Data mapping and validation
        const {
            packageInfo,
            pricingTiers,
            inclusives,
            activities,
            itinerary,
            termsAndConditions
        } = data;

        if (!packageInfo || !packageInfo.name || !packageInfo.destination) {
            return NextResponse.json({ success: false, message: 'Missing required package info (name or destination)' }, { status: 400 });
        }

        const days = parseInt(packageInfo.days) || 1;

        if (!pricingTiers || pricingTiers.length === 0) {
            return NextResponse.json({ success: false, message: 'At least one pricing tier is required' }, { status: 400 });
        }

        const newPackage = new Package({
            provider: user.userId,
            name: packageInfo.name.trim(),
            packageType: packageInfo.packageType || 'individual',
            packageCategory: packageInfo.packageCategory || 'budget',
            destination: packageInfo.destination.trim(),
            days,
            pricingTiers: pricingTiers.map(tier => ({
                minPeople: parseInt(tier.minPeople) || 1,
                maxPeople: parseInt(tier.maxPeople) || 2,
                price: parseFloat(tier.price) || 0,
                discount: parseFloat(tier.discount) || 0
            })),
            inclusives: {
                food: inclusives?.food,
                transport: inclusives?.transport,
                accommodation: inclusives?.accommodation,
                guidance: inclusives?.guidance,
                pickupDropoff: inclusives?.pickupDropoff
            },
            activities: (activities || []).map(a => ({
                name: a.name,
                details: a.details
            })),
            itinerary: (itinerary || []).map(day => ({
                day: day.day,
                location: day.location || '',
                agenda: day.agenda || '',
                travelFrom: day.travelFrom || '',
                travelTo: day.travelTo || '',
                pickupTime: day.pickupTime || '',
                hotelName: day.hotelName || '',
                activities: day.activities || [],
                highlights: (day.highlights || []).filter(h => h && h.trim())
            })),
            termsAndConditions: (termsAndConditions || []).map(t => typeof t === 'string' ? t : t.text)
        });

        await newPackage.save();

        return NextResponse.json({
            success: true,
            message: 'Package created successfully',
            packageId: newPackage._id
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating package:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error'
        }, { status: 500 });
    }
}


export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== 'provider') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const packages = await Package.find({ provider: user.userId }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            packages
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching provider packages:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch packages' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== 'provider') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const packageId = url.searchParams.get('id');

        if (!packageId) {
            return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });
        }

        await dbConnect();

        const packageItem = await Package.findOne({ _id: packageId, provider: user.userId });
        if (!packageItem) {
            return NextResponse.json({ success: false, message: 'Package not found or unauthorized' }, { status: 404 });
        }

        // Toggle status — treat legacy 'published' as 'active'
        const currentStatus = packageItem.status;
        const isCurrentlyActive = currentStatus === 'active' || currentStatus === 'published';
        const newStatus = isCurrentlyActive ? 'inactive' : 'active';
        packageItem.status = newStatus;
        await packageItem.save();

        return NextResponse.json({ success: true, newStatus }, { status: 200 });
    } catch (error) {
        console.error('Error updating package status:', error);
        return NextResponse.json({ success: false, message: 'Failed to update package status' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== 'provider') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const packageId = url.searchParams.get('id');

        if (!packageId) {
            return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });
        }

        await dbConnect();

        // Ensure the provider owns it
        const packageItem = await Package.findOne({ _id: packageId, provider: user.userId });
        if (!packageItem) {
            return NextResponse.json({ success: false, message: 'Package not found or unauthorized' }, { status: 404 });
        }

        await Package.findByIdAndDelete(packageId);

        return NextResponse.json({ success: true, message: 'Package deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete package' }, { status: 500 });
    }
}
