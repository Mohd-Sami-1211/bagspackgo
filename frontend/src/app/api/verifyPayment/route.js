import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "src/DB/DBConnection";
import { bookingModel } from "src/models/bookingModel";

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_API_SECRET) // Ensure this env name matches yours
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      await connectDB();
      
      const updatedBooking = await bookingModel.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          status: "confirmed", 
          paymentId: razorpay_payment_id,
          paidAt: new Date() 
        },
        { new: true }
      );
      console.log("Updated Booking " , updatedBooking)

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        booking: updatedBooking
      }, { status: 200 });
      
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
