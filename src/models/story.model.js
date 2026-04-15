import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    photo: String,
    text: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isVerifiedProvider: { type: Boolean, default: false },
    providerId: { type: String, default: '' },
    providerLogo: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const storySchema = new mongoose.Schema({
    userId: { type: String },
    name: { type: String, required: true },
    handle: { type: String },
    photo: { type: String },
    content: { type: String, required: true },
    location: { type: String },
    media: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    isVerifiedProvider: { type: Boolean, default: false },
    providerId: { type: String, default: '' },
    providerLogo: { type: String, default: '' }
}, { timestamps: true });

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export default Story;

