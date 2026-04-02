import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { OTP } from "@/models/otp.model";
import { User } from "@/models/user.model";
import { Guide } from "@/models/guide.model";
import { sendOTPEmail, sendOTPSMS } from "@/lib/otp-service";
import { sanitizeEmail, sanitizePhone } from "@/lib/sanitize";

// Generate a cryptographically random 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Detect if input is email or phone
function getIdentifierType(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (emailRegex.test(input)) return "email";
    if (phoneRegex.test(input)) return "phone";
    return null;
}

export async function POST(request) {
    try {
        await dbConnect();

        const { identifier: rawIdentifier, role } = await request.json();

        if (!rawIdentifier || typeof rawIdentifier !== "string") {
            return NextResponse.json(
                { success: false, message: "Please enter your email or mobile number" },
                { status: 400 }
            );
        }

        // Detect identifier type BEFORE sanitizing
        const identifierType = getIdentifierType(rawIdentifier.trim());

        if (!identifierType) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address or 10-digit mobile number" },
                { status: 400 }
            );
        }

        // Sanitize based on type
        const identifier =
            identifierType === "email"
                ? sanitizeEmail(rawIdentifier)
                : sanitizePhone(rawIdentifier);

        // Validate role
        if (!role || !["user", "provider"].includes(role)) {
            return NextResponse.json(
                { success: false, message: "Please select a valid role" },
                { status: 400 }
            );
        }

        if (identifierType === "email") {
            const existingUser = await User.findOne({ email: identifier });
            const existingGuide = await Guide.findOne({ email: identifier });

            if (existingUser || existingGuide) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `This email is already registered. Please sign in.`,
                    },
                    { status: 409 }
                );
            }
        }

        // Rate limiting: max 1 OTP per 60 seconds for same identifier
        const recentOTP = await OTP.findOne({
            identifier,
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
        });

        if (recentOTP) {
            const waitSeconds = Math.ceil(
                (60 * 1000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000
            );
            return NextResponse.json(
                {
                    success: false,
                    message: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
                },
                { status: 429 }
            );
        }

        // Delete any existing OTPs for this identifier
        await OTP.deleteMany({ identifier });

        // Generate and save new OTP
        const otpCode = generateOTP();
        await OTP.create({
            identifier,
            identifierType,
            otp: otpCode,
            purpose: "signup",
        });

        // Send OTP based on type
        if (identifierType === "email") {
            await sendOTPEmail(rawIdentifier.trim(), otpCode);
        } else {
            await sendOTPSMS(identifier, otpCode);
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    identifierType === "email"
                        ? "OTP sent to your email address"
                        : "OTP sent to your mobile number",
                identifierType,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Something went wrong. Please try again.",
            },
            { status: 500 }
        );
    }
}
