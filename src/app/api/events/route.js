import { NextResponse } from "next/server";
import { getPublicEventList } from "@/lib/publicEventList";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const result = await getPublicEventList(new URL(request.url).searchParams);
        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "public, max-age=0, must-revalidate",
                "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                "Vercel-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300",
            },
        });
    } catch (error) {
        console.error("Public Events Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
