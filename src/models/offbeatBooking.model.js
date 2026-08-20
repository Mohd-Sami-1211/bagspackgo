import mongoose from 'mongoose';

const offbeatBookingSchema = new mongoose.Schema({
  offbeat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OffBeat',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  numberOfPersons: {
    type: Number,
    required: true,
    min: 1,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    // Optional for group trips if they use dateOptions
  },
  dateOptions: {
    type: [String],
    default: [],
  },
  inquiryType: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
  specialRequirements: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

export const OffBeatBooking = mongoose.models.OffBeatBooking || mongoose.model('OffBeatBooking', offbeatBookingSchema);
