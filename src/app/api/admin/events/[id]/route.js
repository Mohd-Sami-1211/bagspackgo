import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { Booking } from '@/models/booking.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET(req, context) {
    try {
        const params = await context.params;
        const { id } = params;
        
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const event = await Event.findById(id);
        if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

        // Get bookings/guests — use same pattern as provider route
        const bookings = await Booking.find({ event: id, status: { $in: ['confirmed', 'completed'] } }).lean();

        let guestsList = [];
        bookings.forEach(booking => {
            if (booking.participants && Array.isArray(booking.participants)) {
                booking.participants.forEach((p, pIdx) => {
                    const allResponses = booking.customFormResponses || [];
                    const participantResponses = allResponses.filter(r => r.slotIndex === pIdx || r.slotIndex === undefined);

                    guestsList.push({
                        id: p._id?.toString() || Math.random().toString(),
                        name: p.name,
                        email: p.email || booking.contactDetails?.email,
                        mobile: p.phone || booking.contactDetails?.phone,
                        age: p.age,
                        gender: p.gender,
                        nationality: p.country || '',
                        idProofType: p.idType,
                        idProofNumber: p.idNumber,
                        idProofUrl: p.idProofUrl || '',
                        medicalCondition: p.medicalCondition || '',
                        address: p.address,
                        country: p.country,
                        bookingDate: booking.createdAt,
                        bookingRef: booking._id.toString().substring(0, 8).toUpperCase(),
                        passCode: p.passCode,
                        checkedIn: p.checkedIn || false,
                        selectedPickup: booking.selectedPickup || null,
                        customFormResponses: participantResponses,
                        extraChargesTotal: booking.extraChargesTotal || 0,
                    });
                });
            }
        });

        return NextResponse.json({ success: true, event, guests: guestsList });
    } catch (err) {
        console.error('Admin GET event details error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req, context) {
    try {
        const params = await context.params;
        const { id } = params;

        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await req.json();

        const allowedFields = [
            'title', 'eventType', 'location', 'date', 'duration', 'totalSlots', 
            'pricePerSlot', 'destination', 'destinationLink', 'about', 'highlights', 
            'whatsIncluded', 'whatsExcluded', 'faqs', 'whatToBring', 'restrictions', 
            'pickupPoints', 'itinerary', 'termsAndConditions', 'poster', 'photographs',
            'visibility', 'applicationFormType', 'customFormFields'
        ];
        
        const updateData = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) updateData[key] = body[key];
        }

        if (body.action === 'publish') {
            updateData.status = 'published';
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!updatedEvent) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

        return NextResponse.json({ 
            success: true, 
            message: body.action === 'publish' ? 'Event published successfully' : 'Event updated successfully', 
            event: updatedEvent 
        });
    } catch (err) {
        console.error('Admin PATCH event error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const params = await context.params;
        const { id } = params;

        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const deleted = await Event.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Admin DELETE event error:', err);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
