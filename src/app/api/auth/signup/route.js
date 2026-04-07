import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user.model";
import { Guide } from "@/models/guide.model";
import { validatePassword } from "@/lib/password-validator";
import { sanitizeSignupData } from "@/lib/sanitize";
import { sendWelcomeEmail } from "@/lib/otp-service";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        await dbConnect();

        // ──────────────── Sanitize All Inputs ────────────────
        const rawData = await request.json();
        const { identifier, identifierType, role, name, email, phone, dob, password } =
            sanitizeSignupData(rawData);

        // ──────────────── Validations ────────────────

        if (!identifier || !identifierType || !role || !name || !password) {
            return NextResponse.json(
                { success: false, message: "Please fill all required fields" },
                { status: 400 }
            );
        }

        // Validate role (already sanitized, but double-check)
        if (!["user", "provider"].includes(role)) {
            return NextResponse.json(
                { success: false, message: "Invalid role selected" },
                { status: 400 }
            );
        }

        // Validate name
        if (name.length < 2 || name.length > 50) {
            return NextResponse.json(
                { success: false, message: "Name must be between 2 and 50 characters" },
                { status: 400 }
            );
        }

        // ──────────────── Password Strength Check ────────────────
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password does not meet security requirements",
                    errors: passwordCheck.errors,
                },
                { status: 400 }
            );
        }

        // Validate DOB for users
        if (role === "user") {
            if (!dob) {
                return NextResponse.json(
                    { success: false, message: "Date of birth is required" },
                    { status: 400 }
                );
            }

            // Check if DOB is a valid date and user is at least 13 years old
            const dobDate = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - dobDate.getFullYear();
            const monthDiff = today.getMonth() - dobDate.getMonth();

            if (age < 13 || (age === 13 && monthDiff < 0)) {
                return NextResponse.json(
                    { success: false, message: "You must be at least 13 years old to sign up" },
                    { status: 400 }
                );
            }

            if (dobDate > today) {
                return NextResponse.json(
                    { success: false, message: "Date of birth cannot be in the future" },
                    { status: 400 }
                );
            }
        }

        // Build the primary contact info based on what was verified
        let finalPhone = "";
        let finalEmail = "";

        if (identifierType === "phone") {
            finalPhone = identifier;
            finalEmail = email || "";
        } else {
            finalEmail = identifier.toLowerCase();
            finalPhone = phone || ('00' + Math.floor(10000000 + Math.random() * 90000000).toString());
        }

        // Validate email format (if provided)
        if (finalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        // Validate phone format (if provided)
        if (finalPhone && !/^\d{10}$/.test(finalPhone)) {
            return NextResponse.json(
                { success: false, message: "Please enter a valid 10-digit mobile number" },
                { status: 400 }
            );
        }

        // ──────────────── Check Duplicates ────────────────

        const searchQueries = [];
        if (finalEmail) searchQueries.push({ email: finalEmail });

        if (searchQueries.length > 0) {
            const existingAccount = role === "user"
                ? await User.findOne({ $or: searchQueries })
                : await Guide.findOne({ $or: searchQueries });

            if (existingAccount) {
                return NextResponse.json(
                    { success: false, message: `An account with this email or phone already exists as a ${role}` },
                    { status: 409 }
                );
            }
        }

        // ──────────────── Hash Password (bcrypt with high cost) ────────────────

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ──────────────── Create Account ────────────────

        const accountData = {
            username: name,
            email: finalEmail,
            phone: finalPhone,
            password: hashedPassword,
            isPhoneVerified: identifierType === "phone",
            isEmailVerified: identifierType === "email",
        };

        if (dob) accountData.dob = new Date(dob);

        if (role === "user") {
            accountData.role = "user";
            const newUser = await User.create(accountData);

            // Send welcome email (non-blocking — don't await, don't let it block response)
            if (finalEmail) {
                sendWelcomeEmail(finalEmail, name, "user").catch((err) =>
                    console.error("Welcome email error:", err.message)
                );
            }

            // Never expose password hash or sensitive fields in response
            return NextResponse.json(
                {
                    success: true,
                    message: "Account created successfully! Welcome to bagspackgo.",
                    user: {
                        id: newUser._id,
                        username: newUser.username,
                        role: newUser.role,
                    },
                },
                { status: 201 }
            );
        } else {
            const newGuide = await Guide.create(accountData);

            // Send welcome email (non-blocking)
            if (finalEmail) {
                sendWelcomeEmail(finalEmail, name, "provider").catch((err) =>
                    console.error("Welcome email error:", err.message)
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    message: "Service provider account created successfully!",
                    user: {
                        id: newGuide._id,
                        username: newGuide.username,
                        role: "provider",
                    },
                },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Signup Error:", error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json(
                { success: false, message: `This ${field} is already registered` },
                { status: 409 }
            );
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return NextResponse.json(
                { success: false, message: messages[0] },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
