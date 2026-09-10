import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Package } from '@/models/package.model';

const CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
};

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const packageId = searchParams.get('packageId');
        const scope = searchParams.get('scope') || 'gallery';

        if (!packageId || !mongoose.Types.ObjectId.isValid(packageId)) {
            return NextResponse.json({ success: false, message: 'A valid packageId is required' }, { status: 400 });
        }

        await dbConnect();
        const objectId = new mongoose.Types.ObjectId(packageId);

        if (scope === 'itinerary') {
            const dayIndex = Math.max(0, Number.parseInt(searchParams.get('dayIndex') || '0', 10));
            const [pkg] = await Package.aggregate([
                { $match: { _id: objectId } },
                {
                    $project: {
                        itinerary: {
                            $slice: [{ $ifNull: ['$itinerary', []] }, dayIndex, 1],
                        },
                    },
                },
            ]);

            if (!pkg) {
                return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
            }

            const hotelPhotos = pkg.itinerary?.[0]?.hotelPhotos || [];
            const destinationPhotos = pkg.itinerary?.[0]?.destinationPhotos || [];
            return NextResponse.json({
                success: true,
                data: {
                    itineraryPhotos: [{
                        dayIndex,
                        hotelPhotos,
                        destinationPhotos,
                    }],
                },
            }, { headers: CACHE_HEADERS });
        }

        const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(12, Math.max(1, Number.parseInt(searchParams.get('limit') || '5', 10)));
        const skip = (page - 1) * limit;
        const [pkg] = await Package.aggregate([
            { $match: { _id: objectId } },
            {
                $project: {
                    packagePhotos: {
                        $slice: [{ $ifNull: ['$packagePhotos', []] }, skip, limit],
                    },
                    total: { $size: { $ifNull: ['$packagePhotos', []] } },
                },
            },
        ]);

        if (!pkg) {
            return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
        }

        const packagePhotos = pkg.packagePhotos || [];
        const total = Number(pkg.total || 0);

        return NextResponse.json({
            success: true,
            data: { packagePhotos },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('Failed to fetch package photos:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
