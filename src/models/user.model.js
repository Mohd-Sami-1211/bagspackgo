import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
            required: [true, "Date of birth is required"],
        },
        role: {
            type: String,
            enum: {
                values: ["user", "provider", "admin"],
                message: "Role must be user, provider, or admin",
            },
            default: "user",
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
    },
    { timestamps: true }
);

// Index for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
