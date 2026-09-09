import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { User } from '@/models/user.model';
import { sendEventBookingConfirmation } from '@/lib/otp-service';

const MAX_SLOTS_PER_BOOKING = 20;
const MAX_TEXT_LENGTH = 2000;
const MAX_UPLOAD_LENGTH = 3_000_000;
export const EVENT_CHECKOUT_HOLD_MS = 5 * 60 * 1000;

export class EventBookingValidationError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'EventBookingValidationError';
        this.status = status;
    }
}

const cleanText = (value, maxLength = MAX_TEXT_LENGTH) =>
    typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const hasValue = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== '';
};

const valuesOverlap = (actual, expected) => {
    const actualValues = Array.isArray(actual) ? actual : [actual];
    const expectedValues = Array.isArray(expected) ? expected : [expected];
    return expectedValues.some((value) => actualValues.includes(value));
};

const safeCharge = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100) / 100) : 0;
};

export function sanitizeCustomFormFields(input) {
    if (!Array.isArray(input)) return [];

    const fields = [];
    const usedIds = new Set();

    for (const rawField of input.slice(0, 50)) {
        if (!rawField || typeof rawField !== 'object') continue;

        let id = cleanText(rawField.id, 100) || crypto.randomBytes(8).toString('hex');
        if (usedIds.has(id)) id = `${id}-${crypto.randomBytes(3).toString('hex')}`;
        usedIds.add(id);

        const allowedTypes = ['text', 'number', 'dropdown', 'multiple_choice', 'checkbox', 'photo_upload'];
        const type = allowedTypes.includes(rawField.type) ? rawField.type : 'text';
        const options = ['dropdown', 'multiple_choice', 'checkbox'].includes(type)
            ? (Array.isArray(rawField.options) ? rawField.options : [])
                .slice(0, 50)
                .map((option) => ({
                    value: cleanText(option?.value, 300),
                    extraCharge: safeCharge(option?.extraCharge),
                }))
                .filter((option) => option.value)
            : [];
        const requestedDependency = cleanText(rawField.dependsOn, 100);
        const dependsOn = requestedDependency && requestedDependency !== id && usedIds.has(requestedDependency)
            ? requestedDependency
            : null;

        fields.push({
            id,
            title: cleanText(rawField.title, 300),
            placeholder: cleanText(rawField.placeholder, 500),
            type,
            options,
            required: rawField.required === true,
            dependsOn,
            showIfValue: Array.isArray(rawField.showIfValue)
                ? rawField.showIfValue.map((value) => cleanText(value, 300)).filter(Boolean)
                : cleanText(rawField.showIfValue, 300) || null,
        });
    }

    return fields;
}

function normalizeResponseValue(field, rawValue) {
    if (field.type === 'checkbox') {
        if (!Array.isArray(rawValue)) return [];
        return [...new Set(rawValue.map((value) => cleanText(value, 300)).filter(Boolean))];
    }

    if (field.type === 'number') {
        if (!hasValue(rawValue)) return '';
        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed)) {
            throw new EventBookingValidationError(`${field.title || 'A numeric field'} must be a valid number.`);
        }
        return parsed;
    }

    if (field.type === 'photo_upload') {
        if (!hasValue(rawValue)) return '';
        if (typeof rawValue !== 'string' || rawValue.length > MAX_UPLOAD_LENGTH) {
            throw new EventBookingValidationError(`${field.title || 'Uploaded photo'} is too large.`);
        }
        if (!rawValue.startsWith('data:image/') && !/^https:\/\//i.test(rawValue)) {
            throw new EventBookingValidationError(`${field.title || 'Uploaded photo'} has an invalid format.`);
        }
        return rawValue;
    }

    return cleanText(rawValue);
}

export function calculateEventBookingQuote(event, slots, rawResponses = []) {
    const slotCount = Number(slots);
    if (!Number.isInteger(slotCount) || slotCount < 1 || slotCount > MAX_SLOTS_PER_BOOKING) {
        throw new EventBookingValidationError(`Choose between 1 and ${MAX_SLOTS_PER_BOOKING} slots.`);
    }

    const fields = sanitizeCustomFormFields(event.customFormFields);
    const fieldMap = new Map(fields.map((field) => [field.id, field]));
    const incoming = Array.isArray(rawResponses) ? rawResponses : [];
    const responseMap = new Map();

    for (const response of incoming) {
        const slotIndex = Number(response?.slotIndex);
        const fieldId = cleanText(response?.fieldId, 100);
        if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= slotCount || !fieldMap.has(fieldId)) {
            throw new EventBookingValidationError('The custom booking form contains an invalid response.');
        }
        const key = `${slotIndex}:${fieldId}`;
        if (responseMap.has(key)) {
            throw new EventBookingValidationError('The custom booking form contains duplicate responses.');
        }
        responseMap.set(key, normalizeResponseValue(fieldMap.get(fieldId), response.value));
    }

    let extraChargesTotal = 0;
    const customFormResponses = [];

    if (event.applicationFormType === 'customized') {
        for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
            for (const field of fields) {
                const dependencyValue = field.dependsOn
                    ? responseMap.get(`${slotIndex}:${field.dependsOn}`)
                    : undefined;
                const isVisible = !field.dependsOn || valuesOverlap(dependencyValue, field.showIfValue);
                if (!isVisible) continue;

                const value = responseMap.get(`${slotIndex}:${field.id}`);
                if (field.required && !hasValue(value)) {
                    throw new EventBookingValidationError(`${field.title || 'A required field'} is required.`);
                }
                if (!hasValue(value)) continue;

                let extraCharge = 0;
                if (['dropdown', 'multiple_choice'].includes(field.type)) {
                    const option = field.options.find((item) => item.value === value);
                    if (!option) {
                        throw new EventBookingValidationError(`${field.title || 'A selection'} contains an invalid option.`);
                    }
                    extraCharge = option.extraCharge;
                } else if (field.type === 'checkbox') {
                    for (const selectedValue of value) {
                        const option = field.options.find((item) => item.value === selectedValue);
                        if (!option) {
                            throw new EventBookingValidationError(`${field.title || 'A selection'} contains an invalid option.`);
                        }
                        extraCharge += option.extraCharge;
                    }
                }

                extraChargesTotal += extraCharge;
                customFormResponses.push({
                    fieldId: field.id,
                    fieldTitle: field.title,
                    slotIndex,
                    value,
                    extraCharge,
                });
            }
        }
    }

    const subtotal = safeCharge(event.pricePerSlot) * slotCount;
    const baseForFees = subtotal + extraChargesTotal;
    const platformFee = Math.round(baseForFees * 0.03);
    const gatewayFee = Math.round(baseForFees * 0.02);
    const gstOnGateway = Math.round(gatewayFee * 0.18);
    const totalFees = platformFee + gatewayFee + gstOnGateway;

    return {
        slots: slotCount,
        subtotal,
        extraChargesTotal,
        platformFee,
        gatewayFee,
        gstOnGateway,
        totalFees,
        totalPayable: baseForFees + totalFees,
        customFormResponses,
    };
}

export function generateEventPassCode() {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
}

async function releaseHeldSlots(session, booking) {
    if (booking.slotsReserved !== true) return;

    await Event.updateOne(
        {
            _id: booking.event,
            $expr: {
                $gte: [{ $ifNull: ['$reservedSlots', 0] }, booking.slots],
            },
        },
        { $inc: { reservedSlots: -booking.slots } },
        { session }
    );
    booking.slotsReserved = false;
}

export async function releaseEventBookingHold(bookingId, { reason = 'Checkout cancelled', deleteBooking = false } = {}) {
    const session = await mongoose.startSession();
    let result = { kind: 'not_found' };

    try {
        await session.withTransaction(async () => {
            const booking = await Booking.findOne({ _id: bookingId, status: 'pending' }).session(session);
            if (!booking) {
                result = { kind: 'not_found' };
                return;
            }

            await releaseHeldSlots(session, booking);

            if (deleteBooking) {
                await booking.deleteOne({ session });
            } else {
                booking.status = 'cancelled';
                booking.cancellationDetails = {
                    reason,
                    // Keep the full server-calculated amount available if a
                    // gateway capture arrives after this checkout expires.
                    // No refund is attempted unless a payment is actually
                    // reported by Razorpay.
                    refundAmount: booking.amountPaid,
                    refundStatus: 'not_required',
                };
                await booking.save({ session });
            }
            result = { kind: 'released', booking };
        });
    } finally {
        await session.endSession();
    }

    return result;
}

export async function confirmEventBooking({ bookingId, userId, orderId, paymentId }) {
    const session = await mongoose.startSession();
    let outcome = { kind: 'not_found' };

    try {
        await session.withTransaction(async () => {
            const query = { _id: bookingId };
            if (userId) query.user = userId;

            const booking = await Booking.findOne(query).session(session);
            if (!booking) {
                outcome = { kind: 'not_found' };
                return;
            }
            if (booking.status === 'confirmed') {
                outcome = { kind: 'confirmed', booking, newlyConfirmed: false };
                return;
            }
            if (booking.status !== 'pending') {
                outcome = { kind: 'unavailable', booking };
                return;
            }

            // A payment callback can arrive after the browser/gateway hold
            // has expired. Never convert that late payment into a booking;
            // release the reservation and route the captured amount through
            // the normal full-refund workflow instead.
            if (booking.expiresAt && booking.expiresAt <= new Date()) {
                await releaseHeldSlots(session, booking);
                booking.status = 'cancelled';
                booking.paymentId = paymentId || booking.paymentId;
                booking.orderId = orderId || booking.orderId;
                booking.cancellationDetails = {
                    reason: 'Checkout expired before payment confirmation',
                    refundAmount: booking.amountPaid,
                    refundStatus: booking.amountPaid > 0 ? 'pending' : 'not_required',
                };
                await booking.save({ session });
                outcome = {
                    kind: 'expired',
                    booking,
                    shouldRefund: booking.amountPaid > 0,
                };
                return;
            }

            const eventFilter = {
                _id: booking.event,
                status: 'published',
                date: { $gte: new Date() },
                $expr: {
                    $lte: [
                        { $add: [{ $ifNull: ['$bookedSlots', 0] }, booking.slots] },
                        '$totalSlots',
                    ],
                },
            };
            const eventUpdate = { $inc: { bookedSlots: booking.slots } };
            if (booking.slotsReserved === true) {
                eventFilter.$expr = {
                    $and: [
                        eventFilter.$expr,
                        { $gte: [{ $ifNull: ['$reservedSlots', 0] }, booking.slots] },
                    ],
                };
                eventUpdate.$inc.reservedSlots = -booking.slots;
            }

            const event = await Event.findOneAndUpdate(eventFilter, eventUpdate, { new: true, session });

            if (!event) {
                await releaseHeldSlots(session, booking);
                booking.status = 'cancelled';
                booking.paymentId = paymentId || booking.paymentId;
                booking.orderId = orderId || booking.orderId;
                booking.cancellationDetails = {
                    reason: 'Event unavailable or sold out during payment',
                    refundAmount: booking.amountPaid,
                    refundStatus: booking.amountPaid > 0 ? 'pending' : 'not_required',
                };
                await booking.save({ session });
                outcome = {
                    kind: 'sold_out',
                    booking,
                    shouldRefund: booking.amountPaid > 0,
                };
                return;
            }

            booking.status = 'confirmed';
            booking.paymentId = paymentId || 'free_event';
            booking.orderId = orderId || 'free_event';
            booking.confirmedAt = new Date();
            booking.slotsReserved = false;
            await booking.save({ session });
            outcome = { kind: 'confirmed', booking, newlyConfirmed: true };
        });
    } finally {
        await session.endSession();
    }

    return outcome;
}

export async function sendEventConfirmationOnce(bookingId) {
    const claimed = await Booking.findOneAndUpdate(
        { _id: bookingId, status: 'confirmed', confirmationEmailSentAt: null },
        { $set: { confirmationEmailSentAt: new Date() } },
        { new: true }
    );
    if (!claimed) return;

    try {
        const [userDoc, eventDoc] = await Promise.all([
            User.findById(claimed.user).select('username email phone').lean(),
            Event.findById(claimed.event).populate('guide', 'username email').lean(),
        ]);
        await sendEventBookingConfirmation({
            userEmail: userDoc?.email,
            userName: userDoc?.username || 'Traveller',
            providerEmail: eventDoc?.guide?.email,
            providerName: eventDoc?.guide?.username || 'Guide',
            bookingId: claimed._id.toString(),
            eventName: eventDoc?.title || 'Event Booking',
            destination: eventDoc?.destination || eventDoc?.location || '',
            eventDate: eventDoc?.date,
            numPeople: claimed.slots,
            totalAmount: claimed.amountPaid,
        });
    } catch (error) {
        await Booking.updateOne(
            { _id: bookingId, confirmationEmailSentAt: { $ne: null } },
            { $set: { confirmationEmailSentAt: null } }
        ).catch(() => {});
        console.error('Booking email error:', error);
    }
}

export async function refundEventBookingPayment(booking, paymentId) {
    const claimed = await Booking.findOneAndUpdate(
        {
            _id: booking._id,
            status: 'cancelled',
            'cancellationDetails.refundStatus': { $in: ['pending', 'failed', 'not_required'] },
            'cancellationDetails.refundAmount': { $gt: 0 },
        },
        { $set: { 'cancellationDetails.refundStatus': 'processing' } },
        { new: true }
    );

    // A browser callback and a webhook may request the same refund. Only the
    // request that atomically claims it is allowed to call Razorpay.
    if (!claimed) {
        const current = await Booking.findById(booking._id)
            .select('cancellationDetails.refundStatus')
            .lean();
        return ['processing', 'initiated'].includes(current?.cancellationDetails?.refundStatus);
    }

    try {
        // refundAmount is written from the server-calculated amountPaid when
        // the booking is cancelled. Keep this explicit so gateway/platform
        // fees are returned too when the platform caused the failure.
        const refundAmount = Number(claimed.cancellationDetails?.refundAmount ?? claimed.amountPaid ?? 0);
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(refundAmount * 100),
            notes: { reason: 'Event unavailable or sold out during checkout' },
        });
        await Booking.updateOne(
            { _id: booking._id, status: 'cancelled' },
            {
                $set: {
                    status: 'refund_initiated',
                    'cancellationDetails.refundStatus': 'initiated',
                    'cancellationDetails.refundId': refund?.id || '',
                    'cancellationDetails.refundInitiatedAt': new Date(),
                },
            }
        );
        return true;
    } catch (error) {
        await Booking.updateOne(
            { _id: booking._id, 'cancellationDetails.refundStatus': 'processing' },
            { $set: { 'cancellationDetails.refundStatus': 'failed' } }
        ).catch(() => {});
        console.error('Auto-refund failed:', error);
        return false;
    }
}
