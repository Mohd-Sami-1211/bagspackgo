import { NextResponse } from 'next/server';
import { getClearAdminCookieOptions } from '@/lib/adminAuth';

/**
 * POST /api/admin/auth/logout
 */
export async function POST() {
    const clearOpts = getClearAdminCookieOptions();
    const response = NextResponse.json({ success: true });
    response.cookies.set(clearOpts);
    return response;
}
