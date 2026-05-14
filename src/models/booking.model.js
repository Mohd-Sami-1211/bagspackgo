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
        idProofUrl: String,
        medicalCondition: String,
        passCode: String,
        checkedIn: { type: Boolean, default: false }
    }],
    selectedPickup: {
        location: { type: String, default: '' },
        link: { type: String, default: '' },
        time: { type: String, default: '' },
    },
    // Custom form responses — stores answers when event uses customized application form
    customFormResponses: [{
        fieldId: String,
        fieldTitle: String,
        sectionTitle: String,
        value: mongoose.Schema.Types.Mixed, // string, number, array, or base64 for photo
        extraCharge: { type: Number, default: 0 },
    }],
    // Total extra charges from custom form option selections
    extraChargesTotal: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'cancellation_requested', 'refund_initiated'], default: 'pending' },
    // Provider Payment details
    providerPaymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    providerTransactionId: { type: String, default: '' },
    providerPaymentDate: { type: Date },
    providerDepositedAccount: { type: String, default: '' }
}, { timestamps: true });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
