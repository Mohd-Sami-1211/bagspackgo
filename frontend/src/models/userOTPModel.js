import mongoose from "mongoose";

const userOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String, 
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// TTL index to automatically delete expired OTPs
userOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const userOTPModel = mongoose.models.userOTPModel || mongoose.model("userOTPModel", userOTPSchema);
