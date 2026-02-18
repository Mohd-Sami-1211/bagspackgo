import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true, // Can be phone number or email
    },
    identifierType: {
        type: String,
        enum: ["phone", "email"],
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ["signup", "login", "reset-password"],
        default: "signup",
    },
    attempts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // Auto-delete after 5 minutes (TTL index)
    },
});

export const OTP = mongoose.models.OTP || mongoose.model("OTP", otpSchema);
