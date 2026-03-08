import mongoose from "mongoose";

const guidedetailsSchema = new mongoose.Schema(
    {
        guide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guide",
            required: true,
        },

        companyname: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        companyemail: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },

        companymobile: {
            type: String,
            required: true,
        },

        destinationId: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        website: { type: String, default: "" },
        youtube: { type: String, default: "" },
        twitter: { type: String, default: "" },
        logo: { type: String, default: "" },
        speciality: { type: String, default: "" },
        bio: { type: String, default: "" },

        // Stats
        totalTreks: { type: Number, default: 0 },
        totalTrips: { type: Number, default: 0 },
        totalEvents: { type: Number, default: 0 },

        // Bank Details
        bankName: { type: String, default: "" },
        accountHolderName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        accountType: { type: String, enum: ["savings", "current"], default: "savings" },

        // Legal/Tax
        gstNumber: { type: String, default: "" },
        panNumber: { type: String, default: "" },

        licenseFile: { type: String, required: true },
        idFile: { type: String, required: true },

        availability: {
            trips: { type: Boolean, default: true },
            treks: { type: Boolean, default: true },
        },

        agree: { type: Boolean, required: true },

        pausedServices: {
            trip: { type: Boolean, default: false },
            trek: { type: Boolean, default: false },
            event: { type: Boolean, default: false }
        },

        status: {
            type: String,
            enum: ["submitted", "pending", "approved", "rejected"],
            default: "submitted",
        },

        // Admin can leave notes when reviewing (reason for rejection, etc.)
        adminNotes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export const GuideDetails = mongoose.models.GuideDetails || mongoose.model("GuideDetails", guidedetailsSchema);
