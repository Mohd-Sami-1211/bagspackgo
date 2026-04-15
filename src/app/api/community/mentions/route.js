import dbConnect from '@/lib/db';
import { GuideDetails } from '@/models/guidedetails.model';
import { NextResponse } from 'next/server';

// GET /api/community/mentions?q=search_term
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        await dbConnect();

        // Build results array starting with the official bagspackgo account
        const results = [];

        // Always include bagspackgo official account if query matches
        const officialName = 'bagspackgo';
        if (!query || officialName.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                id: 'official',
                name: 'bagspackgo',
                logo: '/favicon.ico',
                isOfficial: true
            });
        }

        // Search approved service providers by company name
        if (query.length >= 1) {
            const providers = await GuideDetails.find({
                status: 'approved',
                companyname: { $regex: query, $options: 'i' }
            })
            .select('companyname logo guide')
            .limit(8)
            .lean();

            providers.forEach(p => {
                results.push({
                    id: p.guide?.toString() || p._id.toString(),
                    name: p.companyname,
                    logo: p.logo || '',
                    isOfficial: false
                });
            });
        } else {
            // If no query, return a few providers anyway
            const providers = await GuideDetails.find({ status: 'approved' })
                .select('companyname logo guide')
                .limit(5)
                .lean();

            providers.forEach(p => {
                results.push({
                    id: p.guide?.toString() || p._id.toString(),
                    name: p.companyname,
                    logo: p.logo || '',
                    isOfficial: false
                });
            });
        }

        return NextResponse.json({ success: true, data: results.slice(0, 10) });
    } catch (error) {
        console.error('Mentions search error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
