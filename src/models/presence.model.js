import mongoose from 'mongoose';

/**
 * Presence
 *
 * One document per active browser session (anonymous or logged-in). Each client
 * sends a heartbeat every ~20s; the TTL index auto-deletes a session 60s after
 * its last heartbeat, so the collection only ever holds currently-online sessions.
 *
 * Site-wide "live now" = number of presence docs seen within the live window.
 */
const presenceSchema = new mongoose.Schema(
    {
        // Stable per-browser id (UUID stored in a cookie). Anonymous visitors count too.
        sessionId: {
            type: String,
            required: true,
            unique: true,
        },
        // Attached when the visitor is authenticated; null for anonymous.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        role: {
            type: String,
            default: 'anonymous',
        },
        // Last page the session reported (for optional drill-down).
        path: {
            type: String,
            default: '',
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// TTL index: a session disappears 60s after its last heartbeat (heartbeat is ~20s).
presenceSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 60 });

export const Presence =
    mongoose.models.Presence ||
    mongoose.model('Presence', presenceSchema);
