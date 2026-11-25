import { after, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { getCurrentUser } from '@/lib/auth';
import { getAvailableEventSlots, getEventSlotShortageMessage } from '@/lib/eventSlots';
import {
    calculateEventBookingQuote,
    confirmEventBooking,
    EventBookingValidationError,
    EVENT_CHECKOUT_HOLD_MS,
    generateEventPassCode,
    normalizeEventParticipant,
    sendEventConfirmationOnce,
} from '@/lib/eventBooking';

export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        // Providers & admins cannot use user booking routes
        if (user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Access denied. This endpoint is for users only.' }, { status: 403 });
        }

        await dbConnect();
        const listView = new URL(req.url).searchParams.get('view') === 'list';

        // This endpoint powers My Bookings and intentionally exposes only
        // usable, confirmed reservations. Pending/cancelled checkouts stay
        // in the backend for payment reconciliation, not in the user's list.
        let bookingsQuery = Booking.find({ user: user.userId, status: 'confirmed' });
        if (listView) bookingsQuery = bookingsQuery.select('event bookingDate amountPaid slots status createdAt');
        const bookings = await bookingsQuery
            .populate({
                path: 'event',
                select: listView
                    ? 'title eventType date duration location destination pricePerSlot guide status'
                    : 'title eventType date duration slots location destination destinationLink pricePerSlot guide highlights whatsIncluded whatsExcluded whatToBring restrictions includePickup pickupPoints itinerary termsAndConditions sponsors status',
                populate: { path: 'guide', select: 'companyName username name' }
            })
            .sort({ createdAt: -1 })
            .exec();

        // Let's also fetch GuideDetails to get company names if available
        const guideIds = [...new Set(bookings.map(b => b.event?.guide?._id).filter(id => id))];
        const guideDetailsList = await GuideDetails.find({ guide: { $in: guideIds } }).select('guide companyname').lean();
        const guideDetailsMap = {};
        guideDetailsList.forEach(gd => {
            guideDetailsMap[gd.guide.toString()] = gd.companyname;
        });

        // Format the bookings to match the frontend expectations
        const formattedBookings = bookings.map(b => {
            const event = b.event;
            if (!event) return null; // Defensive check

            const passUrl = `/user/event/pass/${b._id}`;
            const gName = guideDetailsMap[event.guide?._id?.toString()] || event.guide?.companyName || event.guide?.username || event.guide?.name || 'Local Organizer';

            return {
                id: b._id.toString(),
                category: event.eventType || 'Event',
                name: event.title,
                guideName: gName,
                companyName: gName,
                guide: gName,
                date: event.date || b.bookingDate,
                duration: event.duration ? `${event.duration} day${event.duration === 1 ? '' : 's'}` : '1 day',
                people: b.slots || 1,
                destination: event.destination || event.location || 'TBD',
                destinationLink: event.destinationLink || '',
                location: event.location || '',
                price: b.amountPaid ?? event.pricePerSlot ?? 0,
                image: ['published', 'completed', 'cancelled'].includes(event.status)
                    ? `/api/events/${event._id.toString()}/poster`
                    : '',
                poster: ['published', 'completed', 'cancelled'].includes(event.status)
                    ? `/api/events/${event._id.toString()}/poster`
                    : '',
                status: b.status,
                passUrl: b.status === 'confirmed' ? passUrl : null,
                // Rich event content
                highlights: event.highlights || [],
                whatsIncluded: event.whatsIncluded || [],
                whatsExcluded: event.whatsExcluded || [],
                sponsors: event.sponsors || [],
                whatToBring: event.whatToBring || [],
                restrictions: event.restrictions || [],
                includePickup: event.includePickup !== false,
                pickupPoints: event.pickupPoints || [],
                itinerary: event.itinerary || [],
                termsAndConditions: event.termsAndConditions || [],
                // Booking-specific
                participants: (b.participants || []).map((p, pIdx) => {
                    let pName = p.name;
                    let pMobile = p.phone;
                    let pAge = p.age;
                    let pGender = p.gender;

                    if (b.customFormResponses && Array.isArray(b.customFormResponses)) {
                        const slotResponses = b.customFormResponses.filter(r => r.slotIndex === pIdx);
                        if (!pName) {
                            const nf = slotResponses.find(r => r.fieldTitle?.toLowerCase().includes('name'));
                            if (nf) pName = nf.value;
                        }
                        if (!pMobile) {
                            const phf = slotResponses.find(r => r.fieldTitle?.toLowerCase().includes('phone') || r.fieldTitle?.toLowerCase().includes('mobile'));
                            if (phf) pMobile = phf.value;
                        }
                        if (!pAge) {
                            const ag = slotResponses.find(r => r.fieldTitle?.toLowerCase() === 'age');
                            if (ag) pAge = ag.value;
                        }
                        if (!pGender) {
                            const gen = slotResponses.find(r => r.fieldTitle?.toLowerCase() === 'gender');
                            if (gen) pGender = gen.value;
                        }
                    }
                    return {
                        name: pName || p.name,
                        email: p.email || '',
                        phone: pMobile || p.phone,
                        age: pAge || p.age,
                        gender: pGender || p.gender,
                        bloodGroup: p.bloodGroup || '',
                        country: p.country || '',
                        idType: p.idType || '',
                        idNumber: p.idNumber || '',
                        medicalCondition: p.medicalCondition || '',
                        checkedIn: p.checkedIn === true,
                    };
                }),
                contactDetails: b.contactDetails || {},
                paymentId: b.paymentId || '',
                orderId: b.orderId || '',
                bookingDate: b.bookingDate || b.createdAt,
                // Selected pickup/dropoff from booking
                selectedPickup: b.selectedPickup || null,
            };
        }).filter(b => b !== null);

        return NextResponse.json({ success: true, count: formattedBookings.length, data: formattedBookings }, {
            headers: { 'Cache-Control': listView ? 'private, max-age=15, stale-while-revalidate=45' : 'private, no-cache' },
        });
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

function bookingResponse(booking, body = {}, status = 200) {
    const bookingId = booking._id.toString();
    if (booking.status === 'confirmed') {
        after(() => sendEventConfirmationOnce(bookingId));
    }
    return NextResponse.json({
        success: true,
        bookingId,
        status: booking.status,
        amountPaid: booking.amountPaid,
        expiresAt: booking.expiresAt,
        ...body,
    }, { status });
}

async function reuseCheckout(booking, eventId) {
    if (booking.event.toString() === eventId) {
        if (booking.amountPaid === 0) {
            if (booking.status === 'confirmed') return bookingResponse(booking, { reused: true });

            // A free checkout started before immediate confirmation can still have a hold.
            if (booking.status === 'pending') {
                const outcome = await confirmEventBooking({ bookingId: booking._id, userId: booking.user });
                if (outcome.kind === 'confirmed') return bookingResponse(outcome.booking, { reused: true });
                if (outcome.kind === 'expired') {
                    return NextResponse.json({ success: false, expired: true, message: 'This checkout expired. Please start again.' }, { status: 410 });
                }
                if (outcome.kind === 'sold_out') {
                    return NextResponse.json({ success: false, soldOut: true, message: 'This event is no longer available.' }, { status: 409 });
                }
            }
        } else if (booking.status === 'pending') {
            return bookingResponse(booking, { reused: true });
        }
    }
    return NextResponse.json({ success: false, message: 'This checkout has already been processed.' }, { status: 409 });
}

export async function POST(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        await dbConnect();

        const data = await req.json();
        const {
            event,
            slots,
            contactDetails,
            participants,
            selectedPickup,
            customFormResponses,
            checkoutKey,
        } = data;

        if (!event || !slots || !checkoutKey) {
            return NextResponse.json({ success: false, message: 'Event, slots, and checkout key are required.' }, { status: 400 });
        }
        if (typeof checkoutKey !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey)) {
            return NextResponse.json({ success: false, message: 'Invalid checkout key.' }, { status: 400 });
        }

        const checkout = { user: user.userId, checkoutKey };
        const existingBooking = await Booking.findOne(checkout).lean();
        if (existingBooking) return await reuseCheckout(existingBooking, event);

        const eventDoc = await Event.findOne({
            _id: event,
            status: 'published',
            date: { $gte: new Date() },
        }).select('guide totalSlots bookedSlots reservedSlots showAvailableSlots showTotalSlots pricePerSlot pickupPoints includePickup participantFields applicationFormType customFormFields');
        if (!eventDoc) {
            return NextResponse.json({ success: false, message: 'This event is no longer available for booking.' }, { status: 404 });
        }

        const paused = await GuideDetails.exists({
            guide: eventDoc.guide,
            'pausedServices.event': true,
        });
        if (paused) {
            return NextResponse.json({ success: false, message: 'Bookings for this event are temporarily paused.' }, { status: 409 });
        }

        const quote = calculateEventBookingQuote(eventDoc, slots, customFormResponses);
        const isFree = quote.totalPayable === 0;
        const availableSlots = getAvailableEventSlots(eventDoc);
        if (quote.slots > availableSlots) {
            const concurrentBooking = await Booking.findOne(checkout).lean();
            if (concurrentBooking) return await reuseCheckout(concurrentBooking, event);
            return NextResponse.json({
                success: false,
                soldOut: availableSlots === 0,
                insufficientSlots: availableSlots > 0,
                message: getEventSlotShortageMessage(eventDoc, availableSlots),
            }, { status: 409 });
        }

        if (!Array.isArray(participants) || participants.length !== quote.slots) {
            return NextResponse.json({ success: false, message: 'Participant details must match the number of slots.' }, { status: 400 });
        }

        const email = typeof contactDetails?.email === 'string' ? contactDetails.email.trim().toLowerCase() : '';
        const phone = typeof contactDetails?.phone === 'string' ? contactDetails.phone.replace(/\D/g, '') : '';
        if (!/^\S+@\S+\.\S+$/.test(email) || phone.length < 7 || phone.length > 15) {
            return NextResponse.json({ success: false, message: 'Enter a valid contact email and phone number.' }, { status: 400 });
        }

        const normalizedParticipants = participants.map((participant, index) => ({
            ...normalizeEventParticipant(participant, eventDoc.participantFields, index),
            passCode: generateEventPassCode(),
        }));

        let normalizedPickup;
        if (eventDoc.includePickup !== false && eventDoc.pickupPoints?.length) {
            const match = eventDoc.pickupPoints.find((point) => point.location === selectedPickup?.location);
            if (!match) {
                return NextResponse.json({ success: false, message: 'Select a valid pickup point.' }, { status: 400 });
            }
            normalizedPickup = { location: match.location, link: match.link || '', time: match.time || '' };
        }

        const session = await mongoose.startSession();
        let newBooking;
        try {
            await session.withTransaction(async () => {
                const now = new Date();
                // The unique checkout key resolves replays before claiming capacity.
                const [createdBooking] = await Booking.create([{
                    ...checkout,
                    event,
                    slots: quote.slots,
                    slotsReserved: !isFree,
                    amountPaid: quote.totalPayable,
                    contactDetails: { email, phone },
                    participants: normalizedParticipants,
                    selectedPickup: normalizedPickup,
                    customFormResponses: quote.customFormResponses,
                    extraChargesTotal: quote.extraChargesTotal,
                    expiresAt: isFree ? null : new Date(now.getTime() + EVENT_CHECKOUT_HOLD_MS),
                    confirmedAt: isFree ? now : null,
                    status: isFree ? 'confirmed' : 'pending',
                    paymentId: isFree ? 'free_event' : 'pending',
                    orderId: isFree ? 'free_event' : 'pending',
                }], { session });

                const updatedEvent = await Event.findOneAndUpdate(
                    {
                        _id: event,
                        status: 'published',
                        date: { $gte: now },
                        $expr: {
                            $lte: [
                                {
                                    $add: [
                                        { $ifNull: ['$bookedSlots', 0] },
                                        { $ifNull: ['$reservedSlots', 0] },
                                        quote.slots,
                                    ],
                                },
                                '$totalSlots',
                            ],
                        },
                    },
                    { $inc: isFree ? { bookedSlots: quote.slots } : { reservedSlots: quote.slots } },
                    { new: true, session }
                );

                if (!updatedEvent) {
                    throw new EventBookingValidationError('This event has just sold out. Please choose another event or try again.', 409);
                }
                newBooking = createdBooking;
            });
        } catch (error) {
            if (error?.code === 11000) {
                const concurrentBooking = await Booking.findOne(checkout).lean();
                if (concurrentBooking) return await reuseCheckout(concurrentBooking, event);
            }
            throw error;
        } finally {
            await session.endSession();
        }

        return bookingResponse(newBooking, {
            quote: {
                subtotal: quote.subtotal,
                extraChargesTotal: quote.extraChargesTotal,
                totalFees: quote.totalFees,
            },
        }, 201);
    } catch (error) {
        if (error instanceof EventBookingValidationError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        if (error?.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid event or booking identifier.' }, { status: 400 });
        }
        if (error?.code === 11000) {
            return NextResponse.json({ success: false, message: 'This checkout request is already being processed.' }, { status: 409 });
        }
        console.error('Create event booking error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
