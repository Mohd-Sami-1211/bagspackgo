import mongoose from "mongoose";

const savedSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['trip', 'trek', 'event', 'offbeat'], required: true },
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

delete mongoose.models.Saved;
export const Saved = mongoose.model("Saved", savedSchema);
