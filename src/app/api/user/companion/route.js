// src/app/api/user/companion/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanionRequest from '@/models/CompanionRequest';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models/user.model';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, phone, destination, travelDates, groupSize, message } = body;

    if (!name || !phone || !destination) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, and destination are required.' },
        { status: 400 }
      );
    }

    // Optionally link to a logged-in user
    let userId = null;
    let userEmail = null;
    try {
      const currentUser = await getCurrentUser();
      if (currentUser?.userId) {
        userId = currentUser.userId;
        const userDoc = await User.findById(userId).select('email').lean();
        userEmail = userDoc?.email || null;
      }
    } catch (_) {}

    const newRequest = await CompanionRequest.create({
      name,
      phone,
      destination,
      travelDates: travelDates || '',
      groupSize: groupSize || '',
      message: message || '',
      userId,
    });

    // Send confirmation email if user has an email on file
    if (userEmail && process.env.GMAIL_USER) {
      const mailOptions = {
        from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
        to: userEmail,
        subject: `Companion Request Received — ${destination}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 600px;">
            <h2 style="color: #10b981;">We've received your Companion request! 🧭</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for reaching out. Your request for a travel companion to <strong>${destination}</strong> has been received. Our team will get back to you shortly.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p><strong>Destination:</strong> ${destination}</p>
            ${travelDates ? `<p><strong>Travel Date:</strong> ${new Date(travelDates).toLocaleDateString('en-IN')}</p>` : ''}
            ${groupSize ? `<p><strong>Group Size:</strong> ${groupSize} person(s)</p>` : ''}
            ${message ? `<p><strong>Your Note:</strong> ${message}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p>Best regards,<br/>bagspackgo Team</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions).catch(console.error);
    }

    return NextResponse.json(
      { success: true, message: "Your request has been received! We'll call you shortly.", id: newRequest._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Companion request error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user?.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const requests = await CompanionRequest.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Companion GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
