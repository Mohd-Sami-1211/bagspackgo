import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Booking as EventBooking } from '@/models/booking.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { providerTransactionId, providerDepositedAccount, model } = await req.json();

        if (!providerTransactionId) {
            return NextResponse.json({ success: false, message: 'Transaction ID required' }, { status: 400 });
        }

        const update = {
            providerPaymentStatus: 'completed',
            providerTransactionId,
            providerDepositedAccount: providerDepositedAccount || '',
            providerPaymentDate: new Date()
        };

        let updated;
        if (model === 'TripBooking') {
            updated = await TripBooking.findByIdAndUpdate(params.id, update, { new: true });
        } else if (model === 'TrekBooking') {
            updated = await TrekBooking.findByIdAndUpdate(params.id, update, { new: true });
        } else if (model === 'EventBooking') {
            updated = await EventBooking.findByIdAndUpdate(params.id, update, { new: true });
        }

        if (!updated) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

        return NextResponse.json({ success: true, payment: updated });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
