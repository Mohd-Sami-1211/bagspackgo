import mongoose from "mongoose";
const pickupPointSchema = new mongoose.Schema(
  {
    location: { type: String },
    link: { type: String },
    time: { type: String }
  },
  { _id: false }
);
const faqSchema = new mongoose.Schema(
  {
    question: { type: String },
    answer: { type: String }
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : "providerCompanyInfo"
  },
  title: { type: String },
  eventType: { type: String },
  location: { type: String },
  date: { type: Date },
  duration: { type: Number },
  totalSlots: { type: Number },
  pricePerSlot: { type: Number },

  destination: { type: String },
  destinationLink: { type: String },
  about: { type: String },

  highlights: { type: [String] },
  whatsIncluded: { type: [String] },
  faqs: [faqSchema],

  whatToBring: { type: [String] },
  restrictions: { type: [String] },
  pickupPoints: [pickupPointSchema],

  itinerary: { type: [String] },
  eventId : {type : String},
  posterFile: { type: String }
});
// mongoose.deleteModel && mongoose.deleteModel("EventModel");
export const EventModel = mongoose.models.EventModel || mongoose.model("EventModel", EventSchema);
