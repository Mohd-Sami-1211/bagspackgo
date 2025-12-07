import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserModel } from "src/models/userModel";
import { serviceProviderModel } from "src/models/serviceProviderModel";
import connectDB from "src/DB/DBConnection";

export async function GET(req) {
  await connectDB();
  
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    console.log(accessToken)
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Please Sign In" },
        { status: 401 }
      );
    }
    
    // Verify the token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("decoded " , decoded);
    let user;
    if (decoded.role === 'user') {
      user = await UserModel.findById(decoded.id).select('-password -refreshToken');
    } else if (decoded.role === 'provider') {
      user = await serviceProviderModel.findById(decoded.id).select('-password -refreshToken');
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, message : "Please Sign In"},
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { ...user.toObject(), role: decoded.role }
    });
    
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}