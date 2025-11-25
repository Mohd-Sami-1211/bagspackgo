import { NextResponse } from "next/server";
import { UploadFile } from "src/app/api/completeCompanyDetails/route";
import { EventModel } from "src/models/eventModel";
import connectDB from "src/DB/DBConnection";
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    const eventId = formData.get('formData[eventId]')
    const companyId = String(formData.get('formData[companyId]'));
    const title = formData.get('formData[title]');
    const eventType = formData.get('formData[eventType]');
    const location = formData.get('formData[location]');
    const date = formData.get('formData[date]');
    const duration = parseInt(formData.get('formData[duration]'), 10);
    const totalSlots = parseInt(formData.get('formData[totalSlots]'), 10);
    const pricePerSlot = parseFloat(formData.get('formData[pricePerSlot]'));
    const destination = formData.get('formData[destination]');
    const destinationLink = formData.get('formData[destinationLink]');
    const about = formData.get('formData[about]');
    // Extract array fields using loop
    const highlights = [];
    for (let i = 0; formData.has(`formData[highlights][${i}]`); i++) {
      highlights.push(formData.get(`formData[highlights][${i}]`));
    }

    const whatsIncluded = [];
    for (let i = 0; formData.has(`formData[whatsIncluded][${i}]`); i++) {
      whatsIncluded.push(formData.get(`formData[whatsIncluded][${i}]`));
    }

    const whatToBring = [];
    for (let i = 0; formData.has(`formData[whatToBring][${i}]`); i++) {
      whatToBring.push(formData.get(`formData[whatToBring][${i}]`));
    }

    const restrictions = [];
    for (let i = 0; formData.has(`formData[restrictions][${i}]`); i++) {
      restrictions.push(formData.get(`formData[restrictions][${i}]`));
    }

    const itinerary = [];
    for (let i = 0; formData.has(`formData[itinerary][${i}]`); i++) {
      itinerary.push(formData.get(`formData[itinerary][${i}]`));
    }

    const faqs = [];
    for (let i = 0; formData.has(`formData[faqs][${i}][question]`); i++) {
      faqs.push({
        question: formData.get(`formData[faqs][${i}][question]`),
        answer: formData.get(`formData[faqs][${i}][answer]`),
      });
    }

    const pickupPoints = [];
    for (let i = 0; formData.has(`formData[pickupPoints][${i}][location]`); i++) {
      pickupPoints.push({
        location: formData.get(`formData[pickupPoints][${i}][location]`),
        link: formData.get(`formData[pickupPoints][${i}][link]`),
        time: formData.get(`formData[pickupPoints][${i}][time]`)
      });
    }
    // Extract the file for poster
    const posterFile = formData.get('formData[poster]');
    const uploadedFile = await UploadFile(posterFile);
      
    const companyEvent = new EventModel({
      companyId,
      eventId,
      title,
      eventType,
      location,
      date,
      duration,
      totalSlots,
      pricePerSlot,
      destination,
      destinationLink,
      about,
      highlights,
      whatsIncluded,
      faqs,
      whatToBring,
      restrictions,
      pickupPoints,
      itinerary,
      posterFile : uploadedFile.secure_url
    })
    const companyEventSaved = await companyEvent.save();
    console.log(companyEventSaved)

    return new Response(JSON.stringify({ message: "Data received", data : companyEventSaved }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
