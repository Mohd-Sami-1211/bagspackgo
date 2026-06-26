import mongoose from 'mongoose';

const packageVisitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        package: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package',
            required: true,
        },
        packageTitle: {
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
packageVisitSchema.index({ lastVisitedAt: 1 }, { expireAfterSeconds: 86400 });

// Compound unique index: one record per user-package pair
packageVisitSchema.index({ user: 1, package: 1 }, { unique: true });

// Index for fast admin queries sorted by recency
packageVisitSchema.index({ lastVisitedAt: -1 });

export const PackageVisit =
    mongoose.models.PackageVisit ||
    mongoose.model('PackageVisit', packageVisitSchema);
