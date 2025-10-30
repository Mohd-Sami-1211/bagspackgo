import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  categories: {
    type: [String], // e.g., ['individual', 'couple']
    default: ['individual', 'couple'],
  },
  guides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "GuideDetails", // reference to guide details
  }],
  
}, { timestamps: true });

export const Destination = mongoose.model("Destination", destinationSchema);
