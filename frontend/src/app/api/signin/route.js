import { NextResponse } from "next/server";
import { UserModel } from "src/models/userModel";
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
    const user = await UserModel.findOne({email});
    if(!user){
        return NextResponse.json({
        message : "User not Found",


        } , {status : 400})
    }
    const isPasswordValid = await user.isPasswordValid(password);
    
    if(!isPasswordValid){
        return NextResponse.json({
            message : "Password is not valid",

        },{status : 400});

    }
    try {
           
        if(tokenFromtheUser){
            const userInfo = jwt.verify(tokenFromtheUser , process.env.JWT_SECRET);
            console.log(userInfo);
            if(!userInfo){
                return NextResponse.json({
                message : "Unauthorized"
                } , {status : 400})
            }
            return NextResponse.json({data : user});
        }
        else if(RefreshtokenFromtheUser){
            // new token from the refresh token
            
            const userInfo = jwt.verify(RefreshtokenFromtheUser , process.env.REFRESH_TOKEN_SECRET);
            if(!userInfo){
                return NextResponse.json({
                message : "Unauthorized"
                } , {status : 400})
            }
            const newRefreshToken =await  user.generateRefreshToken();
            const newAccessToken = user.generateAccessToken();
            const res = NextResponse.json({
                success: true,
                message: "New Token is Generated",
                data : user
            });
            await user.save();
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
            const accessToken = user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            const res = NextResponse.json({
                success: true,
                data : user
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