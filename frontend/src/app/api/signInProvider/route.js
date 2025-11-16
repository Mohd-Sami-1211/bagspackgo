import { NextResponse } from "next/server";
import { serviceProviderModel } from "src/models/serviceProviderModel";
import connectDB from "src/DB/DBConnection";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
export async function POST(req) {
    await connectDB();
    const {email , password} = await req.json();
    const cookie = cookies();
    const tokenFromtheUser = (await cookie).get('accessToken')?.value;
    console.log(tokenFromtheUser);
    const RefreshtokenFromtheUser = (await cookie).get('refreshToken')?.value;
    console.log(RefreshtokenFromtheUser)
    const provider = await serviceProviderModel.findOne({email});
    if(!provider){
        return NextResponse.json({
        message : "User not Found",


        } , {status : 400})
    }
    const isPasswordValid = await provider.isPasswordValid(password);
    
    if(!isPasswordValid){
        return NextResponse.json({
            message : "Password is not valid",

        },{status : 400});

    }
    try {
           
        if(tokenFromtheUser){
            const providerInfo = jwt.verify(tokenFromtheUser , process.env.JWT_SECRET);
            console.log(providerInfo);
            if(!providerInfo){
                return NextResponse.json({
                message : "Unauthorized"
                } , {status : 400})
            }
            return NextResponse.json({data : provider});
        }
        else if(RefreshtokenFromtheUser){
            // new token from the refresh token
            
            const providerInfo = jwt.verify(RefreshtokenFromtheUser , process.env.REFRESH_TOKEN_SECRET);
            if(!providerInfo){
                return NextResponse.json({
                message : "Unauthorized"
                } , {status : 400})
            }
            const newRefreshToken =await  provider.generateRefreshToken();
            const newAccessToken = provider.generateAccessToken();
            const res = NextResponse.json({
                success: true,
                message: "New Token is Generated",
                data : provider
            });
            await provider.save();
            res.cookies.set("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60,
                path: "/"
            });
            
            res.cookies.set("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7*24 * 60 * 60,
                path: "/"
            });
            
            return res;



        }
        else{
            const accessToken = provider.generateAccessToken();
            const refreshToken = await provider.generateRefreshToken();
            const res = NextResponse.json({
                success: true,
                data : provider
            });

            res.cookies.set("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60,
                path: "/"
            });
            res.cookies.set("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60,
                path: "/"
            });

            return res;





        }
        
        
    } catch (error) {

        return NextResponse.json({
            success: false,
            message: "Session expired login again"
        }, { status: 401 });
        
    }

        
    
    

}