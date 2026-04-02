import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/models/user.model";

export async function PUT(req) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user || user.role !== "user") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { name, phone } = await req.json();

        if (!name || name.trim().length < 2) {
            return NextResponse.json({ success: false, message: "Valid name is required" }, { status: 400 });
        }

        if (!phone || !/^\d{10}$/.test(phone)) {
            return NextResponse.json({ success: false, message: "Valid 10-digit phone number is required" }, { status: 400 });
        }

        const existingPhone = await User.findOne({ phone, _id: { $ne: user.userId } });
        if (existingPhone) {
            return NextResponse.json({ success: false, message: "Phone number already in use" }, { status: 409 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            user.userId,
            { username: name.trim(), phone, isPhoneVerified: true },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role
            }
        });

    } catch (error) {
        console.error("User Update Profile Error:", error);
        return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
    }
}
