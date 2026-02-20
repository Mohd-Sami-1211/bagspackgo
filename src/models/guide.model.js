import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            default: "",
            match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
        },
        dob: {
            type: Date,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null,
        },
        // Tracks the provider's application lifecycle
        // "none" = hasn't submitted the application form yet (first login)
        // "pending" = submitted form, waiting for admin review
        // "approved" = admin approved, full dashboard access granted
        // "rejected" = admin rejected the application
        applicationStatus: {
            type: String,
            enum: ["none", "pending", "approved", "rejected"],
            default: "none",
        },
    },
    { timestamps: true }
);

guideSchema.index({ email: 1 });
guideSchema.index({ phone: 1 });

export const Guide = mongoose.models.Guide || mongoose.model("Guide", guideSchema);
