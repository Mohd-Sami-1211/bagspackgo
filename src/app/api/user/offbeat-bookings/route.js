import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeatBooking } from '@/models/offbeatBooking.model';
import { getCurrentUser } from '@/lib/auth';
import { OffBeat } from '@/models/offbeat.model';
import { User } from '@/models/user.model';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Must be logged in to book' }, { status: 401 });
        }

        await dbConnect();
        const { offbeatId, numberOfPersons, contactNumber, date, specialRequirements, inquiryType, dateOptions } = await req.json();

        const booking = new OffBeatBooking({
            offbeat: offbeatId,
            user: currentUser.userId,
            numberOfPersons,
            contactNumber,
            date,
            specialRequirements,
            inquiryType: inquiryType || 'private',
            dateOptions: dateOptions || [],
            status: 'pending'
        });

        await booking.save();

        // Send confirmation email
        try {
            const [offbeat, userDoc] = await Promise.all([
                OffBeat.findById(offbeatId).select('title').lean(),
                User.findById(currentUser.userId).select('email username').lean(),
            ]);
            if (userDoc?.email && process.env.GMAIL_USER) {
                const offbeatName = offbeat?.title || 'Offbeat Destination';
                const tripType = inquiryType === 'group' ? 'Group Trip' : 'Private Trip';
                const mailOptions = {
                    from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
                    to: userDoc.email,
                    subject: `Interest Received — ${offbeatName}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 600px;">
                            <h2 style="color: #10b981;">We've received your interest! 🏔️</h2>
                            <p>Hi <strong>${userDoc.username || 'there'}</strong>,</p>
                            <p>Thank you for your interest in <strong>${offbeatName}</strong>. We have received your ${tripType} request and will get back to you shortly.</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                            <p><strong>Destination:</strong> ${offbeatName}</p>
                            <p><strong>Type:</strong> ${tripType}</p>
                            <p><strong>Number of Persons:</strong> ${numberOfPersons}</p>
                            <p><strong>Contact Number:</strong> ${contactNumber}</p>
                            ${date ? `<p><strong>Preferred Date:</strong> ${date}</p>` : ''}
                            ${dateOptions?.length ? `<p><strong>Date Options:</strong> ${dateOptions.join(', ')}</p>` : ''}
                            ${specialRequirements ? `<p><strong>Special Requirements:</strong> ${specialRequirements}</p>` : ''}
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                            <p>Best regards,<br/>bagspackgo Team</p>
                        </div>
                    `,
                };
                transporter.sendMail(mailOptions).catch(console.error);
            }
        } catch (_) { /* email failure should not block the response */ }

        return NextResponse.json({ success: true, data: booking });
    } catch (error) {
        console.error('Failed to create offbeat booking:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Must be logged in' }, { status: 401 });
        }

        await dbConnect();
        
        const bookings = await OffBeatBooking.find({ user: currentUser.userId })
            .populate('offbeat')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Failed to fetch offbeat bookings:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
