import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { jsPDF } from 'jspdf';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        await dbConnect();

        const booking = await TripBooking.findById(id)
            .populate('package', 'name destination days')
            .populate('provider', 'username email phone')
            .lean();

        if (!booking) {
            return new Response("Booking not found", { status: 404 });
        }

        // Fetch company details for branding
        const guideDetails = await GuideDetails.findOne({ guide: booking.provider?._id }).select('companyname companymobile companyemail').lean();
        const providerName = guideDetails?.companyname || booking.provider?.username || "BagsPackGo Verified Partner";
        const providerPhone = guideDetails?.companymobile || booking.provider?.phone || "";
        const providerEmail = guideDetails?.companyemail || booking.provider?.email || "";

        const {
            bookingRef, packageName, destination, startDate, numPeople, totalAmount,
            personalDetails = {}, arrivalDeparture = {}, packageSnapshot = {}
        } = booking;

        const travelers = personalDetails?.personalDetails || [];
        const formattedDate = startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';

        // Generate PDF
        const doc = new jsPDF();
        
        // Brand Header
        doc.setFillColor(5, 150, 105);
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.text("BagsPackGo Travel Pass", 15, 22);
        doc.setFontSize(10);
        doc.text(`Official E-Ticket: ${bookingRef}`, 15, 32);
        
        // Booking ID & QR Area Placeholder
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(145, 10, 50, 25, 3, 3, 'F');
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(8);
        doc.text("CONFIRMED", 160, 20);
        doc.setFontSize(10);
        doc.text(bookingRef, 155, 28);

        // Trip Summary
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Trip Summary", 15, 60);
        doc.setLineWidth(0.5);
        doc.line(15, 63, 195, 63);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Selected Package:", 15, 75);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(packageName || packageSnapshot?.name || "Trip Package", 15, 82);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Destination:", 15, 95);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(destination || packageSnapshot?.destination || "Various Locations", 15, 102);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Travel Date:", 110, 75);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(formattedDate, 110, 82);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Total Passengers:", 110, 95);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(`${numPeople} Pax`, 110, 102);

        // Provider Info
        doc.setFillColor(240, 253, 244);
        doc.rect(15, 115, 180, 25, 'F');
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(9);
        doc.text("Managed By:", 20, 122);
        doc.setFontSize(12);
        doc.text(providerName, 20, 130);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Contact: ${providerPhone} | Email: ${providerEmail}`, 20, 136);

        // Passenger List
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Passenger Manifest", 15, 160);
        doc.setLineWidth(0.2);
        doc.line(15, 163, 195, 163);

        let yPos = 175;
        doc.setFontSize(9);
        travelers.forEach((t, idx) => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            doc.setTextColor(100, 100, 100);
            doc.text(`${idx + 1}.`, 15, yPos);
            doc.setTextColor(0, 0, 0);
            doc.text(t.name || "Unnamed Traveler", 25, yPos);
            doc.setTextColor(100, 100, 100);
            doc.text(`${t.idType || "ID"}: ${t.idNumber || "N/A"}`, 110, yPos);
            yPos += 10;
        });

        // Pricing at bottom
        doc.setFontSize(11);
        doc.setTextColor(5, 150, 105);
        doc.text(`Total Amount Paid: Rs. ${Number(totalAmount).toLocaleString('en-IN')}`, 15, 270);
        
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("© BagsPackGo - Just pack your bags, we've got the rest.", 15, 285);
        doc.text("This is an electronically generated document and does not require a physical signature.", 15, 290);

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="BagsPackGo_Pass_${bookingRef}.pdf"`,
            },
        });

    } catch (error) {
        console.error("PDF API Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
