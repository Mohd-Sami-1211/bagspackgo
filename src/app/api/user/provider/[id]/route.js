import { NextResponse } from 'next/server';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';

export const revalidate = 300;

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
};

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const data = await getPublicProviderProfile(id);

    if (!data) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Provider profile fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch provider profile' }, { status: 500 });
  }
}
