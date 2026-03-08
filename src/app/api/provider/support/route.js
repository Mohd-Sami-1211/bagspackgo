import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Support } from "@/models/support.model";

export async function POST(req) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { type, subject, message } = body;

        if (!type || !["callback", "message"].includes(type)) {
            return NextResponse.json(
                { success: false, message: "Invalid support request type." },
                { status: 400 }
            );
        }

        if (type === "message" && (!subject || !message)) {
            return NextResponse.json(
                { success: false, message: "Subject and message are required." },
                { status: 400 }
            );
        }

        await dbConnect();

        // Rate limiting: Maximum 3 requests per 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentRequestsCount = await Support.countDocuments({
            provider: user.userId,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (recentRequestsCount >= 3) {
            return NextResponse.json(
                { success: false, message: "You have reached your daily limit of 3 support requests. Please try again later." },
                { status: 429 }
            );
        }

        const supportReq = await Support.create({
            provider: user.userId,
            type,
            subject: subject || "",
            message: message || ""
        });

        return NextResponse.json(
            { success: true, message: "Your request has been submitted successfully to the admin team.", data: supportReq },
            { status: 201 }
        );

    } catch (error) {
        console.error("Support POST Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to submit support request." },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const requests = await Support.find({ provider: user.userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: requests });
    } catch (error) {
        console.error("Support GET Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
