import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
    {
        // Which side this ticket came from
        side: {
            type: String,
            enum: ["provider", "user"],
            default: "provider",
        },

        // Provider reference (if side === 'provider')
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guide",
            default: null,
        },

        // User reference (if side === 'user')
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Contact info for callbacks
        phone: {
            type: String,
            default: "",
        },

        // Sender email (for reply)
        senderEmail: {
            type: String,
            default: "",
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
        },
        adminReply: {
            type: String,
            default: "",
        },
        repliedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

supportSchema.index({ side: 1, status: 1, createdAt: -1 });

export const Support = mongoose.models.Support || mongoose.model("Support", supportSchema);

