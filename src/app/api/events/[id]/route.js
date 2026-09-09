import { NextResponse } from 'next/server';
import { getPublicEventDetails } from '@/lib/publicEvent';

export const revalidate = 30;

/**
 * GET /api/events/[id]
 * Lightweight, cached public event details. Private published events remain
 * accessible by direct link; drafts/cancelled events are never exposed.
 */
export async function GET(_request, context) {
    try {
        const { id } = await context.params;
        const event = await getPublicEventDetails(id);

        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, event },
            {
                headers: {
                    'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=300',
                    'CDN-Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        console.error('Get Public Event Error:', error);
        return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 });
    }
}
