import mongoose from 'mongoose';

const eventVisitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        eventTitle: {
            type: String,
            default: '',
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
            email: { type: String, default: '' },
            phone: { type: String, default: '' },
        },
    },
    { timestamps: true }
);

// TTL index: MongoDB auto-removes documents 24 hours after lastVisitedAt
eventVisitSchema.index({ lastVisitedAt: 1 }, { expireAfterSeconds: 86400 });

// Compound unique index: one record per user-event pair
eventVisitSchema.index({ user: 1, event: 1 }, { unique: true });

// Index for fast admin queries sorted by recency
eventVisitSchema.index({ lastVisitedAt: -1 });

export const EventVisit =
    mongoose.models.EventVisit ||
    mongoose.model('EventVisit', eventVisitSchema);
