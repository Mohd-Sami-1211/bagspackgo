import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Package } from '@/models/package.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

// GET — fetch single package by id or all packages for a provider
export async function GET(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const url = new URL(req.url);
        const packageId = url.searchParams.get('id');
        const providerId = url.searchParams.get('providerId');

        if (packageId) {
            const pkg = await Package.findById(packageId);
            if (!pkg) return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
            return NextResponse.json({ success: true, package: pkg });
        }

        if (providerId) {
            const packages = await Package.find({ provider: providerId }).sort({ createdAt: -1 });
            return NextResponse.json({ success: true, packages });
        }

        return NextResponse.json({ success: false, message: 'Provide id or providerId' }, { status: 400 });
    } catch (err) {
        console.error('Admin GET packages error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST — create or duplicate a package on behalf of a provider
export async function POST(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const data = await req.json();
        const providerId = data.providerId;
        if (!providerId) return NextResponse.json({ success: false, message: 'providerId is required' }, { status: 400 });

        // Duplicate logic
        if (data.action === 'duplicate' && data.packageId) {
            const original = await Package.findOne({ _id: data.packageId, provider: providerId });
            if (!original) return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });

            const cloned = original.toObject();
            delete cloned._id; delete cloned.createdAt; delete cloned.updatedAt;
            cloned.name = `Copy of ${cloned.name}`;
            cloned.status = 'active';

            const newPkg = new Package(cloned);
            await newPkg.save();
            return NextResponse.json({ success: true, message: 'Package duplicated', packageId: newPkg._id }, { status: 201 });
        }

        // Create
        const { packageInfo, pricingTiers, inclusivesList, exclusivesList, additionalPoints, itinerary, termsAndConditions, inclusives, activities } = data;
        if (!packageInfo?.name || !packageInfo?.destination) {
            return NextResponse.json({ success: false, message: 'Missing required package info' }, { status: 400 });
        }

        const newPackage = new Package({
            provider: providerId,
            name: packageInfo.name.trim(),
            category: packageInfo.category || 'trip',
            packageType: packageInfo.packageType || 'individual',
            packageCategory: packageInfo.packageCategory || 'budget',
            destination: packageInfo.destination.trim(),
            days: parseInt(packageInfo.days) || 1,
            trekName: packageInfo.trekName || '',
            trekLevel: packageInfo.trekLevel || '',
            photos: data.photos || [],
            pricingTiers: (pricingTiers || []).map(t => ({
                minPeople: parseInt(t.minPeople) || 1,
                maxPeople: parseInt(t.maxPeople) || 2,
                price: parseFloat(t.price) || 0,
                discount: parseFloat(t.discount) || 0
            })),
            pickupDropCities: data.pickupDropCities || [],
            inclusives: inclusives || null,
            inclusivesList: (inclusivesList || []).map(i => typeof i === 'string' ? i : i.text),
            exclusivesList: (exclusivesList || []).map(e => typeof e === 'string' ? e : e.text),
            additionalPoints: (additionalPoints || []).map(a => typeof a === 'string' ? a : a.text),
            activities: (activities || []).map(a => ({ name: a.name, details: a.details })),
            itinerary: (itinerary || []).map(day => ({
                day: day.day, location: day.location || '', agenda: day.agenda || '',
                travelFrom: day.travelFrom || '', travelTo: day.travelTo || '',
                pickupTime: day.pickupTime || '', checkinTime: day.checkinTime || '',
                isDayTrip: day.isDayTrip || false, hotelName: day.hotelName || '',
                hotelStars: day.hotelStars || '3', hotelPhotos: day.hotelPhotos || [],
                destinationPhotos: day.destinationPhotos || [],
                activities: day.activities || [],
                highlights: (day.highlights || []).filter(h => h && h.trim())
            })),
            termsAndConditions: (termsAndConditions || []).map(t => typeof t === 'string' ? t : t.text),
            aboutPackage: data.aboutPackage || '',
            packagePhotos: data.packagePhotos || []
        });

        await newPackage.save();
        return NextResponse.json({ success: true, message: 'Package created', packageId: newPackage._id }, { status: 201 });
    } catch (err) {
        console.error('Admin POST package error:', err);
        return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
    }
}

// PUT — update a package
export async function PUT(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const url = new URL(req.url);
        const packageId = url.searchParams.get('id');
        if (!packageId) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

        const data = await req.json();
        const { packageInfo, pricingTiers, inclusivesList, exclusivesList, additionalPoints, itinerary, termsAndConditions, inclusives, activities } = data;

        const updateData = {
            name: packageInfo.name.trim(),
            category: packageInfo.category || 'trip',
            packageType: packageInfo.packageType || 'individual',
            packageCategory: packageInfo.packageCategory || 'budget',
            destination: packageInfo.destination.trim(),
            days: parseInt(packageInfo.days) || 1,
            trekName: packageInfo.trekName || '',
            trekLevel: packageInfo.trekLevel || '',
            photos: data.photos || [],
            pricingTiers: (pricingTiers || []).map(t => ({
                minPeople: parseInt(t.minPeople) || 1,
                maxPeople: parseInt(t.maxPeople) || 2,
                price: parseFloat(t.price) || 0,
                discount: parseFloat(t.discount) || 0
            })),
            pickupDropCities: data.pickupDropCities || [],
            inclusives: inclusives || null,
            inclusivesList: (inclusivesList || []).map(i => typeof i === 'string' ? i : i.text),
            exclusivesList: (exclusivesList || []).map(e => typeof e === 'string' ? e : e.text),
            additionalPoints: (additionalPoints || []).map(a => typeof a === 'string' ? a : a.text),
            activities: (activities || []).map(a => ({ name: a.name, details: a.details })),
            itinerary: (itinerary || []).map(day => ({
                day: day.day, location: day.location || '', agenda: day.agenda || '',
                travelFrom: day.travelFrom || '', travelTo: day.travelTo || '',
                pickupTime: day.pickupTime || '', checkinTime: day.checkinTime || '',
                isDayTrip: day.isDayTrip || false, hotelName: day.hotelName || '',
                hotelStars: day.hotelStars || '3', hotelPhotos: day.hotelPhotos || [],
                destinationPhotos: day.destinationPhotos || [],
                activities: day.activities || [],
                highlights: (day.highlights || []).filter(h => h && h.trim())
            })),
            termsAndConditions: (termsAndConditions || []).map(t => typeof t === 'string' ? t : t.text),
            aboutPackage: data.aboutPackage || '',
            packagePhotos: data.packagePhotos || []
        };

        const updated = await Package.findByIdAndUpdate(packageId, { $set: updateData }, { new: true });
        if (!updated) return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Package updated', packageId: updated._id });
    } catch (err) {
        console.error('Admin PUT package error:', err);
        return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
    }
}

// DELETE — delete a package
export async function DELETE(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const url = new URL(req.url);
        const packageId = url.searchParams.get('id');
        if (!packageId) return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });

        const deleted = await Package.findByIdAndDelete(packageId);
        if (!deleted) return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Package deleted' });
    } catch (err) {
        console.error('Admin DELETE package error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
