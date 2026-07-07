import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { getCurrentUser } from '@/lib/auth';

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

        // Fetch all bookings for this user, populate the event details
        const bookings = await Booking.find({ user: user.userId })
            .populate({
                path: 'event',
                select: 'title eventType date duration slots location destination destinationLink poster pricePerSlot guide highlights whatsIncluded whatsExcluded whatToBring restrictions includePickup pickupPoints itinerary termsAndConditions sponsors',
                populate: { path: 'guide', select: 'companyName username name' }
            })
            .sort({ createdAt: -1 })
            .exec();

        // Let's also fetch GuideDetails to get company names if available
        const { GuideDetails } = await import('@/models/guidedetails.model');
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
                duration: event.duration ? `${event.duration} days` : '1 day',
                people: b.slots || 1,
                destination: event.destination || event.location || 'TBD',
                destinationLink: event.destinationLink || '',
                location: event.location || '',
                price: b.amountPaid || event.pricePerSlot,
                image: event.poster || '',
                poster: event.poster || '',
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
                    return { ...p, name: pName || p.name, phone: pMobile || p.phone, age: pAge || p.age, gender: pGender || p.gender };
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
        const { event, slots, amountPaid, contactDetails, participants, selectedPickup, customFormResponses, extraChargesTotal } = data;

        if (!event || !slots || amountPaid === undefined) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Validate slot availability before creating booking
        const eventDoc = await Event.findById(event);
        if (!eventDoc) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }
        const availableSlots = eventDoc.totalSlots - (eventDoc.bookedSlots || 0);
        if (slots > availableSlots) {
            return NextResponse.json({ 
                success: false, 
                message: availableSlots <= 0 ? 'This event is sold out.' : `Only ${availableSlots} slot(s) available.`
            }, { status: 400 });
        }

        const newBooking = await Booking.create({
            user: user.userId,
            event,
            slots,
            amountPaid,
            contactDetails,
            participants: participants.map(p => ({
                name: p.name,
                email: p.email || '',
                phone: p.phone || '',
                age: p.age,
                gender: p.gender,
                bloodGroup: p.bloodGroup || '',
                country: p.nationality || p.country || '',
                address: p.address || '',
                idType: p.idType,
                idNumber: p.idNumber,
                idProofUrl: p.idProofImage || p.idProofUrl || '',
                medicalCondition: p.medicalCondition || '',
                passCode: Math.random().toString(36).substring(2, 10).toUpperCase()
            })),
            selectedPickup: selectedPickup || undefined,
            customFormResponses: Array.isArray(customFormResponses) ? customFormResponses : [],
            extraChargesTotal: extraChargesTotal || 0,
            status: 'pending',
            paymentId: 'pending',
            orderId: 'pending'
        });

        return NextResponse.json({ success: true, bookingId: newBooking._id.toString() }, { status: 201 });
    } catch (error) {
        console.error('Create event booking error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
