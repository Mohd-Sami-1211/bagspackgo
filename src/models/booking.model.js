import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    bookingDate: { type: Date, default: Date.now },
    amountPaid: { type: Number, required: true },
    slots: { type: Number, required: true },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    contactDetails: {
        email: String,
        phone: String,
    },
    participants: [{
        name: String,
        email: String,
        phone: String,
        age: Number,
        gender: String,
        bloodGroup: String,
        country: String,
        address: String,
        idType: String,
        idNumber: String,
        passCode: String,
        checkedIn: { type: Boolean, default: false }
    }],
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    // Provider Payment details
    providerPaymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    providerTransactionId: { type: String, default: '' },
    providerPaymentDate: { type: Date },
    providerDepositedAccount: { type: String, default: '' }
}, { timestamps: true });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
