import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Presence } from '@/models/presence.model';

const SID_COOKIE = 'bpg_sid';
// A session is "live" if it was seen within this window (heartbeat ~20s + buffer).
const LIVE_WINDOW_MS = 45 * 1000;

/**
 * POST /api/presence
 * Heartbeat from any page. Upserts this session's presence and refreshes lastSeen.
 * Sets an anonymous session-id cookie on first contact so anonymous visitors count.
 * Returns the current site-wide live count.
 */
export async function POST(req) {
    try {
        await dbConnect();

        let body = {};
        try {
            body = await req.json();
        } catch {
            body = {};
        }
        const { path = '' } = body;

        // Reuse the existing session id cookie, or mint a new one.
        let sessionId = req.cookies.get(SID_COOKIE)?.value;
        let isNewSession = false;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            isNewSession = true;
        }

        // Attach user info if authenticated (optional — anonymous sessions still count).
        const currentUser = await getCurrentUser();

        await Presence.findOneAndUpdate(
            { sessionId },
            {
                $set: {
                    lastSeen: new Date(),
                    user: currentUser?.userId || null,
                    role: currentUser?.role || 'anonymous',
                    path,
                },
            },
            { upsert: true, new: true }
        );

        const since = new Date(Date.now() - LIVE_WINDOW_MS);
        const liveCount = await Presence.countDocuments({ lastSeen: { $gte: since } });

        const res = NextResponse.json({ success: true, liveCount });

        if (isNewSession) {
            res.cookies.set(SID_COOKIE, sessionId, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year; presence itself expires via TTL
            });
        }

        return res;
    } catch (err) {
        console.error('[Presence] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

/**
 * GET /api/presence
 * Returns the current site-wide live count (sessions seen within the live window).
 * Used by the admin dashboard.
 */
export async function GET() {
    try {
        await dbConnect();
        const since = new Date(Date.now() - LIVE_WINDOW_MS);
        const liveCount = await Presence.countDocuments({ lastSeen: { $gte: since } });
        const liveLoggedIn = await Presence.countDocuments({
            lastSeen: { $gte: since },
            user: { $ne: null },
        });
        return NextResponse.json({ success: true, liveCount, liveLoggedIn });
    } catch (err) {
        console.error('[Presence GET] Error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
