import { NextResponse } from "next/server";
import { UserModel } from "src/models/userModel";
import connectDB from "src/DB/DBConnection";
export async function POST(req) {
    try {
        await connectDB();
        const {email , phoneNumber , name , password , dob} = await req.json();
        const newUser = new UserModel({
            name ,
            email,
            phoneNumber,
            dob,
            password
    
        })
        const res = await newUser.save();
        console.log(res);
        return NextResponse.json({
            message : res
        })
    } catch (error) {
        console.error('Error Creating Profile :', error);
        return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        });
        
    }
    
    
}