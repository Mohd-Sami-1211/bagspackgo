import mongoose from 'mongoose';

const providerNotificationSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },

  type: {
    type: String,
    enum: ['trip_booking', 'trek_booking', 'payment', 'event', 'system'],
    required: true,
  },

  title:   { type: String, required: true },
  message: { type: String, required: true },

  // Optional reference to a booking / event
  refId:   { type: String, default: null },
  refType: { type: String, enum: ['TripBooking', 'TrekBooking', 'Event', null], default: null },

  read: { type: Boolean, default: false },

}, { timestamps: true });

providerNotificationSchema.index({ provider: 1, createdAt: -1 });
providerNotificationSchema.index({ provider: 1, read: 1 });

export const ProviderNotification =
  mongoose.models.ProviderNotification ||
  mongoose.model('ProviderNotification', providerNotificationSchema);
