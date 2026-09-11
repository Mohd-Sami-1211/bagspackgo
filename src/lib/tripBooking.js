import Razorpay from 'razorpay';
import { TripBooking } from '@/models/tripbooking.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { Package } from '@/models/package.model';
import { sendTripBookingConfirmation, sendTripRefundInitiated } from '@/lib/otp-service';

const MAX_TRAVELLERS = 100;
const EMAIL_CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

export class TripBookingValidationError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'TripBookingValidationError';
        this.status = status;
    }
}

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

export function calculateTripBookingQuote(pkg, rawPeople, rawPaymentMode) {
    const numPeople = Number(rawPeople);
    if (!Number.isInteger(numPeople) || numPeople < 1 || numPeople > MAX_TRAVELLERS) {
        throw new TripBookingValidationError(`Choose between 1 and ${MAX_TRAVELLERS} travellers.`);
    }

    const paymentMode = rawPaymentMode === 'full' ? 'full' : 'partial';
    const tiers = Array.isArray(pkg?.pricingTiers)
        ? pkg.pricingTiers.filter((tier) => Number(tier?.price) > 0)
        : [];
    if (!tiers.length) {
        throw new TripBookingValidationError('This package does not have a valid price.', 409);
    }

    let tier = tiers.find((item) => numPeople >= Number(item.minPeople) && numPeople <= Number(item.maxPeople));
    if (!tier) {
        const sorted = [...tiers].sort((a, b) => Number(a.maxPeople) - Number(b.maxPeople));
        tier = numPeople > Number(sorted[sorted.length - 1].maxPeople) ? sorted[sorted.length - 1] : sorted[0];
    }

    const perPersonPrice = Number(tier.price);
    const discountPercent = Math.min(100, Math.max(0, Number(tier.discount) || 0));
    // Keep the final rounding identical to the review UI; round individual
    // values only when storing the breakdown.
    const rawBaseAmount = perPersonPrice * numPeople;
    const rawDiscount = rawBaseAmount * (discountPercent / 100);
    const rawAmountAfterDiscount = rawBaseAmount - rawDiscount;
    const rawPlatformFee = rawAmountAfterDiscount * 0.01;
    const rawGatewayFee = (rawAmountAfterDiscount + rawPlatformFee) * 0.02;
    const rawTaxes = rawGatewayFee * 0.18;
    const rawTotal = rawAmountAfterDiscount + rawPlatformFee + rawGatewayFee + rawTaxes;
    const baseAmount = roundMoney(rawBaseAmount);
    const discount = roundMoney(rawDiscount);
    const platformFee = roundMoney(rawPlatformFee);
    const gatewayFee = roundMoney(rawGatewayFee);
    const taxes = roundMoney(rawTaxes);
    const totalAmount = Math.round(rawTotal);
    const amountPaid = paymentMode === 'partial' ? Math.round(rawTotal * 0.3) : totalAmount;

    if (!Number.isSafeInteger(amountPaid) || amountPaid < 1) {
        throw new TripBookingValidationError('This package has an invalid payable amount.', 409);
    }

    return {
        numPeople,
        paymentMode,
        baseAmount,
        discount,
        platformFee,
        gatewayFee,
        taxes,
        totalAmount,
        amountPaid,
        remainingAmount: paymentMode === 'partial' ? totalAmount - amountPaid : 0,
    };
}

export function validateCapturedTripPayment(booking, payment) {
    if (!payment || payment.status !== 'captured' || payment.captured === false) {
        throw new TripBookingValidationError('Payment has not been captured yet.', 202);
    }
    if (payment.order_id !== booking.orderId) {
        throw new TripBookingValidationError('Payment order does not match this booking.');
    }
    if (String(payment.currency || '').toUpperCase() !== 'INR') {
        throw new TripBookingValidationError('Payment currency does not match this booking.');
    }
    if (Number(payment.amount) !== Math.round(Number(booking.amountPaid) * 100)) {
        throw new TripBookingValidationError('Payment amount does not match this booking.');
    }
}

async function recordTripStatsOnce(booking) {
    if (!booking?.provider) return;
    await GuideDetails.findOneAndUpdate(
        { guide: booking.provider, countedTripBookings: { $ne: booking._id } },
        { $inc: { totalTrips: 1 }, $addToSet: { countedTripBookings: booking._id } }
    );
}

export async function sendTripConfirmationOnce(bookingId) {
    const staleClaim = new Date(Date.now() - EMAIL_CLAIM_TIMEOUT_MS);
    const booking = await TripBooking.findOneAndUpdate(
        {
            _id: bookingId,
            status: 'confirmed',
            confirmationEmailSentAt: null,
            $or: [
                { confirmationEmailStartedAt: null },
                { confirmationEmailStartedAt: { $lt: staleClaim } },
            ],
        },
        { $set: { confirmationEmailStartedAt: new Date() } },
        { new: true }
    ).lean();

    if (!booking) return false;

    try {
        const [userDoc, providerDoc, packageDoc] = await Promise.all([
            User.findById(booking.user).select('username email phone').lean(),
            Guide.findById(booking.provider).select('username email phone').lean(),
            Package.findById(booking.package).select('name destination days').lean(),
        ]);
        const result = await sendTripBookingConfirmation({
            userEmail: booking.confirmationUserEmailSentAt ? null : userDoc?.email,
            userName: userDoc?.username || 'Traveller',
            providerEmail: booking.confirmationProviderEmailSentAt ? null : providerDoc?.email,
            providerName: providerDoc?.username || 'Guide',
            bookingRef: booking.bookingRef,
            packageName: packageDoc?.name || booking.packageSnapshot?.name || 'Trip Package',
            destination: packageDoc?.destination || booking.packageSnapshot?.destination || '',
            startDate: booking.startDate,
            endDate: booking.endDate,
            numPeople: booking.numPeople,
            totalAmount: booking.totalAmount,
            amountPaid: booking.amountPaid,
            remainingAmount: booking.remainingAmount,
            paymentMode: booking.paymentMode,
            isTrek: false,
        });
        const completedAt = new Date();
        const userDone = Boolean(booking.confirmationUserEmailSentAt) || result.userSent;
        const providerDone = Boolean(booking.confirmationProviderEmailSentAt) || result.providerSent;
        const updates = { confirmationEmailStartedAt: null };
        if (result.userSent && !booking.confirmationUserEmailSentAt) updates.confirmationUserEmailSentAt = completedAt;
        if (result.providerSent && !booking.confirmationProviderEmailSentAt) updates.confirmationProviderEmailSentAt = completedAt;
        if (userDone && providerDone) updates.confirmationEmailSentAt = completedAt;
        await TripBooking.updateOne(
            { _id: booking._id, confirmationEmailSentAt: null },
            { $set: updates }
        );
        return userDone && providerDone;
    } catch (error) {
        await TripBooking.updateOne(
            { _id: booking._id, confirmationEmailSentAt: null },
            { $set: { confirmationEmailStartedAt: null } }
        ).catch(() => {});
        console.error('Trip confirmation email failed:', error);
        return false;
    }
}

export async function runTripConfirmationEffects(booking) {
    // Legacy confirmed bookings predate the idempotency markers and must not
    // receive a surprise duplicate email during a later webhook replay.
    if (!booking?.confirmedAt) return;
    await recordTripStatsOnce(booking).catch((error) => console.error('Trip stats update failed:', error));
    await sendTripConfirmationOnce(booking._id);
}

export async function confirmTripBooking({ bookingId, userId, orderId, paymentId }) {
    const query = { _id: bookingId };
    if (userId) query.user = userId;
    const current = await TripBooking.findOne(query);
    if (!current) return { kind: 'not_found' };

    if (current.status === 'confirmed') {
        const sameOrder = current.orderId === orderId;
        const samePayment = !current.paymentId || current.paymentId === paymentId;
        return sameOrder && samePayment
            ? { kind: 'confirmed', booking: current, newlyConfirmed: false }
            : { kind: 'conflict', booking: current };
    }
    if (current.status !== 'pending') return { kind: 'unavailable', booking: current };
    if (!orderId || current.orderId !== orderId || !paymentId) return { kind: 'conflict', booking: current };

    const paymentAlreadyUsed = await TripBooking.exists({
        _id: { $ne: current._id },
        paymentId,
        status: 'confirmed',
    });
    if (paymentAlreadyUsed) return { kind: 'conflict', booking: current };

    const confirmed = await TripBooking.findOneAndUpdate(
        { ...query, status: 'pending', orderId },
        { $set: { status: 'confirmed', paymentId, confirmedAt: new Date() } },
        { new: true }
    );
    if (!confirmed) {
        const latest = await TripBooking.findOne(query);
        return latest?.status === 'confirmed'
            ? { kind: 'confirmed', booking: latest, newlyConfirmed: false }
            : { kind: 'unavailable', booking: latest };
    }

    return { kind: 'confirmed', booking: confirmed, newlyConfirmed: true };
}

export async function sendTripRefundInitiationOnce(bookingId) {
    const staleClaim = new Date(Date.now() - EMAIL_CLAIM_TIMEOUT_MS);
    const booking = await TripBooking.findOneAndUpdate(
        {
            _id: bookingId,
            status: 'refund_initiated',
            'cancellationDetails.refundEmailSentAt': null,
            $or: [
                { 'cancellationDetails.refundEmailStartedAt': null },
                { 'cancellationDetails.refundEmailStartedAt': { $lt: staleClaim } },
            ],
        },
        { $set: { 'cancellationDetails.refundEmailStartedAt': new Date() } },
        { new: true }
    ).lean();
    if (!booking) return false;

    try {
        const [userDoc, packageDoc] = await Promise.all([
            User.findById(booking.user).select('username email').lean(),
            Package.findById(booking.package).select('name destination').lean(),
        ]);
        await sendTripRefundInitiated({
            userEmail: userDoc?.email,
            userName: userDoc?.username || 'Traveller',
            bookingRef: booking.bookingRef,
            packageName: packageDoc?.name || booking.packageSnapshot?.name || 'Trip Package',
            destination: packageDoc?.destination || booking.packageSnapshot?.destination || '',
            amount: booking.cancellationDetails?.refundAmount || 0,
            orderId: booking.orderId,
            paymentId: booking.paymentId,
            refundId: booking.cancellationDetails?.refundId,
            initiatedAt: booking.cancellationDetails?.refundInitiatedAt,
        });
        await TripBooking.updateOne(
            { _id: booking._id, 'cancellationDetails.refundEmailSentAt': null },
            {
                $set: {
                    'cancellationDetails.refundEmailStartedAt': null,
                    'cancellationDetails.refundEmailSentAt': new Date(),
                },
            }
        );
        return true;
    } catch (error) {
        await TripBooking.updateOne(
            { _id: booking._id },
            { $set: { 'cancellationDetails.refundEmailStartedAt': null } }
        ).catch(() => {});
        console.error('Trip refund email failed:', error);
        return false;
    }
}

export async function refundTripBookingPayment(bookingOrId, paymentIdOverride) {
    const bookingId = bookingOrId?._id || bookingOrId;
    let booking = await TripBooking.findById(bookingId);
    if (!booking) return { kind: 'not_found' };
    if (booking.cancellationDetails?.refundStatus === 'initiated') {
        await sendTripRefundInitiationOnce(booking._id);
        return { kind: 'refunded', booking, alreadyInitiated: true };
    }

    const paymentId = paymentIdOverride || booking.paymentId;
    const requestedAmount = Number(booking.cancellationDetails?.refundAmount || booking.amountPaid || 0);
    const refundAmount = Math.min(Number(booking.amountPaid || 0), Math.max(0, requestedAmount));
    if (!paymentId || refundAmount <= 0) return { kind: 'not_required', booking };
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return { kind: 'failed', booking, message: 'Payment gateway not configured' };
    }

    const claimed = await TripBooking.findOneAndUpdate(
        {
            _id: booking._id,
            $or: [
                { 'cancellationDetails.refundStatus': { $in: ['pending', 'failed', 'not_required'] } },
                { 'cancellationDetails.refundStatus': { $exists: false } },
            ],
        },
        {
            $set: {
                paymentId,
                'cancellationDetails.refundAmount': refundAmount,
                'cancellationDetails.refundStatus': 'processing',
            },
        },
        { new: true }
    );
    if (!claimed) {
        booking = await TripBooking.findById(booking._id);
        return { kind: booking?.cancellationDetails?.refundStatus === 'initiated' ? 'refunded' : 'processing', booking };
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        // Recover a refund if Razorpay accepted an earlier request but our DB
        // update was interrupted. This prevents a retry from refunding twice.
        const existingRefunds = await razorpay.payments.fetchMultipleRefund(paymentId, { count: 100 });
        let refund = existingRefunds?.items?.find((item) =>
            item?.notes?.bookingId === booking._id.toString()
            && Number(item.amount) === Math.round(refundAmount * 100)
        );
        if (!refund) {
            refund = await razorpay.payments.refund(paymentId, {
                amount: Math.round(refundAmount * 100),
                notes: {
                    bookingId: booking._id.toString(),
                    reason: String(booking.cancellationDetails?.reason || 'Trip booking cancellation').slice(0, 200),
                },
            });
        }
        booking = await TripBooking.findByIdAndUpdate(
            booking._id,
            {
                $set: {
                    status: 'refund_initiated',
                    paymentId,
                    'cancellationDetails.refundStatus': 'initiated',
                    'cancellationDetails.refundId': refund?.id || '',
                    'cancellationDetails.refundInitiatedAt': new Date(),
                },
            },
            { new: true }
        );
        await sendTripRefundInitiationOnce(booking._id);
        return { kind: 'refunded', booking };
    } catch (error) {
        await TripBooking.updateOne(
            { _id: booking._id, 'cancellationDetails.refundStatus': 'processing' },
            { $set: { 'cancellationDetails.refundStatus': 'failed' } }
        ).catch(() => {});
        console.error('Trip refund failed:', error);
        return { kind: 'failed', booking, message: error.message };
    }
}

export async function reconcileTripBooking(bookingOrId) {
    let booking = bookingOrId?._id ? bookingOrId : await TripBooking.findById(bookingOrId);
    if (!booking) return { kind: 'not_found' };
    if (booking.status === 'confirmed') {
        await runTripConfirmationEffects(booking);
        return { kind: 'confirmed', booking };
    }
    if (booking.status === 'refund_initiated') {
        await sendTripRefundInitiationOnce(booking._id);
        return { kind: 'refunded', booking };
    }
    if (booking.orderId === 'creating' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const recovered = await razorpay.orders.all({ receipt: `tr_${booking._id.toString()}`, count: 10 });
        const order = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
        if (order?.id) {
            booking = await TripBooking.findByIdAndUpdate(
                booking._id,
                { $set: { orderId: order.id, orderCreationStartedAt: null } },
                { new: true }
            );
        }
    }
    if (!booking.orderId || ['pending', 'creating'].includes(booking.orderId)) {
        return { kind: 'pending', booking };
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return { kind: 'unknown', booking };
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const paymentList = await razorpay.orders.fetchPayments(booking.orderId);
    const payments = Array.isArray(paymentList?.items) ? paymentList.items : [];
    const captured = payments.find((payment) => payment.status === 'captured');
    if (!captured) {
        return {
            kind: payments.some((payment) => ['created', 'authorized'].includes(payment.status)) ? 'processing' : 'pending',
            booking,
        };
    }

    validateCapturedTripPayment(booking, captured);
    if (['cancelled', 'cancellation_requested'].includes(booking.status)) {
        booking = await TripBooking.findByIdAndUpdate(
            booking._id,
            {
                $set: {
                    paymentId: captured.id,
                    status: 'cancellation_requested',
                    'cancellationDetails.refundAmount': booking.amountPaid,
                    'cancellationDetails.refundStatus': 'pending',
                },
            },
            { new: true }
        );
        return refundTripBookingPayment(booking, captured.id);
    }

    const outcome = await confirmTripBooking({
        bookingId: booking._id,
        orderId: booking.orderId,
        paymentId: captured.id,
    });
    if (outcome.kind === 'confirmed') await runTripConfirmationEffects(outcome.booking);
    return outcome;
}
