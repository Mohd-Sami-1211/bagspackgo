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



        const event = await Event.findById(id);
        if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

        // Get bookings/guests
        const bookings = await Booking.find({ entityId: id, status: { $in: ['Confirmed', 'Pending'] } })
            .select('user entityType details status paymentStatus totalAmount passes createdAt checkinStatus checkInDetails')
            .populate('user', 'name email phone avatar');

        let guestsList = [];
        bookings.forEach(b => {
            if (b.passes && b.passes.length > 0) {
                b.passes.forEach(pass => {
                    guestsList.push({
                        id: pass.passId,
                        bookingId: b._id,
                        bookingRef: b._id.toString().substring(0, 8).toUpperCase(),
                        name: pass.guestName,
                        age: pass.guestAge,
                        gender: pass.guestGender,
                        type: pass.passType,
                        paymentStatus: b.paymentStatus,
                        bookingDate: b.createdAt,
                        contact: b.user?.phone || 'N/A',
                        email: b.user?.email || 'N/A',
                        checkedIn: pass.checkInStatus === 'Checked-in',
                        checkedInAt: pass.checkInTime || null,
                        selectedPickup: b.details?.pickupPoint || null,
                        bookerName: b.user?.name || 'N/A'
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
