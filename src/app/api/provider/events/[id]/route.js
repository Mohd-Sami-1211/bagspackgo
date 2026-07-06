import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Guide } from "@/models/guide.model";
import { Event } from "@/models/event.model";
import { Booking } from "@/models/booking.model";
import { sanitizeString } from "@/lib/sanitize";

/**
 * GET /api/provider/events/[id]
 * Fetch a single event by ID (must belong to the authenticated provider).
 */
export async function GET(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findOne({
            _id: id,
            guide: user.userId,
        }).lean();

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        const bookings = await Booking.find({ event: id, status: { $in: ['confirmed', 'completed'] } }).lean();

        let guests = [];
        bookings.forEach(booking => {
            if (booking.participants && Array.isArray(booking.participants)) {
                booking.participants.forEach((p, pIdx) => {
                    // Filter custom form responses for this specific participant (by slotIndex)
                    const allResponses = booking.customFormResponses || [];
                    const participantResponses = allResponses.filter(r => r.slotIndex === pIdx);
                    
                    let guestName = p.name;
                    if (!guestName && participantResponses.length > 0) {
                        const nameField = participantResponses.find(r => r.fieldTitle?.toLowerCase().includes('name'));
                        if (nameField) guestName = nameField.value;
                    }
                    
                    let guestMobile = p.phone || booking.contactDetails?.phone;
                    if (!p.phone && participantResponses.length > 0) {
                        const phoneField = participantResponses.find(r => r.fieldTitle?.toLowerCase().includes('phone') || r.fieldTitle?.toLowerCase().includes('mobile'));
                        if (phoneField) guestMobile = phoneField.value;
                    }

                    let guestAge = p.age;
                    if (!guestAge && participantResponses.length > 0) {
                        const ageField = participantResponses.find(r => r.fieldTitle?.toLowerCase() === 'age');
                        if (ageField) guestAge = ageField.value;
                    }

                    let guestGender = p.gender;
                    if (!guestGender && participantResponses.length > 0) {
                        const genderField = participantResponses.find(r => r.fieldTitle?.toLowerCase() === 'gender');
                        if (genderField) guestGender = genderField.value;
                    }

                    guests.push({
                        id: p._id?.toString() || Math.random().toString(),
                        name: guestName || 'Guest',
                        email: p.email || booking.contactDetails?.email,
                        mobile: guestMobile,
                        age: guestAge,
                        gender: guestGender,
                        nationality: p.country || '',
                        idProofType: p.idType,
                        idProofNumber: p.idNumber,
                        idProofUrl: p.idProofUrl || '',
                        medicalCondition: p.medicalCondition || '',
                        emergencyContactName: p.emergencyContactName,
                        emergencyContactPhone: p.emergencyContactPhone,
                        emergencyContactRelation: p.emergencyContactRelation,
                        address: p.address,
                        country: p.country,
                        bookingDate: booking.createdAt,
                        bookingRef: booking._id.toString().substring(0, 8).toUpperCase(),
                        passCode: p.passCode,
                        checkedIn: p.checkedIn || false,
                        selectedPickup: booking.selectedPickup || null,
                        customFormResponses: participantResponses,
                        extraChargesTotal: booking.extraChargesTotal || 0,
                    });
                });
            }
        });

        return NextResponse.json({
            success: true,
            event: {
                id: event._id.toString(),
                title: event.title,
                eventType: event.eventType,
                location: event.location,
                date: event.date,
                duration: event.duration,
                totalSlots: event.totalSlots,
                bookedSlots: event.bookedSlots,
                pricePerSlot: event.pricePerSlot,
                destination: event.destination,
                destinationLink: event.destinationLink,
                about: event.about,
                highlights: event.highlights,
                whatsIncluded: event.whatsIncluded,
                whatsExcluded: event.whatsExcluded,
                faqs: event.faqs,
                whatToBring: event.whatToBring,
                restrictions: event.restrictions,
                pickupPoints: event.pickupPoints,
                itinerary: event.itinerary,
                photographs: event.photographs,
                poster: event.poster,
                status: event.status,
                rating: event.rating,
                reviewCount: event.reviewCount,
                deleteRequest: event.deleteRequest || null,
                visibility: event.visibility || 'public',
                applicationFormType: event.applicationFormType || 'default',
                customFormFields: event.customFormFields || [],
                termsAndConditions: event.termsAndConditions || [],
                createdAt: event.createdAt,
                updatedAt: event.updatedAt,
            },
            guests
        });
    } catch (error) {
        console.error("Get Event Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/provider/events/[id]
 * Update an event (only allowed for draft/upcoming events).
 */
export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findOne({
            _id: id,
            guide: user.userId,
        });

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Only drafts can be fully edited, but we allow updating totalSlots for published events
        if (event.status !== "draft") {
            const keys = Object.keys(body).filter(k => k !== 'action');
            const onlyUpdatingSlots = keys.length === 1 && keys[0] === 'totalSlots';
            
            if (!onlyUpdatingSlots) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Only draft events can be fully edited. You can only update slots for published events.",
                    },
                    { status: 403 }
                );
            }
        }

        // Update allowed fields
        const updatableFields = [
            "title", "eventType", "location", "date", "duration",
            "totalSlots", "pricePerSlot", "destination", "destinationLink",
            "about", "poster", "visibility", "applicationFormType", "includePickup",
        ];

        for (const field of updatableFields) {
            if (body[field] !== undefined) {
                if (typeof body[field] === "string") {
                    event[field] = sanitizeString(body[field]);
                } else {
                    event[field] = body[field];
                }
            }
        }

        // Update array fields
        const arrayFields = ["highlights", "whatsIncluded", "whatsExcluded", "whatToBring", "restrictions", "itinerary", "photographs", "termsAndConditions"];
        for (const field of arrayFields) {
            if (Array.isArray(body[field])) {
                event[field] = body[field]
                    .filter((item) => typeof item === "string" && item.trim())
                    .map(sanitizeString);
            }
        }

        // Update sponsors
        if (Array.isArray(body.sponsors)) {
            event.sponsors = body.sponsors
                .filter((s) => s && typeof s.name === "string" && s.name.trim())
                .map((s) => ({
                    name: sanitizeString(s.name),
                    image: s.image || "",
                    description: sanitizeString(s.description || ""),
                    website: sanitizeString(s.website || ""),
                    socialMedia: {
                        instagram: sanitizeString(s.socialMedia?.instagram || ""),
                        facebook: sanitizeString(s.socialMedia?.facebook || ""),
                        twitter: sanitizeString(s.socialMedia?.twitter || ""),
                        youtube: sanitizeString(s.socialMedia?.youtube || ""),
                        linkedin: sanitizeString(s.socialMedia?.linkedin || ""),
                    },
                    links: (s.links || [])
                        .filter((l) => l && l.label?.trim() && l.url?.trim())
                        .map((l) => ({
                            label: sanitizeString(l.label),
                            url: sanitizeString(l.url),
                        })),
                }));
            event.markModified('sponsors');
        }

        // Update custom form fields (stored as-is, complex nested structure)
        if (Array.isArray(body.customFormFields)) {
            console.log("RECEIVED BODY customFormFields:", JSON.stringify(body.customFormFields, null, 2));
            event.customFormFields = body.customFormFields;
            event.markModified('customFormFields');
            console.log("EVENT SET TO customFormFields:", JSON.stringify(event.customFormFields, null, 2));
        }

        // Update FAQs
        if (Array.isArray(body.faqs)) {
            event.faqs = body.faqs
                .filter((f) => f && f.question?.trim() && f.answer?.trim())
                .map((f) => ({
                    question: sanitizeString(f.question),
                    answer: sanitizeString(f.answer),
                }));
        }

        // Update pickup points
        if (Array.isArray(body.pickupPoints)) {
            event.pickupPoints = body.pickupPoints
                .filter((p) => p && p.location?.trim())
                .map((p) => ({
                    location: sanitizeString(p.location),
                    link: sanitizeString(p.link || ""),
                    time: p.time || "",
                }));
        }

        // Validate date if changed
        if (body.date) {
            const newDate = new Date(body.date);
            if (isNaN(newDate.getTime()) || newDate < new Date()) {
                return NextResponse.json(
                    { success: false, message: "Event date must be a valid future date" },
                    { status: 400 }
                );
            }
            event.date = newDate;
        }

        // If publishing a draft, update the status
        if (body.action === "publish") {
            event.status = "published";
        }

        await event.save();

        return NextResponse.json({
            success: true,
            message: body.action === "publish" ? "Event published successfully!" : "Event updated successfully!",
            event: { id: event._id, title: event.title, status: event.status },
        });
    } catch (error) {
        console.error("Update Event Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/provider/events/[id]
 * Submit a deletion request — admin must approve before actual deletion.
 */
export async function DELETE(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "provider") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const event = await Event.findOne({
            _id: id,
            guide: user.userId,
        });

        if (!event) {
            return NextResponse.json(
                { success: false, message: "Event not found" },
                { status: 404 }
            );
        }

        // Check if a delete request is already pending
        if (event.deleteRequest?.requested && event.deleteRequest?.adminStatus === "pending") {
            return NextResponse.json(
                { success: false, message: "A deletion request for this event is already pending admin review." },
                { status: 409 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const reason = (body.reason || "").trim();

        // Mark the delete request
        event.deleteRequest = {
            requested: true,
            requestedAt: new Date(),
            reason,
            adminStatus: "pending",
            adminNotes: "",
            resolvedAt: null,
        };

        await event.save();

        return NextResponse.json({
            success: true,
            message: "Deletion request submitted successfully. It will be reviewed by the admin.",
        });
    } catch (error) {
        console.error("Delete Request Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
