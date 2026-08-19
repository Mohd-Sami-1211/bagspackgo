import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Support } from '@/models/support.model';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const queries = await Support.find({ user: user.userId, side: 'user' }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, queries });
    } catch (error) {
        console.error("Fetch support error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, phone, subject, message } = body;

        if (!type) {
            return NextResponse.json({ success: false, message: "Request type is required" }, { status: 400 });
        }

        await dbConnect();

        const query = await Support.create({
            side: 'user',
            user: user.userId,
            senderEmail: user.email || '',
            type,
            phone: phone || '',
            subject: subject || '',
            message: message || '',
            status: 'pending'
        });

        if (user.email && process.env.GMAIL_USER) {
            const mailOptions = {
                from: `"bagspackgo Support" <${process.env.GMAIL_USER}>`,
                to: user.email,
                subject: `Request Received: ${query.subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #22c55e;">We have received your request</h2>
                        <p>Hi ${user.username || 'there'},</p>
                        <p>We have received your request and will get back to you shortly.</p>
                        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                        <p><strong>Ticket ID:</strong> ${query.ticketNumber || query._id}</p>
                        <p><strong>Subject:</strong> ${query.subject}</p>
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap;">${query.message || 'Callback requested'}</p>
                        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                        <p>Best regards,<br/>bagspackgo Support Team</p>
                    </div>
                `
            };
            transporter.sendMail(mailOptions).catch(console.error);
        }

        return NextResponse.json({ success: true, query });
    } catch (error) {
        console.error("Create support error:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
