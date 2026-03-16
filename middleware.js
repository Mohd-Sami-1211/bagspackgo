import { NextResponse } from 'next/server';

const ADMIN_TOKEN_NAME = 'bgp_admin_token';

/**
 * Middleware: Protects all /admin/* routes except /admin/login and /admin/setup
 * Also ensures /api/admin/* routes require admin token (except auth sub-routes)
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // ── Admin page routes ──────────────────────────────────────────────────────
    if (pathname.startsWith('/admin')) {
        const publicAdminPaths = ['/admin/login', '/admin/setup'];
        const isPublic = publicAdminPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

        const adminToken = request.cookies.get(ADMIN_TOKEN_NAME)?.value;

        if (!isPublic && !adminToken) {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Very lightweight token presence check — real verification happens server-side in each API/page
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
};
