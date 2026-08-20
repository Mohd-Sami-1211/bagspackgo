// src/models/CompanionRequest.js
import mongoose from 'mongoose';

const CompanionRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    travelDates: {
      type: String,
      trim: true,
    },
    groupSize: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'successful', 'unsuccessful', 'closed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
    // optional link to a user account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CompanionRequest ||
  mongoose.model('CompanionRequest', CompanionRequestSchema);
