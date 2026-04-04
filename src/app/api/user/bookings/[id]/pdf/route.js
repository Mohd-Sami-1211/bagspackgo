import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import mongoose from 'mongoose';

function hexColor(h) {
    const r = parseInt(h.slice(1, 3), 16) / 255;
    const g = parseInt(h.slice(3, 5), 16) / 255;
    const b = parseInt(h.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        await dbConnect();

        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const booking = await Booking.findOne({ _id: id })
            .populate({
                path: 'event',
                populate: { path: 'guide', select: 'companyName username name email phone' }
            })
            .lean();

        if (!booking) {
            return new Response(`Booking not found for id: ${id}`, { status: 404 });
        }

        const event = booking.event;
        const guideDetails = await GuideDetails.findOne({ guide: event?.guide?._id })
            .select('companyname companymobile companyemail')
            .lean();

        const providerName = guideDetails?.companyname || event?.guide?.companyName || event?.guide?.username || 'Local Organizer';
        const providerPhone = guideDetails?.companymobile || event?.guide?.phone || '';
        const providerEmail = guideDetails?.companyemail || event?.guide?.email || '';

        const eventDate = event?.date || booking.bookingDate;
        const formattedDate = eventDate
            ? new Date(eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBD';
        
        const eventName = event?.title || 'Event Booking';
        const dest = event?.destination || event?.location || 'TBD';
        const ref = id?.toString()?.substring(0, 8)?.toUpperCase() || 'BPG-EVT';
        const travelers = booking.participants || [];

        // ── PDF Setup ─────────────────────────────────────────────────
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(PageSizes.A4);
        const W = page.getWidth();
        const H = page.getHeight();

        const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Colors
        const C_EMERALD      = hexColor('#059669');
        const C_EMERALD_DARK = hexColor('#065f46');
        const C_EMERALD_50   = hexColor('#ecfdf5');
        const C_GRAY_900     = hexColor('#111827');
        const C_GRAY_500     = hexColor('#6b7280');
        const C_GRAY_400     = hexColor('#9ca3af');
        const C_GRAY_200     = hexColor('#e5e7eb');
        const C_GRAY_50      = hexColor('#f9fafb');
        const C_WHITE        = rgb(1, 1, 1);

        const MARGIN  = 32;
        const BORDER  = 3;
        const CARD_X  = MARGIN;
        const CARD_W  = W - MARGIN * 2;

        const txt = (text, { x, y, size, font, color, maxWidth }) => {
            const str = String(text ?? '');
            const clamped = maxWidth ? str.substring(0, Math.floor(maxWidth / (size * 0.55))) : str;
            page.drawText(clamped, { x, y: H - y, size, font: font ?? regular, color: color ?? C_GRAY_500 });
        };

        const rect = (x, y, w, h, { color, borderColor, borderWidth } = {}) => {
            page.drawRectangle({ x, y: H - y - h, width: w, height: h, color, borderColor, borderWidth });
        };

        const line = (x1, y1, x2, y2, { color, thickness, dashArray } = {}) => {
            page.drawLine({
                start: { x: x1, y: H - y1 },
                end:   { x: x2, y: H - y2 },
                color: color ?? C_GRAY_200,
                thickness: thickness ?? 0.5,
                dashArray,
            });
        };

        const circle = (cx, cy, r, { color, borderColor, borderWidth } = {}) => {
            page.drawEllipse({ x: cx, y: H - cy, xScale: r, yScale: r, color, borderColor, borderWidth });
        };

        // Outer border
        rect(CARD_X, MARGIN, CARD_W, H - MARGIN * 2, { color: C_WHITE, borderColor: C_EMERALD, borderWidth: BORDER });

        // Header
        let topY = MARGIN + 28;
        txt('bagspackgo', { x: CARD_X + 20, y: topY, size: 18, font: bold, color: C_EMERALD });
        topY += 20;
        txt('Official Event Entry Pass', { x: CARD_X + 20, y: topY, size: 9, font: regular, color: C_GRAY_500 });

        const REF_X = CARD_X + CARD_W - 200;
        txt('BOOKING REFERENCE', { x: REF_X, y: MARGIN + 28, size: 7, font: bold, color: C_GRAY_400 });
        txt(ref, { x: REF_X, y: MARGIN + 42, size: 18, font: bold, color: C_GRAY_900 });
        
        const BADGE_W = 150; const BADGE_Y = MARGIN + 62;
        rect(BADGE_X || REF_X, BADGE_Y, BADGE_W, 18, { color: C_EMERALD_50 });
        txt('ENTRY PERMITTED', { x: (BADGE_X || REF_X) + 12, y: BADGE_Y + 5, size: 7.5, font: bold, color: C_EMERALD });

        topY = MARGIN + 88;
        line(CARD_X + 16, topY, CARD_X + CARD_W - 16, topY);
        topY += 16;

        // Event Details
        const LEFT_W = CARD_W * 0.54;
        txt('EVENT NAME', { x: CARD_X + 20, y: topY, size: 7, font: bold, color: C_GRAY_400 });
        topY += 14;
        txt(eventName.substring(0, 40), { x: CARD_X + 20, y: topY, size: 16, font: bold, color: C_EMERALD_DARK });
        topY += 22;
        txt(`  ${dest}`, { x: CARD_X + 20, y: topY, size: 10, font: regular, color: C_GRAY_500 });

        const PROV_X = CARD_X + LEFT_W + 8;
        const PROV_W = CARD_W - LEFT_W - 28;
        const PROV_BOX_Y = MARGIN + 104;
        rect(PROV_X, PROV_BOX_Y, 4, 80, { color: C_EMERALD });
        rect(PROV_X + 4, PROV_BOX_Y, PROV_W, 80, { color: C_EMERALD_50 });
        txt('ORGANIZED BY', { x: PROV_X + 14, y: PROV_BOX_Y + 12, size: 7, font: bold, color: C_EMERALD });
        txt(providerName.substring(0, 25), { x: PROV_X + 14, y: PROV_BOX_Y + 26, size: 12, font: bold, color: C_GRAY_900 });
        if (providerPhone) txt(`Ph: ${providerPhone}`, { x: PROV_X + 14, y: PROV_BOX_Y + 44, size: 8 });
        if (providerEmail) txt(`Em: ${providerEmail}`, { x: PROV_X + 14, y: PROV_BOX_Y + 56, size: 8 });

        topY = MARGIN + 200;
        const DIVIDER_Y = topY + 8;
        circle(CARD_X, DIVIDER_Y, 10, { color: hexColor('#F0FDF4'), borderColor: C_EMERALD, borderWidth: 3 });
        circle(CARD_X + CARD_W, DIVIDER_Y, 10, { color: hexColor('#F0FDF4'), borderColor: C_EMERALD, borderWidth: 3 });
        line(CARD_X + 12, DIVIDER_Y, CARD_X + CARD_W - 12, DIVIDER_Y, { dashArray: [5, 5] });
        topY = DIVIDER_Y + 18;

        const DETAILS_BOX_W = CARD_W - 140;
        rect(CARD_X + 16, topY, DETAILS_BOX_W, 58, { color: C_GRAY_50, borderColor: C_GRAY_200, borderWidth: 0.5 });
        const details = [
            { label: 'EVENT DATE', value: formattedDate },
            { label: 'REPORTING', value: booking.selectedPickup?.time || 'TBD' },
            { label: 'SLOTS', value: `${booking.slots} Pax` },
            { label: 'TOTAL PAID', value: `Rs.${Number(booking.amountPaid).toLocaleString('en-IN')}` },
        ];
        const colW = DETAILS_BOX_W / 4;
        details.forEach((d, i) => {
            const cx = CARD_X + 16 + i * colW + 10;
            txt(d.label, { x: cx, y: topY + 14, size: 6.5, font: bold, color: C_GRAY_400 });
            txt(d.value, { x: cx, y: topY + 28, size: 10, font: bold, color: i === 3 ? C_EMERALD : C_GRAY_900 });
        });

        // Placeholder QR
        const QR_X = CARD_X + 16 + DETAILS_BOX_W + 8;
        rect(QR_X, topY, 100, 58, { color: C_WHITE, borderColor: C_EMERALD, borderWidth: 1 });
        txt('VERIFY AT ENTRY', { x: QR_X + 10, y: topY + 12, size: 6, font: bold, color: C_EMERALD });
        rect(QR_X + 32, topY + 16, 36, 36, { color: C_GRAY_900 });

        topY += 74;
        txt('PASSENGER MANIFEST', { x: CARD_X + 16, y: topY, size: 7, font: bold, color: C_GRAY_400 });
        topY += 12;

        const pCols = 2;
        const passCellW = (CARD_W - 40) / pCols;
        travelers.forEach((t, idx) => {
            const col = idx % pCols;
            const row = Math.floor(idx / pCols);
            const px = CARD_X + 16 + col * (passCellW + 8);
            const py = topY + row * 36;
            rect(px, py, passCellW, 32, { color: C_WHITE, borderColor: C_GRAY_200, borderWidth: 0.5 });
            txt(t.name || 'Unnamed', { x: px + 8, y: py + 12, size: 9, font: bold, color: C_GRAY_900 });
            txt(`${t.gender} | ${t.age} yrs | ${t.idType}: ${t.idNumber}`, { x: px + 8, y: py + 24, size: 7 });
        });

        const pdfBytes = await pdfDoc.save();
        return new Response(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="BPG_Event_Pass_${ref}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF Error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
