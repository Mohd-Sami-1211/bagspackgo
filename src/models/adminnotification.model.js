import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['booking', 'application', 'support', 'payment', 'provider_action', 'user', 'provider', 'system'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        link: {
            type: String, // Internal admin route, e.g. '/admin/applications'
            default: '',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        entityModel: {
            type: String, // 'TripBooking', 'GuideDetails', 'Support', 'Event', etc.
            default: '',
        },
    },
    { timestamps: true }
);

adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

export const AdminNotification =
    mongoose.models.AdminNotification ||
    mongoose.model('AdminNotification', adminNotificationSchema);
