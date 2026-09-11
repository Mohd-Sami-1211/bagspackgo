import Razorpay from 'razorpay';
import { TrekBooking } from '@/models/trekbooking.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { Package } from '@/models/package.model';
import { sendTripBookingConfirmation, sendTripRefundInitiated } from '@/lib/otp-service';
import { TripBookingValidationError } from '@/lib/tripBooking';

const EMAIL_CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

export function validateCapturedTrekPayment(booking, payment) {
    if (!payment || payment.status !== 'captured' || payment.captured === false) {
        throw new TripBookingValidationError('Payment has not been captured yet.', 202);
    }
    if (payment.order_id !== booking.orderId) {
        throw new TripBookingValidationError('Payment order does not match this booking.');
    }
    if (String(payment.currency || '').toUpperCase() !== 'INR') {
        throw new TripBookingValidationError('Payment currency does not match this booking.');
    }
    if (Number(payment.amount) !== Math.round(Number(booking.amountPaid || booking.totalAmount) * 100)) {
        throw new TripBookingValidationError('Payment amount does not match this booking.');
    }
}

async function recordTrekStatsOnce(booking) {
    if (!booking?.provider) return;
    await GuideDetails.findOneAndUpdate(
        { guide: booking.provider, countedTrekBookings: { $ne: booking._id } },
        { $inc: { totalTreks: 1 }, $addToSet: { countedTrekBookings: booking._id } }
    );
}

export async function sendTrekConfirmationOnce(bookingId) {
    const staleClaim = new Date(Date.now() - EMAIL_CLAIM_TIMEOUT_MS);
    const booking = await TrekBooking.findOneAndUpdate(
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
            packageName: packageDoc?.name || booking.packageSnapshot?.name || 'Trek Package',
            destination: packageDoc?.destination || booking.packageSnapshot?.destination || '',
            startDate: booking.startDate,
            endDate: booking.endDate,
            numPeople: booking.numPeople,
            totalAmount: booking.totalAmount,
            amountPaid: booking.amountPaid || booking.totalAmount,
            remainingAmount: 0,
            paymentMode: 'full',
            isTrek: true,
        });
        const completedAt = new Date();
        const userDone = Boolean(booking.confirmationUserEmailSentAt) || result.userSent;
        const providerDone = Boolean(booking.confirmationProviderEmailSentAt) || result.providerSent;
        const updates = { confirmationEmailStartedAt: null };
        if (result.userSent && !booking.confirmationUserEmailSentAt) updates.confirmationUserEmailSentAt = completedAt;
        if (result.providerSent && !booking.confirmationProviderEmailSentAt) updates.confirmationProviderEmailSentAt = completedAt;
        if (userDone && providerDone) updates.confirmationEmailSentAt = completedAt;
        await TrekBooking.updateOne(
            { _id: booking._id, confirmationEmailSentAt: null },
            { $set: updates }
        );
        return userDone && providerDone;
    } catch (error) {
        await TrekBooking.updateOne(
            { _id: booking._id, confirmationEmailSentAt: null },
            { $set: { confirmationEmailStartedAt: null } }
        ).catch(() => {});
        console.error('Trek confirmation email failed:', error);
        return false;
    }
}

export async function runTrekConfirmationEffects(booking) {
    if (!booking?.confirmedAt) return;
    await recordTrekStatsOnce(booking).catch((error) => console.error('Trek stats update failed:', error));
    await sendTrekConfirmationOnce(booking._id);
}

export async function confirmTrekBooking({ bookingId, userId, orderId, paymentId }) {
    const query = { _id: bookingId };
    if (userId) query.user = userId;
    const current = await TrekBooking.findOne(query);
    if (!current) return { kind: 'not_found' };
    if (current.status === 'confirmed') {
        return current.orderId === orderId && (!current.paymentId || current.paymentId === paymentId)
            ? { kind: 'confirmed', booking: current, newlyConfirmed: false }
            : { kind: 'conflict', booking: current };
    }
    if (current.status !== 'pending') return { kind: 'unavailable', booking: current };
    if (!orderId || current.orderId !== orderId || !paymentId) return { kind: 'conflict', booking: current };

    const paymentAlreadyUsed = await TrekBooking.exists({
        _id: { $ne: current._id },
        paymentId,
        status: 'confirmed',
    });
    if (paymentAlreadyUsed) return { kind: 'conflict', booking: current };

    const confirmed = await TrekBooking.findOneAndUpdate(
        { ...query, status: 'pending', orderId },
        { $set: { status: 'confirmed', paymentId, confirmedAt: new Date() } },
        { new: true }
    );
    if (!confirmed) {
        const latest = await TrekBooking.findOne(query);
        return latest?.status === 'confirmed'
            ? { kind: 'confirmed', booking: latest, newlyConfirmed: false }
            : { kind: 'unavailable', booking: latest };
    }
    return { kind: 'confirmed', booking: confirmed, newlyConfirmed: true };
}

export async function sendTrekRefundInitiationOnce(bookingId) {
    const staleClaim = new Date(Date.now() - EMAIL_CLAIM_TIMEOUT_MS);
    const booking = await TrekBooking.findOneAndUpdate(
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
            packageName: packageDoc?.name || booking.packageSnapshot?.name || 'Trek Package',
            destination: packageDoc?.destination || booking.packageSnapshot?.destination || '',
            amount: booking.cancellationDetails?.refundAmount || 0,
            orderId: booking.orderId,
            paymentId: booking.paymentId,
            refundId: booking.cancellationDetails?.refundId,
            initiatedAt: booking.cancellationDetails?.refundInitiatedAt,
        });
        await TrekBooking.updateOne(
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
        await TrekBooking.updateOne(
            { _id: booking._id },
            { $set: { 'cancellationDetails.refundEmailStartedAt': null } }
        ).catch(() => {});
        console.error('Trek refund email failed:', error);
        return false;
    }
}

export async function refundTrekBookingPayment(bookingOrId, paymentIdOverride) {
    const bookingId = bookingOrId?._id || bookingOrId;
    let booking = await TrekBooking.findById(bookingId);
    if (!booking) return { kind: 'not_found' };
    if (booking.cancellationDetails?.refundStatus === 'initiated') {
        await sendTrekRefundInitiationOnce(booking._id);
        return { kind: 'refunded', booking, alreadyInitiated: true };
    }

    const paymentId = paymentIdOverride || booking.paymentId;
    const paidAmount = Number(booking.amountPaid || booking.totalAmount || 0);
    const requestedAmount = Number(booking.cancellationDetails?.refundAmount || paidAmount);
    const refundAmount = Math.min(paidAmount, Math.max(0, requestedAmount));
    if (!paymentId || refundAmount <= 0) return { kind: 'not_required', booking };
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return { kind: 'failed', booking, message: 'Payment gateway not configured' };
    }

    const claimed = await TrekBooking.findOneAndUpdate(
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
        booking = await TrekBooking.findById(booking._id);
        return { kind: booking?.cancellationDetails?.refundStatus === 'initiated' ? 'refunded' : 'processing', booking };
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
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
                    reason: String(booking.cancellationDetails?.reason || 'Trek booking cancellation').slice(0, 200),
                },
            });
        }
        booking = await TrekBooking.findByIdAndUpdate(
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
        await sendTrekRefundInitiationOnce(booking._id);
        return { kind: 'refunded', booking };
    } catch (error) {
        await TrekBooking.updateOne(
            { _id: booking._id, 'cancellationDetails.refundStatus': 'processing' },
            { $set: { 'cancellationDetails.refundStatus': 'failed' } }
        ).catch(() => {});
        console.error('Trek refund failed:', error);
        return { kind: 'failed', booking, message: error.message };
    }
}

export async function reconcileTrekBooking(bookingOrId) {
    let booking = bookingOrId?._id ? bookingOrId : await TrekBooking.findById(bookingOrId);
    if (!booking) return { kind: 'not_found' };
    if (booking.status === 'confirmed') {
        await runTrekConfirmationEffects(booking);
        return { kind: 'confirmed', booking };
    }
    if (booking.status === 'refund_initiated') {
        await sendTrekRefundInitiationOnce(booking._id);
        return { kind: 'refunded', booking };
    }

    const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
        ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
        : null;
    if (booking.orderId === 'creating' && razorpay) {
        const recovered = await razorpay.orders.all({ receipt: `tk_${booking._id.toString()}`, count: 10 });
        const order = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
        if (order?.id) {
            booking = await TrekBooking.findByIdAndUpdate(
                booking._id,
                { $set: { orderId: order.id, orderCreationStartedAt: null } },
                { new: true }
            );
        }
    }
    if (!booking.orderId || ['pending', 'creating'].includes(booking.orderId)) return { kind: 'pending', booking };
    if (!razorpay) return { kind: 'unknown', booking };

    const paymentList = await razorpay.orders.fetchPayments(booking.orderId);
    const payments = Array.isArray(paymentList?.items) ? paymentList.items : [];
    const captured = payments.find((payment) => payment.status === 'captured');
    if (!captured) {
        return {
            kind: payments.some((payment) => ['created', 'authorized'].includes(payment.status)) ? 'processing' : 'pending',
            booking,
        };
    }
    validateCapturedTrekPayment(booking, captured);

    if (['cancelled', 'cancellation_requested'].includes(booking.status)) {
        booking = await TrekBooking.findByIdAndUpdate(
            booking._id,
            {
                $set: {
                    paymentId: captured.id,
                    status: 'cancellation_requested',
                    'cancellationDetails.refundAmount': booking.amountPaid || booking.totalAmount,
                    'cancellationDetails.refundStatus': 'pending',
                },
            },
            { new: true }
        );
        return refundTrekBookingPayment(booking, captured.id);
    }

    const outcome = await confirmTrekBooking({
        bookingId: booking._id,
        orderId: booking.orderId,
        paymentId: captured.id,
    });
    if (outcome.kind === 'confirmed') await runTrekConfirmationEffects(outcome.booking);
    return outcome;
}
