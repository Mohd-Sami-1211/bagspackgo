import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const offbeatSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "OffBeat title is required"],
            trim: true,
            maxlength: 200,
        },
        destination: {
            type: String,
            required: [true, "Destination is required"],
            trim: true,
        },
        region: {
            type: String,
            enum: ['Kashmir', 'Jammu', 'Chenab Valley'],
            required: [true, "Region is required"],
        },
        shortDescription: {
            type: String,
            required: true,
            maxlength: 300,
        },
        description: {
            type: String,
            required: [true, "Detailed description is required"],
            maxlength: 5000,
        },
        
        // Media
        coverPhoto: {
            type: String,
            default: null,
        },
        photographs: {
            type: [String],
            default: [],
        },
        videos: {
            type: [String],
            default: [],
        },
        
        // Highlights & Details
        highlights: {
            type: [String],
            default: [],
        },
        whatsIncluded: {
            type: [String],
            default: [],
        },
        whatsExcluded: {
            type: [String],
            default: [],
        },
        whatToBring: {
            type: [String],
            default: [],
        },
        restrictions: {
            type: [String],
            default: [],
        },

        // Itinerary
        pickupPoints: {
            type: [{
                location: String,
                time: String
            }],
            default: [],
        },
        dropoffPoints: {
            type: [{
                location: String,
                time: String
            }],
            default: [],
        },
        itinerary: {
            type: [{
                title: String,
                points: [String]
            }],
            default: [],
        },

        // FAQs
        faqs: {
            type: [faqSchema],
            default: [],
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },

        visitCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

offbeatSchema.index({ status: 1 });
offbeatSchema.index({ destination: 1 });

export const OffBeat = mongoose.models.OffBeat || mongoose.model("OffBeat", offbeatSchema);
