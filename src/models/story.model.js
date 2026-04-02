import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    name: { type: String, required: true },
    handle: { type: String },
    photo: { type: String },
    content: { type: String, required: true },
    location: { type: String },
    media: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
}, { timestamps: true });

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export default Story;
