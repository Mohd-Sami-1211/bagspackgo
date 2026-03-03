import mongoose from 'mongoose';

const trekBookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: false },

    bookingRef: {
        type: String,
        unique: true,
        default: function () {
            const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
            const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            return `BPG-TREK-${datePart}-${randPart}`;
        }
    },

    // Trek config
    peopleRange: { type: String, default: '1-2' },
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
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },

    // Payment details
    paymentId: { type: String, default: '' },
    orderId: { type: String, default: '' },

    // Traveller details
    pickupDropoff: { type: mongoose.Schema.Types.Mixed, default: {} },
    personalDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Snapshot of package details at booking time
    packageSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

delete mongoose.models.TrekBooking;
export const TrekBooking = mongoose.models.TrekBooking || mongoose.model('TrekBooking', trekBookingSchema);
