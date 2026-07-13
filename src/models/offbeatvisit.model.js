import mongoose from 'mongoose';

const offbeatVisitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        offbeat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OffBeat',
            required: true,
            index: true,
        },
        offbeatTitle: {
            type: String,
            required: true,
        },
        visitCount: {
            type: Number,
            default: 1,
        },
        lastVisitedAt: {
            type: Date,
            default: Date.now,
        },
        userSnapshot: {
            username: { type: String, default: '' },
            email: { type: String, default: '' },
            phone: { type: String, default: '' },
        },
    },
    { timestamps: true }
);

// Compound index for unique tracking
offbeatVisitSchema.index({ user: 1, offbeat: 1 }, { unique: true });
// Index for sorting by recent visits
offbeatVisitSchema.index({ lastVisitedAt: -1 });

export const OffBeatVisit = mongoose.models.OffBeatVisit || mongoose.model('OffBeatVisit', offbeatVisitSchema);
