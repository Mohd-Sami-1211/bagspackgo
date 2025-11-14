import { NextRequest, NextResponse } from "next/server";
import {UserModel} from "src/models/userModel"
import connectDB from "src/DB/DBConnection";
import { signupByEmail } from "src/zodSchemas/signupByEmail";

export async function POST(req) {
    console.log("Inside Post function");
    const body = await req.json();
    const parseResult = signupByEmail.safeParse(body);
    console.log(parseResult)
    if(!parseResult.success){
        const errors = parseResult.error.issues;
        return NextResponse.json({errors},{status : 400})
    }
    else{
        await connectDB();
        const {email} = parseResult.data;
        const userCreated = new UserModel({
            email
        })
        const userInfo = await userCreated.save();
        return NextResponse.json({
            message : userInfo
        })
        

    }
}