import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,

        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },
        number: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,

        }
    },
    { timestamps: true }
)

export const Guide = mongoose.models.Guide || mongoose.model("Guide", guideSchema)
