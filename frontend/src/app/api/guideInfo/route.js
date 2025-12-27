import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { EventModel } from "src/models/eventModel";
import { providerCompanyModel } from "src/models/providerCompanyModel";
import { serviceProviderModel } from "src/models/serviceProviderModel";

export async function GET(req) {
    try {
        await connectDB();
        
        const eventId = req.nextUrl.searchParams.get('eventId');
        
        if (!eventId) {
            return NextResponse.json({
                success: false,
                message: "Event ID is required"
            }, { status: 400 });
        }

        // Step 1: Find the event by eventId
        const event = await EventModel.findOne({ eventId: eventId }).select('companyId');
        
        if (!event) {
            return NextResponse.json({
                success: false,
                message: "Event not found"
            }, { status: 404 });
        }

        // Step 2: Find the company using companyId from event
        const company = await providerCompanyModel.findOne({ _id : event.companyId }).select('providerId');
        
        if (!company) {
            return NextResponse.json({
                success: false,
                message: "Company not found for this event"
            }, { status: 404 });
        }

        // Step 3: Find the service provider (guide) using providerId from company
        const guide = await serviceProviderModel.findOne({ _id : company.providerId });
        
        if (!guide) {
            return NextResponse.json({
                success: false,
                message: "Service provider not found for this company"
            }, { status: 404 });
        }

        // Return both event and guide data
        return NextResponse.json({
            success: true,
            message: "Event and guide details found",
            data: guide
        });

    } catch (error) {
        console.error("Error in GET guide by eventId:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}