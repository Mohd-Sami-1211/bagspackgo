import { NextResponse } from "next/server";
import connectDB from "src/DB/DBConnection";
import { EventModel } from "src/models/eventModel";
import { providerCompanyModel } from "src/models/providerCompanyModel";
import { serviceProviderModel } from "src/models/serviceProviderModel";
export async function GET(req){
    try {
        await connectDB();
        
        const eventId = req.nextUrl.searchParams.get('eventId');
        const companyId = req.nextUrl.searchParams.get('companyId');
        
        let query = {};
        if (eventId) {
            query.eventId = eventId;
        } else if (companyId) {
            query.companyId = companyId;
        }
    
        let result;
        let message;
    
        // Use findOne for single event, find for multiple events
        if (eventId) {
            result = await EventModel.findOne(query); // This returns a single object
            message = result ? "Event Found" : "Event not found";
        } else {
            result = await EventModel.find(query)
                .populate({
                    path: 'companyId',
                    model : 'providerCompanyInfo',
                    select: 'companyName', // ONLY company name
                    populate: {
                        path: 'providerId',
                        model: 'ServiceProvider',
                        select: 'name email phoneNumber'
                    }
                });
            message = result.length > 0 ? "Events Found" : "No events found";
        }
    
        if (!result || (Array.isArray(result) && result.length === 0)) {
            return NextResponse.json({
                message: message,
                data: null
            }, { status: 404 });
        }
    
        return NextResponse.json({
            message: message,
            data: result
        });
    } catch (error) {
        console.error('Error Getting Events :', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
        
    }
}