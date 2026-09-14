import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { GuideDetails } from '@/models/guidedetails.model';

export const revalidate = 3600;

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.redirect(new URL('/images/logo.svg', request.url), { headers: CACHE_HEADERS });
    }

    await dbConnect();
    const details = await GuideDetails.findOne({ guide: id }).select('logo').lean();
    const logo = details?.logo?.trim();

    if (!logo) {
      return NextResponse.redirect(new URL('/images/logo.svg', request.url), { headers: CACHE_HEADERS });
    }
    if (/^https?:\/\//i.test(logo)) {
      return NextResponse.redirect(logo, { headers: CACHE_HEADERS });
    }
    if (logo.startsWith('/')) {
      return NextResponse.redirect(new URL(logo, request.url), { headers: CACHE_HEADERS });
    }

    const dataUrl = logo.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
    if (!dataUrl) {
      return NextResponse.redirect(new URL('/images/logo.svg', request.url), { headers: CACHE_HEADERS });
    }

    const body = Buffer.from(dataUrl[2].replace(/\s/g, ''), 'base64');
    return new Response(body, {
      headers: {
        ...CACHE_HEADERS,
        'Content-Type': dataUrl[1].toLowerCase(),
        'Content-Length': String(body.length),
      },
    });
  } catch (error) {
    console.error('Failed to fetch provider logo:', error);
    return NextResponse.redirect(new URL('/images/logo.svg', request.url), { headers: CACHE_HEADERS });
  }
}

