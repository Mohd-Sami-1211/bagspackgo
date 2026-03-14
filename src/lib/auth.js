import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "bagspackgo-secret-key-change-in-production";
const TOKEN_NAME = "bagspackgo_token";
const TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Generate a JWT token for authenticated user
 * @param {Object} payload - { userId, username, role, email, phone }
 * @returns {string} JWT token
 */
export function generateToken(payload) {
    return jwt.sign(
        {
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
            email: payload.email || "",
            phone: payload.phone || "",
        },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE }
    );
}

/**
 * Verify a JWT token and return the decoded payload
 * @param {string} token
 * @returns {Object|null} decoded payload or null if invalid
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Set the auth token as an HTTP-only cookie
 * @param {string} token - JWT token
 * @returns {Object} cookie options for NextResponse
 */
export function getTokenCookieOptions(token) {
    return {
        name: TOKEN_NAME,
        value: token,
        httpOnly: true,       // Can't be accessed via JavaScript (XSS protection)
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "lax",      // CSRF protection
        path: "/",            // Available on all routes
        maxAge: TOKEN_MAX_AGE,
    };
}

/**
 * Get the clear-cookie options (for logout)
 */
export function getClearCookieOptions() {
    return {
        name: TOKEN_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0, // Expire immediately
    };
}

/**
 * Get the current authenticated user from the request cookies
 * Use this in API routes and server components
 * @returns {Object|null} user payload or null if not authenticated
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(TOKEN_NAME)?.value;

        if (!token) return null;

        const decoded = verifyToken(token);
        return decoded;
    } catch (error) {
        return null;
    }
}
