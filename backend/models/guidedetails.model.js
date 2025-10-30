import mongoose from "mongoose";

const guidedetailsSchema = new mongoose.Schema(
  {
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },

    companyname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    companyemail: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },

    companymobile: {
      type: String,
      required: true,
    },

    destinationId: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    instagram: {
      type: String,
      default: "",
    },

    facebook: {
      type: String,
      default: "",
    },

    licenseFile: {
      type: String, // store file path or URL
      required: true,
    },

    idFile: {
      type: String, // store file path or URL
      required: true,
    },

    availability: {
      trips: { type: Boolean, default: true },
      treks: { type: Boolean, default: true },
      mergers: { type: Boolean, default: true },
    },

    agree: {
      type: Boolean,
      required: true,
    },

    status: {
      type: String,
      enum: ["submitted", "pending", "approved"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

export const GuideDetails = mongoose.model("GuideDetails", guidedetailsSchema);
