import mongoose from "mongoose";

const savedSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['trip', 'trek', 'event'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    config: {
       date: { type: String },
       peopleCount: { type: Number },
       category: { type: String },
       days: { type: Number }
    }
  },
  { timestamps: true }
);

savedSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const Saved = mongoose.models.Saved || mongoose.model("Saved", savedSchema);
