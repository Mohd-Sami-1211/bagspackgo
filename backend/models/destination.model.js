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
    type: [String], // only two categories: 'individual', 'couple'
    default: ['individual', 'couple'],
  },
}, { timestamps: true });

export const Destination = mongoose.model("Destination", destinationSchema);
