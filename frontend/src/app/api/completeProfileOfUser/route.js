import { NextResponse } from "next/server";
import { UserModel } from "src/models/userModel";
import connectDB from "src/DB/DBConnection";
import jwt from "jsonwebtoken"
export async function POST(req) {
    try {
        await connectDB();
        const {email , phoneNumber , name , password , dob , role} = await req.json();
        const newUser = new UserModel({
            name ,
            email,
            phoneNumber,
            dob,
            password,
            role
    
        })

        // Write the Refresh Token and Access Token Logic here 
        const refreshTokenForTheUser = await newUser.generateRefreshToken();
        const accessToken = newUser.generateAccessToken();
        const userinfo = await newUser.save();
        const res =  NextResponse.json({
            message : "User Created",
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