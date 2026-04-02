import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { OTP } from "@/models/otp.model";

const MAX_ATTEMPTS = 5;

export async function POST(request) {
    try {
        await dbConnect();

        const { identifier, otp } = await request.json();

        // Validate inputs
        if (!identifier || !otp) {
            return NextResponse.json(
                { success: false, message: "Identifier and OTP are required" },
                { status: 400 }
            );
        }

        if (!/^\d{4}$/.test(otp)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid 4-digit OTP" },
                { status: 400 }
            );
        }

        // Normalize identifier (lowercase email)
        const normalizedIdentifier = identifier.includes("@")
            ? identifier.toLowerCase()
            : identifier;

        // Find the most recent OTP for this identifier
        const otpRecord = await OTP.findOne({
            identifier: normalizedIdentifier,
            purpose: "signup",
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, message: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Check max attempts
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return NextResponse.json(
                { success: false, message: "Too many failed attempts. Please request a new OTP." },
                { status: 429 }
            );
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            const remaining = MAX_ATTEMPTS - otpRecord.attempts;
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
                },
                { status: 400 }
            );
        }

        // OTP is correct — delete it so it can't be reused
        await OTP.deleteOne({ _id: otpRecord._id });

        return NextResponse.json(
            {
                success: true,
                message: "OTP verified successfully",
                verified: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
