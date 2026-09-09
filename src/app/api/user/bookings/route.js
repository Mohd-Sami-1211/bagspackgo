import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { getCurrentUser } from '@/lib/auth';
import {
    calculateEventBookingQuote,
    EventBookingValidationError,
    EVENT_CHECKOUT_HOLD_MS,
    generateEventPassCode,
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

        // This endpoint powers My Bookings and intentionally exposes only
        // usable, confirmed reservations. Pending/cancelled checkouts stay
        // in the backend for payment reconciliation, not in the user's list.
        const bookings = await Booking.find({ user: user.userId, status: 'confirmed' })
            .populate({
                path: 'event',
                select: 'title eventType date duration slots location destination destinationLink pricePerSlot guide highlights whatsIncluded whatsExcluded whatToBring restrictions includePickup pickupPoints itinerary termsAndConditions sponsors status',
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

        return NextResponse.json({ success: true, count: formattedBookings.length, data: formattedBookings });
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
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

        // A repeated request with the same checkout key returns the same pending
        // booking instead of creating a second payment attempt.
        const existingBooking = await Booking.findOne({ user: user.userId, checkoutKey }).lean();
        if (existingBooking) {
            if (existingBooking.status === 'pending' && existingBooking.event.toString() === event) {
                return NextResponse.json({
                    success: true,
                    bookingId: existingBooking._id.toString(),
                    amountPaid: existingBooking.amountPaid,
                    expiresAt: existingBooking.expiresAt,
                    reused: true,
                });
            }
            return NextResponse.json({ success: false, message: 'This checkout has already been processed.' }, { status: 409 });
        }

        const eventDoc = await Event.findOne({
            _id: event,
            status: 'published',
            date: { $gte: new Date() },
        }).select('guide totalSlots bookedSlots reservedSlots pricePerSlot pickupPoints includePickup applicationFormType customFormFields');
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
        const availableSlots = eventDoc.totalSlots - (eventDoc.bookedSlots || 0) - (eventDoc.reservedSlots || 0);
        if (quote.slots > availableSlots) {
            return NextResponse.json({ 
                success: false, 
                message: availableSlots <= 0 ? 'This event is sold out.' : `Only ${availableSlots} slot(s) available.`
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

        const normalizedParticipants = participants.map((participant, index) => {
            const name = typeof participant?.name === 'string' ? participant.name.trim().slice(0, 150) : '';
            const participantPhone = typeof participant?.phone === 'string' ? participant.phone.replace(/\D/g, '') : '';
            const age = Number(participant?.age);
            const gender = typeof participant?.gender === 'string' ? participant.gender.trim().slice(0, 50) : '';
            const country = typeof (participant?.nationality || participant?.country) === 'string'
                ? (participant.nationality || participant.country).trim().slice(0, 100)
                : '';
            const idType = typeof participant?.idType === 'string' ? participant.idType.trim().slice(0, 100) : '';
            const idNumber = typeof participant?.idNumber === 'string' ? participant.idNumber.trim().slice(0, 150) : '';
            const idProofUrl = participant?.idProofImage || participant?.idProofUrl || '';

            if (!name || !Number.isInteger(age) || age < 1 || age > 120 || participantPhone.length < 7 || participantPhone.length > 15 || !gender || !country || !idType || !idNumber || !idProofUrl) {
                throw new EventBookingValidationError(`Participant ${index + 1} has incomplete or invalid details.`);
            }
            if (typeof idProofUrl !== 'string' || idProofUrl.length > 4_000_000 || (!idProofUrl.startsWith('data:image/') && !/^https:\/\//i.test(idProofUrl))) {
                throw new EventBookingValidationError(`Participant ${index + 1}'s ID proof has an invalid format or is too large.`);
            }

            return {
                name,
                email: typeof participant.email === 'string' ? participant.email.trim().toLowerCase().slice(0, 254) : '',
                phone: participantPhone,
                age,
                gender,
                bloodGroup: typeof participant.bloodGroup === 'string' ? participant.bloodGroup.trim().slice(0, 20) : '',
                country,
                address: typeof participant.address === 'string' ? participant.address.trim().slice(0, 500) : '',
                idType,
                idNumber,
                idProofUrl,
                medicalCondition: typeof participant.medicalCondition === 'string' ? participant.medicalCondition.trim().slice(0, 500) : '',
                passCode: generateEventPassCode(),
            };
        });

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
                const heldEvent = await Event.findOneAndUpdate(
                    {
                        _id: event,
                        status: 'published',
                        date: { $gte: new Date() },
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
                    { $inc: { reservedSlots: quote.slots } },
                    { new: true, session }
                );

                if (!heldEvent) {
                    throw new EventBookingValidationError('This event has just sold out. Please choose another event or try again.', 409);
                }

                const [createdBooking] = await Booking.create([{
                    user: user.userId,
                    event,
                    slots: quote.slots,
                    slotsReserved: true,
                    amountPaid: quote.totalPayable,
                    contactDetails: { email, phone },
                    participants: normalizedParticipants,
                    selectedPickup: normalizedPickup,
                    customFormResponses: quote.customFormResponses,
                    extraChargesTotal: quote.extraChargesTotal,
                    checkoutKey,
                    expiresAt: new Date(Date.now() + EVENT_CHECKOUT_HOLD_MS),
                    status: 'pending',
                    paymentId: 'pending',
                    orderId: 'pending'
                }], { session });
                newBooking = createdBooking;
            });
        } finally {
            await session.endSession();
        }

        return NextResponse.json({
            success: true,
            bookingId: newBooking._id.toString(),
            amountPaid: quote.totalPayable,
            expiresAt: newBooking.expiresAt,
            quote: {
                subtotal: quote.subtotal,
                extraChargesTotal: quote.extraChargesTotal,
                totalFees: quote.totalFees,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create event booking error:', error);
        if (error instanceof EventBookingValidationError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        if (error?.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid event or booking identifier.' }, { status: 400 });
        }
        if (error?.code === 11000) {
            return NextResponse.json({ success: false, message: 'This checkout request is already being processed.' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
