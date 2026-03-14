import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Guide } from "@/models/guide.model";
import { OTP } from "@/models/otp.model";
import { validatePassword } from "@/lib/password-validator";
import { sanitizeEmail } from "@/lib/sanitize";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await dbConnect();
        
        const { email: rawEmail, otp, newPassword } = await request.json();
        
        if (!rawEmail || !otp || !newPassword) {
            return NextResponse.json({ success: false, message: "Email, OTP and new password are required" }, { status: 400 });
        }

        const email = sanitizeEmail(rawEmail);

        // Validate password
        const passCheck = validatePassword(newPassword);
        if (!passCheck.isValid) {
            return NextResponse.json({ success: false, message: "Password does not meet requirements" }, { status: 400 });
        }

        const guide = await Guide.findOne({ email });
        if (!guide) {
            return NextResponse.json({ success: false, message: "Provider account not found" }, { status: 404 });
        }

        const otpRecord = await OTP.findOne({ identifier: email, purpose: "password_reset" }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json({ success: false, message: "OTP expired. Request a new one." }, { status: 400 });
        }

        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return NextResponse.json({ success: false, message: "Too many attempts. Request a new OTP." }, { status: 429 });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
        }

        // OTP Valid - change password
        await OTP.deleteOne({ _id: otpRecord._id });

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Reset the password AND clear any login locks
        guide.password = hashedPassword;
        guide.loginAttempts = 0;
        guide.lockUntil = null;
        await guide.save();

        return NextResponse.json({ success: true, message: "Password reset successful. You can now log in." });
    } catch (error) {
        console.error("Provider Reset Password Error:", error);
        return NextResponse.json({ success: false, message: "Failed to reset password" }, { status: 500 });
    }
}
