import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    bookingDate: { type: Date, default: Date.now },
    amountPaid: { type: Number, required: true, min: 0 },
    slots: { type: Number, required: true, min: 1 },
    slotsReserved: { type: Boolean, default: false },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    orderCreationStartedAt: { type: Date, default: null },
    checkoutKey: { type: String },
    expiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    confirmationEmailSentAt: { type: Date, default: null },
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
        slotIndex: { type: Number, default: 0 },
        value: mongoose.Schema.Types.Mixed, // string, number, array, or base64 for photo
        extraCharge: { type: Number, default: 0 },
    }],
    // Total extra charges from custom form option selections
    extraChargesTotal: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'cancellation_requested', 'refund_initiated'], default: 'pending' },
    cancellationDetails: {
        reason: { type: String, default: '' },
        refundAmount: { type: Number, default: 0 },
        refundStatus: { type: String, enum: ['pending', 'processing', 'initiated', 'failed', 'not_required'], default: 'not_required' },
        refundId: { type: String, default: '' },
        refundInitiatedAt: { type: Date, default: null },
        refundEmailSentAt: { type: Date, default: null },
    },
    // Provider Payment details
    providerPaymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    providerTransactionId: { type: String, default: '' },
    providerPaymentDate: { type: Date },
    providerDepositedAccount: { type: String, default: '' }
}, { timestamps: true });

bookingSchema.index(
    { user: 1, checkoutKey: 1 },
    { unique: true, partialFilterExpression: { checkoutKey: { $type: 'string' } } }
);
bookingSchema.index({ event: 1, status: 1 });
bookingSchema.index({ orderId: 1 });
bookingSchema.index({ status: 1, expiresAt: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
