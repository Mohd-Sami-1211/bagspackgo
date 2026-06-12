import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Package } from '@/models/package.model';
import { generateThumbnails, generateThumbnail } from '@/lib/generateThumbnails';

export async function GET(req) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const packageId = searchParams.get('packageId');

        if (!packageId) {
            return NextResponse.json({ success: false, message: 'packageId is required' }, { status: 400 });
        }

        // Fetch only the photos from the package
        const pkg = await Package.findById(packageId)
            .select('packagePhotos itinerary')
            .lean();

        if (!pkg) {
            return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
        }

        const packagePhotos = pkg.packagePhotos || [];

        // Generate tiny thumbnails for package photos in parallel with itinerary processing
        const [packagePhotoThumbnails, itineraryPhotos] = await Promise.all([
            generateThumbnails(packagePhotos),
            Promise.all(
                (pkg.itinerary || []).map(async (day, index) => {
                    const hotelPhotos = day.hotelPhotos || [];
                    const hotelPhotoThumbnails = await generateThumbnails(hotelPhotos);
                    return {
                        dayIndex: index,
                        hotelPhotos,
                        hotelPhotoThumbnails,
                    };
                })
            ),
        ]);

        return NextResponse.json(
            { 
                success: true, 
                data: {
                    packagePhotos,
                    packagePhotoThumbnails,
                    itineraryPhotos,
                } 
            },
            { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
        );
    } catch (error) {
        console.error('Failed to fetch package photos:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
