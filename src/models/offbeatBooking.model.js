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
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

offbeatBookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const OffBeatBooking = mongoose.models.OffBeatBooking || mongoose.model('OffBeatBooking', offbeatBookingSchema);
