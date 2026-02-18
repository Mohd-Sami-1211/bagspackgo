import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info from the JWT session.
 * Used by the frontend to check if user is logged in.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, authenticated: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                authenticated: true,
                user: {
                    id: user.userId,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Auth Check Error:", error);
        return NextResponse.json(
            { success: false, authenticated: false, message: "Session invalid" },
            { status: 401 }
        );
    }
}
