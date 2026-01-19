import { NextResponse } from "next/server";
import { EventModel } from "src/models/eventModel";

export async function DELETE(req) {
    const eventId = req.nextUrl.searchParams.get('eventId');
    if (!eventId) {
      throw new Error('Event Id is not found');
    }
    const event = await EventModel.findOne({eventId});
    if(!event){
      throw new Error('Event Not found')
    }
    const deleteEvent = await EventModel.findOneAndDelete({eventId});
    console.log(deleteEvent);
    return NextResponse.json({
      message : "Event is Deleted"
    })
}