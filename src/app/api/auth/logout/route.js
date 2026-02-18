import { NextResponse } from "next/server";
import { getClearCookieOptions } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Clears the auth cookie, effectively logging the user out.
 */
export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logged out successfully" },
            { status: 200 }
        );

        // Clear the auth cookie
        response.cookies.set(getClearCookieOptions());

        return response;
    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
