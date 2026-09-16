import { NextResponse } from 'next/server';
import { getPublicOffbeatList } from '@/lib/publicOffbeatList';

export async function GET(request) {
    try {
        const result = await getPublicOffbeatList(new URL(request.url).searchParams);
        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                'Vercel-CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Failed to fetch public offbeats:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
