import nodemailer from 'nodemailer';
import {userOTPModel} from "src/models/userOTPModel"
import connectDB from "src/DB/DBConnection";
export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Define email options
    const mailOptions = {
      from: `"BagsPackGo" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`,
    };
    const newOtp = new userOTPModel({
      email : email,
      otp : otp,
      expiresAt : new Date(Date.now() + 30*1000),
    })
    console.log(newOtp);
    await newOtp.save();

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    return new Response(JSON.stringify({ message: 'Success', messageId: info.messageId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } 
  catch (error) {
    console.error('Error sending mail:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
