import mongoose from 'mongoose';

const companionVisitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // one record per user — we just upsert
        },
        visitCount: {
            type: Number,
            default: 1,
        },
        lastVisitedAt: {
            type: Date,
            default: Date.now,
        },
        // Snapshot of user details at time of visit for quick display
        userSnapshot: {
            username: { type: String, default: '' },
            email:    { type: String, default: '' },
            phone:    { type: String, default: '' },
        },
    },
    { timestamps: true }
);

// TTL index: MongoDB auto-removes documents 24 hours after lastVisitedAt
companionVisitSchema.index({ lastVisitedAt: 1 }, { expireAfterSeconds: 86400 });

// Fast admin queries sorted by recency
companionVisitSchema.index({ lastVisitedAt: -1 });

export const CompanionVisit =
    mongoose.models.CompanionVisit ||
    mongoose.model('CompanionVisit', companionVisitSchema);
