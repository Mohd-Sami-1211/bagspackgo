import { NextResponse } from "next/server";
import { UploadFile } from "src/app/api/completeCompanyDetails/route";
import { bookingModel } from "src/models/bookingModel";
import { EventModel } from "src/models/eventModel";
import connectDB from "src/DB/DBConnection";
import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    const amount = formData.get('formData[amount]');
    const options = {
      amount: parseInt(amount) * 100, // Convert rupees to paise
      currency: "INR",
      notes: {
        description: "bagspackgo Razorpay Order",
      },
    };
    const order = await razorpay.orders.create(options);
    console.log(order);
    // 1. Fetch contact details
    const email = formData.get('formData[contactDetails][email]');
    const mobileNumber = formData.get('formData[contactDetails][phone]');
    const idProofFiles = [];
    for (let i = 0; formData.has(`formData[participants][${i}][idPhoto]`); i++) {
      const file = formData.get(`formData[participants][${i}][idPhoto]`);
      if (file && file.size > 0) {
        const uploadedFile = await UploadFile(file);
        idProofFiles.push({idFileUrl : uploadedFile.secure_url});
      }
    }
    // 2. Fetch participants array
    const participants = [];
    
    for (let i = 0; formData.has(`formData[participants][${i}][name]`); i++) {
      participants.push({
        name: formData.get(`formData[participants][${i}][name]`),
        age: formData.get(`formData[participants][${i}][age]`),
        gender: formData.get(`formData[participants][${i}][gender]`),
        bloodGroup: formData.get(`formData[participants][${i}][bloodGroup]`),
        country: formData.get(`formData[participants][${i}][country]`),
        address: formData.get(`formData[participants][${i}][address]`),
        idType: formData.get(`formData[participants][${i}][idType]`),
        idNumber: formData.get(`formData[participants][${i}][idNumber]`),
        idFileUrl : idProofFiles[i].idFileUrl
      });
    }

    // 3. Fetch other booking-related fields (if needed)
    const eventId = formData.get('formData[eventId]');
    const updatedEvent = await EventModel.findOneAndUpdate(
      { 
        eventId,
        $expr: { 
          $gte: [
            { $subtract: ["$totalSlots", "$bookings"] },
            participants.length
          ]
        }
      },
      { 
        $inc: { bookings:  participants.length }
      },
      { new: true }
    );

    if (!updatedEvent) {
      throw new Error('Not enough slots available');
    }

    

    // 5. Create booking document
    const bookingData = new bookingModel({
      eventId,
      contactDetails: {
        email,
        mobileNumber
      },
      participantsDetails : participants,
      amount
    });

    const savedBooking = await bookingData.save();
    
    return new Response(JSON.stringify({ 
      message: "Booking created successfully", 
      data: savedBooking 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}