import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST /api/provider/apply
 * Submit the provider application form.
 * Requires: authenticated provider who hasn't already submitted.
 */
export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please sign in as a service provider." },
                { status: 401 }
            );
        }

        await dbConnect();

        // Check if provider already submitted an application
        const guide = await Guide.findById(user.userId);
        if (!guide) {
            return NextResponse.json(
                { success: false, message: "Account not found." },
                { status: 404 }
            );
        }

        // Handle guides created before applicationStatus field was added
        const currentStatus = guide.applicationStatus || "none";

        if (currentStatus !== "none" && currentStatus !== "rejected") {
            return NextResponse.json(
                {
                    success: false,
                    message: currentStatus === "approved"
                        ? "Your application is already approved!"
                        : "You've already submitted an application. Please wait for admin review.",
                    applicationStatus: currentStatus,
                },
                { status: 409 }
            );
        }

        // Parse form data
        const body = await request.json();

        // Validate required fields
        const required = ["companyName", "companyMail", "companyMobile", "destinationId", "address"];
        const missing = required.filter(field => !body[field]?.toString().trim());
        if (missing.length > 0) {
            return NextResponse.json(
                { success: false, message: `Missing required fields: ${missing.join(", ")}` },
                { status: 400 }
            );
        }

        if (!body.agree) {
            return NextResponse.json(
                { success: false, message: "You must agree to the terms and conditions." },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const companyName = sanitizeString(body.companyName);
        const companyEmail = sanitizeEmail(body.companyMail);
        const companyMobile = sanitizePhone(body.companyMobile);
        const address = sanitizeString(body.address);
        const instagram = sanitizeString(body.instagram || "");
        const facebook = sanitizeString(body.facebook || "");
        const website = sanitizeString(body.website || "");
        const destinationId = sanitizeString(body.destinationId);

        // For files, we store the base64/URL string (in production, use cloud storage)
        const licenseFile = body.licenseFile || "pending_upload";
        const idFile = body.idFile || "pending_upload";

        // Check if a previous rejected application exists — update it instead
        let guideDetails = await GuideDetails.findOne({ guide: guide._id });

        if (guideDetails) {
            // Update existing application (resubmission after rejection)
            guideDetails.companyname = companyName;
            guideDetails.companyemail = companyEmail;
            guideDetails.companymobile = companyMobile;
            guideDetails.destinationId = destinationId;
            guideDetails.address = address;
            guideDetails.instagram = instagram;
            guideDetails.facebook = facebook;
            guideDetails.website = website;
            guideDetails.licenseFile = licenseFile;
            guideDetails.idFile = idFile;
            guideDetails.availability = body.availability || { trips: true, treks: true };
            guideDetails.agree = true;
            guideDetails.status = "pending";
            guideDetails.adminNotes = "";
            await guideDetails.save();
        } else {
            // Create new application
            guideDetails = await GuideDetails.create({
                guide: guide._id,
                companyname: companyName,
                companyemail: companyEmail,
                companymobile: companyMobile,
                destinationId,
                address,
                instagram,
                facebook,
                website,
                licenseFile,
                idFile,
                availability: body.availability || { trips: true, treks: true },
                agree: true,
                status: "pending",
            });
        }

        // Update the Guide's applicationStatus to "pending"
        guide.applicationStatus = "pending";
        await guide.save({ validateBeforeSave: false });

        return NextResponse.json(
            {
                success: true,
                message: "Application submitted successfully! Our team will review it shortly.",
                applicationStatus: "pending",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Provider Apply Error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            return NextResponse.json(
                { success: false, message: `This ${field === "companyemail" ? "company email" : field === "companyname" ? "company name" : field} is already registered.` },
                { status: 409 }
            );
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(e => e.message);
            return NextResponse.json(
                { success: false, message: messages.join(". ") },
                { status: 400 }
            );
        }

        // Handle CastError (e.g., invalid ObjectId)
        if (error.name === "CastError") {
            return NextResponse.json(
                { success: false, message: `Invalid value for ${error.path}: ${error.value}` },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

