import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';

export async function GET() {
    try {
        await dbConnect();
        const payloadFields = [
            {
                id: '123',
                title: 'Blood Group',
                type: 'text',
                options: [{ value: '', extraCharge: 0 }],
                required: false,
                dependsOn: null,
                showIfValue: null
            }
        ];

        const event = new Event({
            title: 'Test Event',
            eventType: 'Trek',
            location: 'Delhi',
            date: new Date(),
            totalSlots: 10,
            pricePerSlot: 100,
            destination: 'Manali',
            about: 'Test event',
            guide: '600000000000000000000000',
            applicationFormType: 'customized',
            customFormFields: payloadFields
        });

        // Test validation without saving
        const err = event.validateSync();
        if (err) {
            return NextResponse.json({ success: false, error: err.message, details: err.errors });
        }

        // Return the casted object
        return NextResponse.json({ success: true, customFormFields: event.customFormFields });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
