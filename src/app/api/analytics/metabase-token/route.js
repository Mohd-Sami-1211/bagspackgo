// src/app/api/analytics/metabase-token/route.js
// Server-side API route that generates a SIGNED Metabase embed token.
// This is more secure than public embeds because it uses a secret key
// that is never exposed to the browser.
//
// Usage from the client:
//   const res = await fetch('/api/analytics/metabase-token?type=dashboard&id=1');
//   const { iframeUrl } = await res.json();
//
// Environment variables required:
//   METABASE_SECRET_KEY   — found in Metabase → Admin → Embedding → Embedded in your application
//   NEXT_PUBLIC_METABASE_SITE_URL — e.g. https://metabase.yoursite.com

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;
const METABASE_SITE_URL = process.env.NEXT_PUBLIC_METABASE_SITE_URL;

function signToken(payload, secret) {
    // Manual JWT signing (HS256) — avoids needing a full JWT library
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${signature}`;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard'; // 'dashboard' | 'question'
    const id = parseInt(searchParams.get('id'), 10);
    const params = searchParams.get('params') ? JSON.parse(searchParams.get('params')) : {};

    if (!METABASE_SECRET_KEY) {
        return NextResponse.json(
            { error: 'METABASE_SECRET_KEY is not configured' },
            { status: 500 }
        );
    }

    if (!METABASE_SITE_URL) {
        return NextResponse.json(
            { error: 'NEXT_PUBLIC_METABASE_SITE_URL is not configured' },
            { status: 500 }
        );
    }

    if (!id || isNaN(id)) {
        return NextResponse.json(
            { error: 'Valid numeric `id` query param is required' },
            { status: 400 }
        );
    }

    const payload = {
        resource: { [type]: id },
        params,
        exp: Math.round(Date.now() / 1000) + 60 * 10, // 10 minute expiry
    };

    const token = signToken(payload, METABASE_SECRET_KEY);
    const iframeUrl = `${METABASE_SITE_URL}/embed/${type}/${token}#bordered=false&titled=true`;

    return NextResponse.json({ iframeUrl, token });
}
