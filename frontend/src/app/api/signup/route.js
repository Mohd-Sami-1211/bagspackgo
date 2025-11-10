import { NextRequest, NextResponse } from "next/server";
import {UserModel} from "../../../models/userModel"
import connectDB from "../../../DB/DBConnection";

export async function POST(req) {
    console.log("Inside Post function");
    const body = await req.json();
    console.log(body.email);
    return NextResponse.json({
        message : "Message sent"
    })
}