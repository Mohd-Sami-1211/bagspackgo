import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { bookingModel } from "src/models/bookingModel";
import { EventModel } from "src/models/eventModel";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();
    const userIdStr = req.nextUrl.searchParams.get('userId');
    

    if (!userIdStr) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const userId = new mongoose.Types.ObjectId(userIdStr);
    const userBookings = await bookingModel
      .find({ userId: userId, status: "confirmed" });
    const amountPaid = userBookings.map(booking => ({
      eventId: booking.eventId,
      userId: booking.userId,
      amount: booking.amount,
      guide : booking.guide
    }));
    console.log("amountPaid " , amountPaid);
    const eventIdArray = userBookings
      .map(booking => booking.eventId)
      .filter(id => id !== null && id !== undefined);
    

    const eventDetails = await EventModel.find({ 
      eventId: { $in: eventIdArray } 
    });
    console.log(eventDetails)
    const combinedEvent = eventDetails.map(event => {
      const payment = amountPaid.find(p => p.eventId === event.eventId);
      
      if (payment) {
        return {
          ...event.toObject(),
          userId: payment.userId,
          amountPaid: payment.amount,
          guide : payment.guide
        };
      }
      
      return event.toObject();
    });
    return NextResponse.json({ 
      success: true, 
      data: combinedEvent
       
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch bookings", 
      details: error.message 
    }, { status: 500 });
  }
}
