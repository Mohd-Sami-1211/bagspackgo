import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    const event = await Event.findOne().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ 
        id: event._id, 
        status: event.status,
        applicationFormType: event.applicationFormType, 
        customFormFields: event.customFormFields 
    });
}
