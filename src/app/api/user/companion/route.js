// src/app/api/user/companion/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanionRequest from '@/models/CompanionRequest';
import { getCurrentUser } from '@/lib/auth';

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
    try {
      const user = await getCurrentUser();
      if (user?.userId) userId = user.userId;
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

    return NextResponse.json(
      { success: true, message: 'Your request has been received! We\'ll call you shortly.', id: newRequest._id },
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
