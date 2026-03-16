import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

/**
 * GET /api/provider/application-status
 * Returns the current application status for the logged-in provider.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const guide = await Guide.findById(user.userId).select("applicationStatus").lean();
        if (!guide) {
            return NextResponse.json(
                { success: false, message: "Account not found" },
                { status: 404 }
            );
        }

        // If they have an application, fetch the details
        let applicationDetails = null;
        if (guide.applicationStatus !== "none") {
            const querySelect = guide.applicationStatus === "rejected" 
                ? "companyname companyemail companymobile destinationId address instagram facebook website status adminNotes createdAt updatedAt licenseFile idFile availability"
                : "companyname status adminNotes createdAt updatedAt";
                
            applicationDetails = await GuideDetails.findOne({ guide: user.userId })
                .select(querySelect)
                .lean();
        }

        return NextResponse.json(
            {
                success: true,
                applicationStatus: guide.applicationStatus,
                application: applicationDetails
                    ? {
                        companyName: applicationDetails.companyname,
                        companyMail: applicationDetails.companyemail,
                        companyMobile: applicationDetails.companymobile,
                        destinationId: applicationDetails.destinationId,
                        address: applicationDetails.address,
                        instagram: applicationDetails.instagram,
                        facebook: applicationDetails.facebook,
                        website: applicationDetails.website,
                        status: applicationDetails.status,
                        adminNotes: applicationDetails.adminNotes || "",
                        submittedAt: applicationDetails.createdAt,
                        lastUpdated: applicationDetails.updatedAt,
                        hasLicense: !!applicationDetails.licenseFile,
                        hasId: !!applicationDetails.idFile,
                        availability: applicationDetails.availability,
                    }
                    : null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Application Status Error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        );
    }
}
