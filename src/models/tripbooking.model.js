import mongoose from 'mongoose';

const tripBookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: false },

    bookingRef: {
        type: String,
        unique: true,
        default: function () {
            const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            return `BPG-${datePart}-${randPart}`;
        }
    },  // e.g. BPG-2603-XKQZ

    // A browser-generated key makes retries of the booking POST idempotent.
    checkoutKey: { type: String },

    // Trip config
    category: { type: String, enum: ['individual', 'couple', 'group'], default: 'individual' },
    numPeople: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },

    // Pricing
    baseAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 50 },
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Booking status
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'cancellation_requested', 'refund_initiated'], default: 'pending' },

    // Cancellation details
    cancellationDetails: {
        ticketId: { type: String, default: '' },
        reason: { type: String, default: '' },
        requestedAt: { type: Date },
        refundInitiatedAt: { type: Date },
        completedAt: { type: Date },
        refundAmount: { type: Number, default: 0 },
        refundStatus: { type: String, enum: ['pending', 'processing', 'initiated', 'failed', 'not_required'], default: 'not_required' },
        refundId: { type: String, default: '' },
        refundEmailStartedAt: { type: Date, default: null },
        refundEmailSentAt: { type: Date, default: null },
    },

    // Provider Payment details
    providerPaymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    providerTransactionId: { type: String, default: '' },
    providerPaymentDate: { type: Date },
    providerDepositedAccount: { type: String, default: '' },

    // Payment details
    paymentId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    orderCreationStartedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    confirmationEmailStartedAt: { type: Date, default: null },
    confirmationEmailSentAt: { type: Date, default: null },
    confirmationUserEmailSentAt: { type: Date, default: null },
    confirmationProviderEmailSentAt: { type: Date, default: null },

    // Payment mode tracking
    paymentMode: { type: String, enum: ['full', 'partial'], default: 'full' },
    amountPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },

    // Traveller details
    arrivalDeparture: { type: mongoose.Schema.Types.Mixed, default: {} },
    personalDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Snapshot of package details at booking time
    packageSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

tripBookingSchema.index({ user: 1, checkoutKey: 1 }, { unique: true, sparse: true });
tripBookingSchema.index({ orderId: 1 });
tripBookingSchema.index({ paymentId: 1 });
tripBookingSchema.index({ status: 1, createdAt: 1 });

delete mongoose.models.TripBooking;
export const TripBooking = mongoose.models.TripBooking || mongoose.model('TripBooking', tripBookingSchema);
