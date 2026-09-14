import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Package } from '@/models/package.model';
import { packageHeroFor } from '@/lib/packageHero';

export const revalidate = 3600;

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  'X-Content-Type-Options': 'nosniff',
};

function fallback(request, id) {
  return NextResponse.redirect(new URL(packageHeroFor(id), request.url), { headers: CACHE_HEADERS });
}

export async function GET(request, { params }) {
  let id = '';
  try {
    ({ id } = await params);
    if (!mongoose.Types.ObjectId.isValid(id)) return fallback(request, id);

    await dbConnect();
    const [pkg] = await Package.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), status: 'active' } },
      {
        $project: {
          cover: {
            $ifNull: [
              { $arrayElemAt: [{ $ifNull: ['$packagePhotos', []] }, 0] },
              { $arrayElemAt: [{ $ifNull: ['$photos', []] }, 0] },
            ],
          },
        },
      },
    ]);
    const cover = pkg?.cover?.trim();
    if (!cover) return fallback(request, id);

    if (/^https?:\/\//i.test(cover)) return NextResponse.redirect(cover, { headers: CACHE_HEADERS });
    if (cover.startsWith('/')) return NextResponse.redirect(new URL(cover, request.url), { headers: CACHE_HEADERS });

    const dataUrl = cover.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
    if (!dataUrl) return fallback(request, id);

    const body = Buffer.from(dataUrl[2].replace(/\s/g, ''), 'base64');
    return new Response(body, {
      headers: {
        ...CACHE_HEADERS,
        'Content-Type': dataUrl[1].toLowerCase(),
        'Content-Length': String(body.length),
      },
    });
  } catch (error) {
    console.error('Failed to fetch package cover:', error);
    return fallback(request, id);
  }
}

