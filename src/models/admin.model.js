import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            default: 'Admin',
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        isSetup: {
            type: Boolean,
            default: true, // true once the setup has been completed
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
