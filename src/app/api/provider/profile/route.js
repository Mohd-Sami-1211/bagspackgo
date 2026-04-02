import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

export const maxDuration = 60; // Optional but good for large payload processing
export const dynamic = 'force-dynamic';

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

        const guide = await Guide.findById(user.userId).select("username email phone applicationStatus createdAt").lean();
        if (!guide) {
            return NextResponse.json(
                { success: false, message: "Provider account not found" },
                { status: 404 }
            );
        }

        const details = await GuideDetails.findOne({ guide: user.userId }).lean();

        return NextResponse.json(
            {
                success: true,
                profile: {
                    name: guide.username,
                    email: guide.email,
                    phone: guide.phone,
                    applicationStatus: guide.applicationStatus,
                    createdAt: guide.createdAt,
                    pausedServices: details.pausedServices || { trip: false, trek: false, event: false },
                    notifications: details.notifications || { email: true, sms: false },
                    ...details
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch profile due to server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await req.json();

        // Destructure incoming data
        const {
            name,
            companyname,
            companyemail,
            companymobile,
            address,
            bio,
            speciality,
            website,
            instagram,
            facebook,
            twitter,
            youtube,
            logo,
            totalTreks,
            totalTrips,
            totalEvents,
            bankName,
            accountHolderName,
            accountType,
            accountNumber,
            ifscCode,
            gstNumber,
            panNumber,
            pausedServices,
            notifications,
        } = body;

        // 1. Update basic Guide info (like name) if provided
        if (name) {
            await Guide.findByIdAndUpdate(user.userId, { username: name });
        }

        console.log("Receiving Profile Save request from user: ", user.userId);
        if (logo) {
            console.log("Logo string length received:", logo.length);
        } else {
            console.log("No logo received in payload.");
        }

        // 2. Update GuideDetails
        const updateFields = {};
        if (companyname !== undefined) updateFields.companyname = companyname;
        if (companyemail !== undefined) updateFields.companyemail = companyemail;
        if (companymobile !== undefined) updateFields.companymobile = companymobile;
        if (address !== undefined) updateFields.address = address;
        if (bio !== undefined) updateFields.bio = bio;
        if (speciality !== undefined) updateFields.speciality = speciality;
        if (website !== undefined) updateFields.website = website;
        if (instagram !== undefined) updateFields.instagram = instagram;
        if (facebook !== undefined) updateFields.facebook = facebook;
        if (twitter !== undefined) updateFields.twitter = twitter;
        if (youtube !== undefined) updateFields.youtube = youtube;
        if (logo !== undefined) updateFields.logo = logo;

        if (totalTreks !== undefined) updateFields.totalTreks = Number(totalTreks);
        if (totalTrips !== undefined) updateFields.totalTrips = Number(totalTrips);
        if (totalEvents !== undefined) updateFields.totalEvents = Number(totalEvents);

        if (bankName !== undefined) updateFields.bankName = bankName;
        if (accountHolderName !== undefined) updateFields.accountHolderName = accountHolderName;
        if (accountType !== undefined) updateFields.accountType = accountType;
        if (accountNumber !== undefined) updateFields.accountNumber = accountNumber;
        if (ifscCode !== undefined) updateFields.ifscCode = ifscCode;

        if (gstNumber !== undefined) updateFields.gstNumber = gstNumber;
        if (panNumber !== undefined) updateFields.panNumber = panNumber;
        if (pausedServices !== undefined) updateFields.pausedServices = pausedServices;
        if (notifications !== undefined) updateFields.notifications = notifications;

        const updatedDetails = await GuideDetails.findOneAndUpdate(
            { guide: user.userId },
            { $set: updateFields },
            { new: true } // Return updated document
        );

        if (!updatedDetails) {
            return NextResponse.json(
                { success: false, message: "Provider details not found, cannot update." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Profile updated successfully!",
                data: updatedDetails
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update profile due to server error" },
            { status: 500 }
        );
    }
}
