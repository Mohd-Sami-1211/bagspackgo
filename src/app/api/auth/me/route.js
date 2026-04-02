import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Guide } from "@/models/guide.model";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info from the JWT session.
 * For providers, also fetches live applicationStatus from MongoDB.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, authenticated: false, message: "Guest session" },
                { status: 200 }
            );
        }

        // Build the user response
        const userResponse = {
            id: user.userId,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };

        // For providers, fetch the live applicationStatus from the database
        // (JWT may have stale data if admin approved/rejected after login)
        if (user.role === "provider") {
            try {
                await dbConnect();
                const guide = await Guide.findById(user.userId).select("applicationStatus").lean();
                userResponse.applicationStatus = guide?.applicationStatus || "none";
            } catch (dbErr) {
                console.error("DB lookup for applicationStatus failed:", dbErr);
                userResponse.applicationStatus = "none";
            }
        }

        return NextResponse.json(
            {
                success: true,
                authenticated: true,
                user: userResponse,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Auth Check Error:", error);
        return NextResponse.json(
            { success: false, authenticated: false, message: "No session active" },
            { status: 200 }
        );
    }
}
