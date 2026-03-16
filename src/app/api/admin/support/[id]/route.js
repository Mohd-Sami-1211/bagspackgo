import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Support } from '@/models/support.model';
import { getCurrentAdmin } from '@/lib/adminAuth';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function PATCH(req, context) {
    const params = await context.params;
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const { status, adminReply, sendEmail } = await req.json();

        const ticket = await Support.findById(params.id).populate('provider', 'email').populate('user', 'email');
        if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });

        if (status) ticket.status = status;
        if (adminReply) {
            ticket.adminReply = adminReply;
            ticket.repliedAt = new Date();
        }

        await ticket.save();

        // Optional step: send reply via email
        if (sendEmail && adminReply) {
            const recipientEmail = ticket.senderEmail || (ticket.side === 'provider' ? ticket.provider?.email : ticket.user?.email);
            if (recipientEmail && process.env.GMAIL_USER) {
                const mailOptions = {
                    from: `"bagspackgo Support" <${process.env.GMAIL_USER}>`,
                    to: recipientEmail,
                    subject: `Re: [Ticket ${ticket.ticketNumber}] ${ticket.subject}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #22c55e;">Update on your Support Ticket</h2>
                            <p><strong>Ticket ID:</strong> ${ticket.ticketNumber}</p>
                            <p><strong>Subject:</strong> ${ticket.subject}</p>
                            <p><strong>Status:</strong> ${ticket.status}</p>
                            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                            <p><strong>Admin Reply:</strong></p>
                            <p style="white-space: pre-wrap;">${adminReply}</p>
                            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
                            <p>Best regards,<br/>bagspackgo Support Team</p>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions).catch(console.error);
            }
        }

        return NextResponse.json({ success: true, ticket });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
