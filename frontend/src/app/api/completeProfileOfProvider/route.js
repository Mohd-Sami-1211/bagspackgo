import { NextResponse } from "next/server";
import { serviceProviderModel } from "src/models/serviceProviderModel";
import connectDB from "src/DB/DBConnection";
export async function POST(req) {
    try {
        await connectDB();
        const {email , phoneNumber , name , password , role} = await req.json();
        const newProvider = new serviceProviderModel({
            name ,
            email,
            phoneNumber,
            password,
            role
    
        })

        // Write the Refresh Token and Access Token Logic here 
        const refreshTokenForTheUser = await newProvider.generateRefreshToken();
        const accessToken = newProvider.generateAccessToken();
        const userinfo = await newProvider.save();
        const res =  NextResponse.json({
            message : "Provider Created",
            data : userinfo
        })
        res.cookies.set("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60,
          path: "/"
        });
        res.cookies.set("refreshToken", refreshTokenForTheUser, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60,
          path: "/"
        });
        return res;
    } catch (error) {
        console.error('Error Creating Profile :', error);
        return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        });
        
    }
    
    
}