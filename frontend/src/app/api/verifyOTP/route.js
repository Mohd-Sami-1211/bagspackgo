import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { userOTPModel } from "src/models/userOTPModel";
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { otp, email } = body;

    const otpRecord = await userOTPModel.findOne({ email, otp });
    console.log(otpRecord);

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 200 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 200 });
    }

    if (otpRecord.verified) {
      return NextResponse.json({ error: 'OTP already used' }, { status: 200 });
    }
    
    otpRecord.verified = true;
    await otpRecord.save();


    return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
