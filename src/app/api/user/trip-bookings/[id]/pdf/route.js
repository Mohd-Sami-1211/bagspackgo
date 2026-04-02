import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
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
        const booking = await TripBooking.findOne(
            isObjectId ? { $or: [{ _id: id }, { bookingRef: id }] } : { bookingRef: id }
        )
            .populate('package', 'name destination days')
            .populate('provider', 'username email phone')
            .lean();

        if (!booking) {
            return new Response(`Booking not found for id: ${id}`, { status: 404 });
        }

        const guideDetails = await GuideDetails.findOne({ guide: booking.provider?._id })
            .select('companyname companymobile companyemail instagram facebook website')
            .lean();

        const providerName = guideDetails?.companyname || booking.provider?.username || 'BagsPackGo Verified Partner';
        const providerPhone = guideDetails?.companymobile || booking.provider?.phone || '';
        const providerEmail = guideDetails?.companyemail || booking.provider?.email || '';

        const { startDate, numPeople, totalAmount, personalDetails = {}, arrivalDeparture = {}, packageSnapshot = {} } = booking;
        const travelers = personalDetails?.personalDetails || [];
        const formattedDate = startDate
            ? new Date(startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBD';
        const pickupTime = arrivalDeparture?.pickup?.time || 'TBD';
        const pName = booking.package?.name || packageSnapshot?.name || 'Trip Package';
        const dest = booking.package?.destination || packageSnapshot?.destination || 'Various Locations';
        const ref = booking.bookingRef || id?.toString()?.substring(0, 8)?.toUpperCase() || 'BPG-REF';

        // ── PDF Setup ─────────────────────────────────────────────────
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(PageSizes.A4);
        const W = page.getWidth();   // 595.28
        const H = page.getHeight();  // 841.89

        const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Colors matching the HTML UI
        const C_EMERALD      = hexColor('#059669');
        const C_EMERALD_DARK = hexColor('#065f46');
        const C_EMERALD_LIGHT= hexColor('#d1fae5');
        const C_EMERALD_50   = hexColor('#ecfdf5');
        const C_GRAY_900     = hexColor('#111827');
        const C_GRAY_500     = hexColor('#6b7280');
        const C_GRAY_400     = hexColor('#9ca3af');
        const C_GRAY_200     = hexColor('#e5e7eb');
        const C_GRAY_100     = hexColor('#f3f4f6');
        const C_GRAY_50      = hexColor('#f9fafb');
        const C_WHITE        = rgb(1, 1, 1);

        // Layout constants — working top-down, converting to pdf-lib bottom-up
        const MARGIN  = 32;
        const BORDER  = 3;
        const CARD_X  = MARGIN;
        const CARD_W  = W - MARGIN * 2;

        // Helper: draw text at top-down y (converts to pdf-lib coords)
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

        // ── Outer ticket border ───────────────────────────────────────
        // White background card
        rect(CARD_X, MARGIN, CARD_W, H - MARGIN * 2, { color: C_WHITE, borderColor: C_EMERALD, borderWidth: BORDER });

        // ───────────── SECTION 1: TOP / HEADER ─────────────────────────
        let topY = MARGIN + 28; // current Y in top-down coords

        // BagsPackGo title left
        txt('BagsPackGo', { x: CARD_X + 20, y: topY, size: 18, font: bold, color: C_EMERALD });
        topY += 20;
        txt('Official E-Ticket & Travel Pass', { x: CARD_X + 20, y: topY, size: 9, font: regular, color: C_GRAY_500 });

        // Booking reference right side
        const REF_X = CARD_X + CARD_W - 200;
        txt('BOOKING REFERENCE', { x: REF_X, y: MARGIN + 28, size: 7, font: bold, color: C_GRAY_400, maxWidth: 190 });
        txt(ref, { x: REF_X, y: MARGIN + 42, size: 18, font: bold, color: C_GRAY_900, maxWidth: 190 });
        // Confirmed badge
        const BADGE_W = 150; const BADGE_H = 18; const BADGE_X = REF_X; const BADGE_Y = MARGIN + 62;
        rect(BADGE_X, BADGE_Y, BADGE_W, BADGE_H, { color: C_EMERALD_50, borderColor: C_EMERALD_LIGHT, borderWidth: 1 });
        txt('PAYMENT CONFIRMED', { x: BADGE_X + 12, y: BADGE_Y + 5, size: 7.5, font: bold, color: C_EMERALD, maxWidth: 130 });

        topY = MARGIN + 88;
        // Separator line
        line(CARD_X + 16, topY, CARD_X + CARD_W - 16, topY, { color: C_GRAY_200, thickness: 1 });
        topY += 16;

        // Package name LEFT column
        const LEFT_W = CARD_W * 0.54;
        txt('SELECTED PACKAGE', { x: CARD_X + 20, y: topY, size: 7, font: bold, color: C_GRAY_400 });
        topY += 14;
        // Multi-word wrap of package name
        const pNameShort = pName.length > 38 ? pName.substring(0, 38) + '...' : pName;
        txt(pNameShort, { x: CARD_X + 20, y: topY, size: 16, font: bold, color: C_EMERALD_DARK });
        topY += 22;
        txt(`  ${dest}`, { x: CARD_X + 20, y: topY, size: 10, font: regular, color: C_GRAY_500 });

        // Provider RIGHT column — green left-border box
        const PROV_X = CARD_X + LEFT_W + 8;
        const PROV_W = CARD_W - LEFT_W - 28;
        const PROV_BOX_Y = MARGIN + 104;
        const PROV_BOX_H = 80;
        // Left accent border
        rect(PROV_X, PROV_BOX_Y, 4, PROV_BOX_H, { color: C_EMERALD });
        // Light green background
        rect(PROV_X + 4, PROV_BOX_Y, PROV_W, PROV_BOX_H, { color: C_EMERALD_50 });
        txt('TRIP MANAGED BY', { x: PROV_X + 14, y: PROV_BOX_Y + 12, size: 7, font: bold, color: C_EMERALD, maxWidth: PROV_W - 20 });
        const pNameClamped = providerName.length > 26 ? providerName.substring(0, 26) + '.' : providerName;
        txt(pNameClamped, { x: PROV_X + 14, y: PROV_BOX_Y + 26, size: 12, font: bold, color: C_GRAY_900, maxWidth: PROV_W - 20 });
        if (providerPhone) txt(`Ph: ${providerPhone}`, { x: PROV_X + 14, y: PROV_BOX_Y + 44, size: 8, font: regular, color: C_GRAY_500, maxWidth: PROV_W - 20 });
        if (providerEmail) txt(`Em: ${providerEmail}`, { x: PROV_X + 14, y: PROV_BOX_Y + 56, size: 8, font: regular, color: C_GRAY_500, maxWidth: PROV_W - 20 });

        topY = MARGIN + 200;

        // ───────────── DASHED DIVIDER (ticket notch style) ─────────────
        const DIVIDER_Y = topY + 8;
        // Left circle notch
        circle(CARD_X, DIVIDER_Y, 10, { color: hexColor('#F0FDF4'), borderColor: C_EMERALD, borderWidth: BORDER });
        // Right circle notch
        circle(CARD_X + CARD_W, DIVIDER_Y, 10, { color: hexColor('#F0FDF4'), borderColor: C_EMERALD, borderWidth: BORDER });
        // Dashed line
        line(CARD_X + 12, DIVIDER_Y, CARD_X + CARD_W - 12, DIVIDER_Y, { color: hexColor('#6ee7b7'), thickness: 1.5, dashArray: [5, 5] });
        topY = DIVIDER_Y + 18;

        // ───────────── SECTION 2: KEY DETAILS ROW ─────────────────────
        const DETAILS_BOX_H = 58;
        const QR_BOX_W = 110;
        const DETAILS_BOX_W = CARD_W - QR_BOX_W - 28 - 8;

        // Gray details box
        rect(CARD_X + 16, topY, DETAILS_BOX_W, DETAILS_BOX_H, { color: C_GRAY_50, borderColor: C_GRAY_200, borderWidth: 0.5 });
        const details = [
            { label: 'TRAVEL DATE', value: formattedDate },
            { label: 'PICKUP TIME', value: pickupTime },
            { label: 'GUESTS', value: `${numPeople} Pax` },
            { label: 'TOTAL PAID', value: `Rs.${Number(totalAmount||0).toLocaleString('en-IN')}` },
        ];
        const colW4 = DETAILS_BOX_W / 4;
        details.forEach((d, i) => {
            const cx = CARD_X + 16 + i * colW4 + 10;
            txt(d.label, { x: cx, y: topY + 14, size: 6.5, font: bold, color: C_GRAY_400, maxWidth: colW4 - 8 });
            txt(d.value,  { x: cx, y: topY + 28, size: 10,  font: bold, color: i === 3 ? C_EMERALD : C_GRAY_900, maxWidth: colW4 - 8 });
        });

        // QR code box (white bordered)
        const QR_X = CARD_X + 16 + DETAILS_BOX_W + 8;
        rect(QR_X, topY, QR_BOX_W, DETAILS_BOX_H, { color: C_WHITE, borderColor: C_EMERALD_LIGHT, borderWidth: 1.5 });
        txt('SCAN FOR PASS', { x: QR_X + 10, y: topY + 12, size: 6, font: bold, color: C_EMERALD, maxWidth: QR_BOX_W - 12 });
        // Draw QR visual placeholder (actual QR generation requires additional library)
        // Draw a small grid checkered pattern as QR stand-in
        const QR_SZ = 36;
        const QR_PX = QR_X + (QR_BOX_W - QR_SZ) / 2;
        const QR_PY = topY + 16;
        rect(QR_PX, QR_PY, QR_SZ, QR_SZ, { color: C_GRAY_100, borderColor: C_GRAY_200, borderWidth: 0.5 });
        // mini squares to resemble QR
        const qCells = 5;
        const cellSz = QR_SZ / qCells;
        const qPattern = [[0,0],[1,0],[2,0],[3,0],[4,0],[0,1],[4,1],[0,2],[2,2],[4,2],[0,3],[4,3],[0,4],[1,4],[2,4],[3,4],[4,4]];
        qPattern.forEach(([cx, cy]) => {
            rect(QR_PX + cx * cellSz + 1, QR_PY + cy * cellSz + 1, cellSz - 2, cellSz - 2, { color: C_GRAY_900 });
        });
        txt('Scan to open', { x: QR_X + 8, y: topY + 54, size: 6, font: regular, color: C_GRAY_400, maxWidth: QR_BOX_W - 12 });

        topY += DETAILS_BOX_H + 16;

        // ───────────── SECTION 3: PASSENGER MANIFEST ──────────────────
        txt('PASSENGER MANIFEST', { x: CARD_X + 16, y: topY, size: 7, font: bold, color: C_GRAY_400 });
        topY += 4;
        line(CARD_X + 16, topY, CARD_X + CARD_W - 16, topY, { color: C_GRAY_100, thickness: 0.5 });
        topY += 8;

        const cols = 2;
        const passCellW = (CARD_W - 32 - 8) / cols;
        const ROW_H = 32;

        travelers.forEach((t, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const px = CARD_X + 16 + col * (passCellW + 8);
            const py = topY + row * (ROW_H + 4);

            rect(px, py, passCellW, ROW_H, { color: C_WHITE, borderColor: C_GRAY_200, borderWidth: 0.5 });

            const idType = t.idType?.label || (typeof t.idType === 'string' ? t.idType : 'ID');
            const gender = t.gender?.label || (typeof t.gender === 'string' ? t.gender : '-');
            const nameStr = (t.name || 'Unnamed').substring(0, 24);

            txt(nameStr, { x: px + 8, y: py + 12, size: 9, font: bold, color: C_GRAY_900, maxWidth: passCellW * 0.55 });
            txt(`${idType}: ${t.idNumber || 'N/A'}`, { x: px + 8, y: py + 24, size: 7.5, font: regular, color: C_GRAY_500, maxWidth: passCellW * 0.6 });
            txt(`${gender} | ${t.age || '-'} yrs`, { x: px + passCellW * 0.62, y: py + 12, size: 7.5, font: regular, color: C_GRAY_500, maxWidth: passCellW * 0.36 });
        });

        const totalRows = Math.ceil(travelers.length / cols);
        topY += totalRows * (ROW_H + 4) + 12;

        // ───────────── FOOTER NOTE ─────────────────────────────────────
        line(CARD_X + 16, topY, CARD_X + CARD_W - 16, topY, { color: C_GRAY_100, thickness: 0.5 });
        topY += 8;
        txt('Please present this pass alongside a valid government-issued photo ID at the time of pickup.', {
            x: CARD_X + 20, y: topY, size: 7.5, font: regular, color: C_GRAY_500, maxWidth: CARD_W - 40
        });
        topY += 12;
        txt('Thank you for choosing BagsPackGo!', { x: CARD_X + 20, y: topY, size: 8, font: bold, color: C_EMERALD });
        topY += 16;

        // ───────────── TERMS & CONDITIONS ──────────────────────────────
        const TERMS_Y = topY;
        rect(CARD_X, TERMS_Y, CARD_W, H - MARGIN - TERMS_Y, { color: C_GRAY_50 });
        line(CARD_X + 16, TERMS_Y, CARD_X + CARD_W - 16, TERMS_Y, { color: C_EMERALD_LIGHT, thickness: 1 });

        topY = TERMS_Y + 14;
        const halfW = (CARD_W - 48) / 2;

        txt('BAGSPACKGO POLICIES', { x: CARD_X + 20, y: topY, size: 8, font: bold, color: C_GRAY_900, maxWidth: halfW });
        txt('PROVIDER CONDITIONS', { x: CARD_X + 28 + halfW, y: topY, size: 8, font: bold, color: C_GRAY_900, maxWidth: halfW });
        topY += 14;

        const leftTerms = [
            'Booking confirmed subject to payment realization.',
            'Cancellations 7+ days before: 75% refund.',
            'Cancellations within 48 hrs: non-refundable.',
            'BagsPackGo is an aggregator; not liable for provider delays.',
        ];
        const rightTerms = [
            'All passengers must carry valid Photo ID.',
            'Provider may modify itinerary due to weather.',
            'Damage to property borne by the traveler.',
            'Alcohol & smoking may be prohibited in transit.',
        ];

        leftTerms.forEach((line_, i) => {
            txt(`\u2022 ${line_}`, { x: CARD_X + 20, y: topY + i * 13, size: 7.5, font: regular, color: C_GRAY_500, maxWidth: halfW - 8 });
        });
        rightTerms.forEach((line_, i) => {
            txt(`\u2022 ${line_}`, { x: CARD_X + 28 + halfW, y: topY + i * 13, size: 7.5, font: regular, color: C_GRAY_500, maxWidth: halfW - 8 });
        });

        // ── Serialize ────────────────────────────────────────────────
        const pdfBytes = await pdfDoc.save();

        return new Response(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="BPG_Trip_Pass_${ref}.pdf"`,
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('PDF API Error:', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
