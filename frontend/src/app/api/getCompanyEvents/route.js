import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { EventModel } from "src/models/eventModel";
export async function GET(req){
    await connectDB();
    const companyId = req.nextUrl.searchParams.get('companyId');
    console.log(companyId);
    const companyEvents = await EventModel.find({companyId});
    console.log(companyEvents);
    if(!companyEvents){
        return NextResponse.json({
            message : "No Events"
        })
    }
    return NextResponse.json({
        message : "Events Found",
        data : companyEvents
    })
}