import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { OffBeatBooking } from '@/models/offbeatBooking.model';
import { OffBeat } from '@/models/offbeat.model';
import { User } from '@/models/user.model';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0' };
const cleanText = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function validateRequest(body) {
    const offbeatId = cleanText(body.offbeatId, 64);
    const inquiryType = body.inquiryType === 'group' ? 'group' : 'private';
    const numberOfPersons = Number(body.numberOfPersons);
    const contactNumber = cleanText(body.contactNumber, 20);
    const specialRequirements = cleanText(body.specialRequirements, 1000);
    const dateOptions = (Array.isArray(body.dateOptions) ? body.dateOptions : [])
        .slice(0, 12).map((item) => cleanText(item, 80)).filter(Boolean);
    const date = cleanText(body.date, 64);

    if (!mongoose.Types.ObjectId.isValid(offbeatId)) return { error: 'This destination is not valid.' };
    if (!Number.isInteger(numberOfPersons) || numberOfPersons < 1 || numberOfPersons > 100) return { error: 'Choose between 1 and 100 travellers.' };
    if (contactNumber.length < 6) return { error: 'Enter a valid contact number.' };

    if (inquiryType === 'private') {
        const preferredDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!date || Number.isNaN(preferredDate.getTime()) || preferredDate < today) return { error: 'Choose a valid future travel date.' };
    } else if (!dateOptions.length) {
        return { error: 'Choose at least one preferred date.' };
    }

    return { data: {
        offbeatId, inquiryType, numberOfPersons, contactNumber, specialRequirements,
        date: inquiryType === 'private' ? date : undefined,
        dateOptions: inquiryType === 'group' ? dateOptions : [],
    } };
}

export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return NextResponse.json({ success: false, message: 'Log in to send this request.' }, { status: 401, headers: PRIVATE_HEADERS });
        if (currentUser.role !== 'user') return NextResponse.json({ success: false, message: 'Only traveller accounts can send requests.' }, { status: 403, headers: PRIVATE_HEADERS });

        let body;
        try { body = await req.json(); } catch {
            return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400, headers: PRIVATE_HEADERS });
        }
        const validation = validateRequest(body || {});
        if (validation.error) return NextResponse.json({ success: false, message: validation.error }, { status: 400, headers: PRIVATE_HEADERS });

        await dbConnect();
        const { offbeatId, ...safeFields } = validation.data;
        const [offbeat, userDoc] = await Promise.all([
            OffBeat.findOne({ _id: offbeatId, status: 'published' }).select('title').lean(),
            User.findById(currentUser.userId).select('email username').lean(),
        ]);
        if (!offbeat) return NextResponse.json({ success: false, message: 'This destination is no longer accepting requests.' }, { status: 409, headers: PRIVATE_HEADERS });

        const booking = await OffBeatBooking.create({ offbeat: offbeatId, user: currentUser.userId, ...safeFields, status: 'pending' });

        if (userDoc?.email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            const offbeatName = escapeHtml(offbeat.title || 'Offbeat Destination');
            const tripType = safeFields.inquiryType === 'group' ? 'Group Trip' : 'Personal Trip';
            const dateRows = safeFields.date
                ? `<p><strong>Preferred date:</strong> ${escapeHtml(new Date(safeFields.date).toLocaleDateString('en-IN'))}</p>`
                : safeFields.dateOptions.length ? `<p><strong>Date options:</strong> ${safeFields.dateOptions.map(escapeHtml).join(', ')}</p>` : '';
            const noteRow = safeFields.specialRequirements ? `<p><strong>Notes:</strong> ${escapeHtml(safeFields.specialRequirements)}</p>` : '';
            const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
            transporter.sendMail({
                from: `"bagspackgo" <${process.env.GMAIL_USER}>`, to: userDoc.email,
                subject: `Interest received — ${offbeat.title || 'Offbeat Destination'}`,
                html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#17372f;max-width:600px"><h2>We have received your interest</h2><p>Hi <strong>${escapeHtml(userDoc.username || 'there')}</strong>,</p><p>Thank you for your interest in <strong>${offbeatName}</strong>. A local travel expert will contact you with the next steps.</p><hr style="border:0;border-top:1px solid #e5e7eb;margin:20px 0"><p><strong>Request:</strong> ${tripType}</p><p><strong>Travellers:</strong> ${safeFields.numberOfPersons}</p><p><strong>Contact:</strong> ${escapeHtml(safeFields.contactNumber)}</p>${dateRows}${noteRow}<hr style="border:0;border-top:1px solid #e5e7eb;margin:20px 0"><p>bagspackgo Team</p></div>`,
            }).catch((error) => console.error('Offbeat request email failed:', error));
        }

        return NextResponse.json({ success: true, data: { id: booking._id.toString(), status: booking.status } }, { status: 201, headers: PRIVATE_HEADERS });
    } catch (error) {
        console.error('Failed to create offbeat booking:', error);
        return NextResponse.json({ success: false, message: 'We could not send your request. Please try again.' }, { status: 500, headers: PRIVATE_HEADERS });
    }
}

export async function GET(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return NextResponse.json({ success: false, message: 'Log in to view requests.' }, { status: 401, headers: PRIVATE_HEADERS });
        if (currentUser.role !== 'user') return NextResponse.json({ success: false, message: 'Users only.' }, { status: 403, headers: PRIVATE_HEADERS });

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
        const limit = Math.min(24, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10) || 10));
        const filter = { user: currentUser.userId };
        await dbConnect();
        const [bookings, total] = await Promise.all([
            OffBeatBooking.find(filter)
                .select('offbeat numberOfPersons contactNumber date dateOptions inquiryType specialRequirements status createdAt updatedAt')
                .populate('offbeat', 'title destination region coverPhoto').sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit).limit(limit).lean(),
            OffBeatBooking.countDocuments(filter),
        ]);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return NextResponse.json({ success: true, data: bookings, pagination: { page, limit, total, totalPages, hasMore: page < totalPages } }, { headers: PRIVATE_HEADERS });
    } catch (error) {
        console.error('Failed to fetch offbeat bookings:', error);
        return NextResponse.json({ success: false, message: 'We could not load your requests.' }, { status: 500, headers: PRIVATE_HEADERS });
    }
}
