import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    userId: { type: String },
    name: { type: String, required: true },
    handle: { type: String },
    photo: { type: String },
    content: { type: String, required: true },
    location: { type: String },
    media: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        photo: String,
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export default Story;
