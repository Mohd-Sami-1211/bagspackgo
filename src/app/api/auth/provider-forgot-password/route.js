import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Guide } from "@/models/guide.model";
import { OTP } from "@/models/otp.model";
import { sendOTPEmail } from "@/lib/otp-service";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(request) {
    try {
        await dbConnect();
        
        const { email: rawEmail } = await request.json();
        if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
            return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
        }

        const email = sanitizeEmail(rawEmail);

        const guide = await Guide.findOne({ email });
        if (!guide) {
            return NextResponse.json({ success: false, message: "No provider account found with this email" }, { status: 404 });
        }

        // Rate list 60s
        const recentOTP = await OTP.findOne({
            identifier: email,
            purpose: "password_reset",
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
        });

        if (recentOTP) {
            const wait = Math.ceil((60 * 1000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000);
            return NextResponse.json({ success: false, message: `Wait ${wait}s before requesting a new OTP` }, { status: 429 });
        }

        await OTP.deleteMany({ identifier: email, purpose: "password_reset" });

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        await OTP.create({
            identifier: email,
            identifierType: "email",
            otp: otpCode,
            purpose: "password_reset",
        });

        await sendOTPEmail(email, otpCode);

        return NextResponse.json({ success: true, message: "Password reset OTP sent to your email" });
    } catch (error) {
        console.error("Provider Forgot Password Error:", error);
        return NextResponse.json({ success: false, message: "Failed to send reset OTP" }, { status: 500 });
    }
}
