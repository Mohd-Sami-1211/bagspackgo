import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    photo: { type: String },
    title: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, required: true },
    helpful: { type: Number, default: 0 }
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
