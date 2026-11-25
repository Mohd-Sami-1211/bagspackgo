import { NextResponse } from "next/server";
import { getPublicEventList } from "@/lib/publicEventList";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const result = await getPublicEventList(new URL(request.url).searchParams);
        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "no-cache",
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
