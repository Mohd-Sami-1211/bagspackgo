import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

/**
 * GET /api/admin/provider/review
 * List all providers and their application status.
 * Use this to find the guideId you need for approving/rejecting.
 *
 * Usage (browser console):
 *   fetch('/api/admin/provider/review').then(r => r.json()).then(console.log)
 */
export async function GET() {
    try {
        await dbConnect();

        const guides = await Guide.find({})
            .select("_id username email phone applicationStatus createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: guides.length,
            providers: guides.map((g) => ({
                guideId: g._id,
                username: g.username,
                email: g.email,
                phone: g.phone,
                applicationStatus: g.applicationStatus || "none",
                createdAt: g.createdAt,
            })),
        });
    } catch (error) {
        console.error("Admin List Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/provider/review
 * Approve or reject a provider application.
 *
 * Usage (browser console):
 *   // Step 1: Get list of providers & find the guideId
 *   fetch('/api/admin/provider/review').then(r => r.json()).then(console.log)
 *
 *   // Step 2: Approve or reject using the guideId from step 1
 *   fetch('/api/admin/provider/review', {
 *     method: 'PATCH',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       guideId: '<paste guideId from step 1>',
 *       action: 'approve',
 *       adminNotes: 'Looks good!'
 *     })
 *   }).then(r => r.json()).then(console.log)
 *
 * TODO: Add proper admin authentication when admin panel is built.
 */
export async function PATCH(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { guideId, action, adminNotes } = body;

        if (!guideId) {
            return NextResponse.json(
                { success: false, message: "guideId is required" },
                { status: 400 }
            );
        }

        // Validate that guideId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(guideId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `"${guideId}" is not a valid MongoDB ObjectId. Use GET /api/admin/provider/review to find the correct guideId.`,
                },
                { status: 400 }
            );
        }

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { success: false, message: "action must be 'approve' or 'reject'" },
                { status: 400 }
            );
        }

        // Find the guide
        const guide = await Guide.findById(guideId);
        if (!guide) {
            return NextResponse.json(
                { success: false, message: "Provider not found with that guideId" },
                { status: 404 }
            );
        }

        // Find their application
        const guideDetails = await GuideDetails.findOne({ guide: guideId });
        if (!guideDetails) {
            return NextResponse.json(
                { success: false, message: "No application found for this provider. They may not have submitted the form yet." },
                { status: 404 }
            );
        }

        // Update status
        const newStatus = action === "approve" ? "approved" : "rejected";

        guide.applicationStatus = newStatus;
        await guide.save({ validateBeforeSave: false });

        guideDetails.status = newStatus;
        guideDetails.adminNotes = adminNotes || "";
        await guideDetails.save();

        return NextResponse.json(
            {
                success: true,
                message: `Provider "${guide.username}" ${newStatus} successfully.`,
                guide: {
                    id: guide._id,
                    username: guide.username,
                    applicationStatus: guide.applicationStatus,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Admin Review Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
