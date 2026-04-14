import mongoose from 'mongoose';

const wishSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

wishSchema.index({ event: 1 });
wishSchema.index({ user: 1 });

export const Wish = mongoose.models.Wish || mongoose.model('Wish', wishSchema);
