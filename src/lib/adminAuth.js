import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'bagspackgo-admin-secret-change-in-prod';
export const ADMIN_TOKEN_NAME = 'bgp_admin_token';
const ADMIN_TOKEN_MAX_AGE = 12 * 60 * 60; // 12 hours

export function generateAdminToken(payload) {
    return jwt.sign(
        { adminId: payload.adminId, email: payload.email, role: 'admin', name: payload.name },
        ADMIN_JWT_SECRET,
        { expiresIn: ADMIN_TOKEN_MAX_AGE }
    );
}

export function verifyAdminToken(token) {
    try {
        return jwt.verify(token, ADMIN_JWT_SECRET);
    } catch {
        return null;
    }
}

export function getAdminCookieOptions(token) {
    return {
        name: ADMIN_TOKEN_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ADMIN_TOKEN_MAX_AGE,
    };
}

export function getClearAdminCookieOptions() {
    return {
        name: ADMIN_TOKEN_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    };
}

/**
 * Get the current authenticated admin from the request cookies.
 * Returns admin payload or null.
 */
export async function getCurrentAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ADMIN_TOKEN_NAME)?.value;
        if (!token) return null;
        const decoded = verifyAdminToken(token);
        if (!decoded || decoded.role !== 'admin') return null;
        return decoded;
    } catch {
        return null;
    }
}
