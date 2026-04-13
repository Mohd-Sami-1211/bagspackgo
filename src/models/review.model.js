import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { type: String },
    name: { type: String, required: true },
    photo: { type: String },
    title: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, required: true },
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide' }
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
