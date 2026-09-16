import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';
import { offbeatCoverRedirect, parseImageDataUrl } from '@/lib/offbeatMedia';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=60, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  // Images may include SVG: keep direct image navigation isolated from scripts.
  'Content-Security-Policy': "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
};

function missingImage() {
  return NextResponse.json({ success: false, message: 'Offbeat cover not found' }, {
    status: 404, headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return missingImage();
    await dbConnect();
    // Check publication on every origin request, including old versioned URLs.
    const offbeat = await OffBeat.findOne({ _id: id, status: 'published' }).select('coverPhoto').lean();
    if (!offbeat?.coverPhoto) return missingImage();

    const redirect = offbeatCoverRedirect(offbeat.coverPhoto, SITE_URL);
    if (redirect && new URL(redirect).pathname !== new URL(request.url).pathname) {
      return NextResponse.redirect(redirect, { headers: CACHE_HEADERS });
    }

    const image = parseImageDataUrl(offbeat.coverPhoto);
    if (!image) return missingImage();
    const body = Buffer.from(image.base64, 'base64');
    if (!body.length) return missingImage();
    return new Response(body, {
      headers: {
        ...CACHE_HEADERS,
        'Content-Type': image.contentType,
        'Content-Length': String(body.length),
      },
    });
  } catch (error) {
    console.error('Failed to fetch offbeat cover:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, {
      status: 500, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
