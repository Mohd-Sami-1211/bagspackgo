import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user.model";
import { Guide } from "@/models/guide.model";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import bcrypt from "bcryptjs";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes in ms

// Detect if input is email or phone
function getIdentifierType(input) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) return "email";
    if (/^\d{10}$/.test(input)) return "phone";
    return null;
}

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const rawIdentifier = body.identifier ? sanitizeString(body.identifier) : "";
        const password = body.password || "";
        const role = body.role || "";

        // ──────────────── Validations ────────────────

        if (!rawIdentifier || !password) {
            return NextResponse.json(
                { success: false, message: "Please enter your email/phone and password" },
                { status: 400 }
            );
        }

        if (!role || !["user", "provider"].includes(role)) {
            return NextResponse.json(
                { success: false, message: "Please select a valid role" },
                { status: 400 }
            );
        }

        // Detect and sanitize identifier
        const identifierType = getIdentifierType(rawIdentifier);
        if (!identifierType) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address or 10-digit mobile number" },
                { status: 400 }
            );
        }

        const identifier =
            identifierType === "email"
                ? sanitizeEmail(rawIdentifier)
                : sanitizePhone(rawIdentifier);

        // ──────────────── Find User/Guide ────────────────

        const searchQuery =
            identifierType === "email" ? { email: identifier } : { phone: identifier };

        let account = null;
        let accountRole = "";

        if (role === "user") {
            account = await User.findOne(searchQuery);
            accountRole = "user";
        } else {
            account = await Guide.findOne(searchQuery);
            accountRole = "provider";
        }

        // Generic error message (don't reveal if account exists or not)
        const invalidMsg = "Invalid credentials. Please check your email/phone and password.";

        if (!account) {
            return NextResponse.json(
                { success: false, message: invalidMsg },
                { status: 401 }
            );
        }

        // ──────────────── Check Account Status ────────────────

        // Check if account is active
        if (!account.isActive) {
            return NextResponse.json(
                { success: false, message: "Your account has been deactivated. Please contact support." },
                { status: 403 }
            );
        }

        // Check if account is locked
        if (account.lockUntil && account.lockUntil > new Date()) {
            const remainingMinutes = Math.ceil(
                (account.lockUntil.getTime() - Date.now()) / (60 * 1000)
            );
            return NextResponse.json(
                {
                    success: false,
                    message: `Account is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`,
                },
                { status: 423 }
            );
        }

        // ──────────────── Verify Password ────────────────

        const isPasswordValid = await bcrypt.compare(password, account.password);

        if (!isPasswordValid) {
            // Increment failed login attempts
            account.loginAttempts = (account.loginAttempts || 0) + 1;

            // Lock account if max attempts reached
            if (account.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                account.lockUntil = new Date(Date.now() + LOCK_DURATION);
                await account.save();

                return NextResponse.json(
                    {
                        success: false,
                        message: "Too many failed login attempts. Account locked for 30 minutes.",
                    },
                    { status: 423 }
                );
            }

            await account.save();

            const remaining = MAX_LOGIN_ATTEMPTS - account.loginAttempts;
            return NextResponse.json(
                {
                    success: false,
                    message: `${invalidMsg} ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
                },
                { status: 401 }
            );
        }

        // ──────────────── Login Successful ────────────────

        // Reset login attempts on successful login
        if (account.loginAttempts > 0 || account.lockUntil) {
            account.loginAttempts = 0;
            account.lockUntil = null;
            await account.save();
        }

        return NextResponse.json(
            {
                success: true,
                message: "Login successful!",
                user: {
                    id: account._id,
                    username: account.username,
                    email: account.email,
                    phone: account.phone,
                    role: accountRole,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Signin Error:", error);
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
