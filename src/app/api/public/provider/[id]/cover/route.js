import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { GuideDetails } from '@/models/guidedetails.model';

export const revalidate = 3600;

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  'X-Content-Type-Options': 'nosniff',
};

function fallback(request) {
  return NextResponse.redirect(new URL('/images/providers/default-provider-cover.webp', request.url), { headers: CACHE_HEADERS });
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return fallback(request);

    await dbConnect();
    const details = await GuideDetails.findOne({ guide: id }).select('coverPhoto').lean();
    const cover = details?.coverPhoto?.trim();
    if (!cover) return fallback(request);
    if (/^https?:\/\//i.test(cover)) return NextResponse.redirect(cover, { headers: CACHE_HEADERS });
    if (cover.startsWith('/')) return NextResponse.redirect(new URL(cover, request.url), { headers: CACHE_HEADERS });

    const dataUrl = cover.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
    if (!dataUrl) return fallback(request);
    const body = Buffer.from(dataUrl[2].replace(/\s/g, ''), 'base64');
    return new Response(body, {
      headers: {
        ...CACHE_HEADERS,
        'Content-Type': dataUrl[1].toLowerCase(),
        'Content-Length': String(body.length),
      },
    });
  } catch (error) {
    console.error('Failed to fetch provider cover:', error);
    return fallback(request);
  }
}
