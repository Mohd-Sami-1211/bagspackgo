import mongoose from "mongoose";

const pickupPointSchema = new mongoose.Schema(
    {
        location: { type: String, required: true, trim: true },
        link: { type: String, default: "" },
        time: { type: String, required: true },
    },
    { _id: false }
);

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const eventSchema = new mongoose.Schema(
    {
        // Who created this event
        guide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guide",
            required: true,
        },

        // Basic Information (Step 1)
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: 200,
        },
        eventType: {
            type: String,
            required: [true, "Event type is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, "Event date is required"],
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        totalSlots: {
            type: Number,
            required: true,
            min: 1,
            default: 20,
        },
        bookedSlots: {
            type: Number,
            default: 0,
            min: 0,
        },
        pricePerSlot: {
            type: Number,
            required: [true, "Price per slot is required"],
            min: 0,
        },
        destination: {
            type: String,
            required: [true, "Destination is required"],
            trim: true,
        },
        destinationLink: {
            type: String,
            default: "",
        },

        // Event Details (Step 2)
        about: {
            type: String,
            required: [true, "Event description is required"],
            maxlength: 5000,
        },

        // Highlights & Inclusions (Step 3)
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

        // FAQs (Step 4)
        faqs: {
            type: [faqSchema],
            default: [],
        },

        // Requirements (Step 5)
        whatToBring: {
            type: [String],
            default: [],
        },
        restrictions: {
            type: [String],
            default: [],
        },

        // Itinerary (Step 6)
        pickupPoints: {
            type: [pickupPointSchema],
            default: [],
        },
        includePickup: {
            type: Boolean,
            default: true,
        },
        itinerary: {
            type: [String],
            default: [],
        },

        // Photographs (Step 7) — location/experience photos as base64 or URLs
        photographs: {
            type: [String],
            default: [],
        },

        // Terms and Conditions — provider-specified policies
        termsAndConditions: {
            type: [String],
            default: [],
        },

        // Poster (Step 8) — stored as base64 data URL or cloud URL
        poster: {
            type: String,
            default: "",
        },

        // Event visibility — public events show on platform, private only via link
        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },

        // Application form type — default uses built-in form, customized uses provider's custom form
        applicationFormType: {
            type: String,
            enum: ["default", "customized"],
            default: "default",
        },

        // Custom form fields — Google Forms-like flat array of fields
        customFormFields: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        // Event lifecycle
        status: {
            type: String,
            enum: ["draft", "published", "cancelled", "completed"],
            default: "published",
        },

        // Aggregated rating (updated when reviews come in)
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },

        // Delete Request — provider submits, admin approves/rejects
        deleteRequest: {
            requested: { type: Boolean, default: false },
            requestedAt: { type: Date, default: null },
            reason: { type: String, default: "" },
            adminStatus: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending",
            },
            adminNotes: { type: String, default: "" },
            resolvedAt: { type: Date, default: null },
        },
    },
    { timestamps: true }
);

eventSchema.index({ status: 1, date: 1, visibility: 1 });

eventSchema.index({ status: 1, location: 1 });
eventSchema.index({ status: 1, eventType: 1 });

eventSchema.index({ guide: 1 });

export const Event =
    mongoose.models.Event || mongoose.model("Event", eventSchema);
