import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guide",
            required: true,
        },
        type: {
            type: String,
            enum: ["callback", "message"],
            required: true,
        },
        subject: {
            type: String,
            default: "",
        },
        message: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending",
        },
        adminNotes: {
            type: String,
            default: "",
        }
    },
    { timestamps: true }
);

export const Support = mongoose.models.Support || mongoose.model("Support", supportSchema);
