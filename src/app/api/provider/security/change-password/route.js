import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import bcrypt from "bcryptjs";

export async function PUT(req) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, message: "Please provide both current and new password." },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, message: "New password must be at least 8 characters long." },
                { status: 400 }
            );
        }

        await dbConnect();

        // Fetch user from DB
        const guide = await Guide.findById(user.userId);

        if (!guide) {
            return NextResponse.json(
                { success: false, message: "Provider account not found." },
                { status: 404 }
            );
        }

        // Compare current password
        const isMatch = await bcrypt.compare(currentPassword, guide.password);

        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: "Incorrect current password." },
                { status: 400 }
            );
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        guide.password = hashedPassword;
        await guide.save();

        return NextResponse.json(
            { success: true, message: "Password updated successfully!" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update password due to server error." },
            { status: 500 }
        );
    }
}
