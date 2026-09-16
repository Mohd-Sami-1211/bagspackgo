import dbConnect from "@/lib/db";
import { Event } from "@/models/event.model";
import { Guide } from "@/models/guide.model";
import { GuideDetails } from "@/models/guidedetails.model";

import { isPublicProvider } from "@/lib/seo";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Shared by the public API and the server-rendered Events landing page.
export async function getPublicEventList(searchParams) {
    await dbConnect();

    const tab = searchParams.get("tab") || "upcoming"; // 'upcoming' | 'past'
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 12));
    const skip = (page - 1) * limit;
    const includeFacets = searchParams.get("includeFacets") === "true";

    const now = new Date();

    // ── Build base query ──────────────────────────────────────────────────
    const [accounts, providerDetails] = await Promise.all([
        Guide.find({ isActive: { $ne: false } })
            .select("_id username applicationStatus isActive").lean(),
        GuideDetails.find({ "pausedServices.event": { $ne: true } })
            .select("guide companyname status pausedServices").lean(),
    ]);
    const accountsById = new Map(accounts.map((account) => [String(account._id), account]));
    const eligibleProviders = providerDetails.filter((details) =>
        isPublicProvider(accountsById.get(String(details.guide)), details)
    );

    const query = {
        status: "published",
        visibility: { $ne: "private" },
        guide: { $in: eligibleProviders.map((details) => details.guide) },
    };

    // Upcoming vs Past
    if (tab === "past") {
        query.date = { $lt: now };
    } else {
        query.date = { $gte: now };
    }

    if (location) {
        query.location = { $regex: escapeRegExp(location.trim()), $options: "i" };
    }
    if (type) {
        query.eventType = { $regex: escapeRegExp(type.trim()), $options: "i" };
    }
    if (search) {
        const safeSearch = escapeRegExp(search.trim());
        query.$or = [
            { title: { $regex: safeSearch, $options: "i" } },
            { destination: { $regex: safeSearch, $options: "i" } },
            { eventType: { $regex: safeSearch, $options: "i" } },
            { location: { $regex: safeSearch, $options: "i" } },
        ];
    }

    // ── Build sort ────────────────────────────────────────────────────────
    let sortObj = tab === "past" ? { date: -1, _id: -1 } : { date: 1, _id: 1 };
    if (sort === "price_asc") sortObj = { pricePerSlot: 1, date: 1, _id: 1 };
    if (sort === "price_desc") sortObj = { pricePerSlot: -1, date: 1, _id: 1 };
    if (sort === "date_asc") sortObj = { date: 1, _id: 1 };
    if (sort === "date_desc") sortObj = { date: -1, _id: -1 };
    if (sort === "rating") sortObj = { rating: -1, date: 1, _id: 1 };

    // ── Fetch events — lightweight fields only (detail fields excluded) ───
    // 'about', 'photographs', 'faqs', 'highlights', 'whatsIncluded/Excluded',
    // 'whatToBring', 'restrictions', 'pickupPoints', 'itinerary' are NOT
    // fetched here — they are only loaded on the detail page.
    const projection =
        "title date duration pricePerSlot eventType rating bookedSlots reservedSlots totalSlots " +
        "location destination poster guide destinationLink createdAt status";

    const [eventsList, total] = await Promise.all([
        Event.find(query)
            .select(projection)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean(),
        Event.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const listedGuideIds = [...new Set(eventsList.map((event) => String(event.guide)))];
    const logos = listedGuideIds.length
        ? await GuideDetails.find({ guide: { $in: listedGuideIds } }).select("guide logo").lean()
        : [];
    const logosByGuide = new Map(logos.map((details) => [String(details.guide), details.logo]));

    // ── Build guide/company name map ──────────────────────────────────────
    const guideMap = {};
    eligibleProviders.forEach((details) => {
        const id = String(details.guide);
        guideMap[id] = {
            name: accountsById.get(id).username,
            companyName: details.companyname,
            logo: logosByGuide.get(id),
        };
    });

    let allOrganizers = [];
    if (includeFacets) {
        allOrganizers = [
            ...new Set(
                eligibleProviders
                    .map((details) => details.companyname)
                    .filter(Boolean)
            ),
        ].map((name) => ({ id: name, name }));
    }

    // ── Shape response ────────────────────────────────────────────────────
    const events = eventsList.map((e) => {
        const guideInfo = guideMap[e.guide.toString()] || {};
        return {
            id: e._id.toString(),
            name: e.title,
            date: e.date,
            duration: `${e.duration} day${e.duration > 1 ? "s" : ""}`,
            price: e.pricePerSlot,
            type: e.eventType,
            rating: e.rating,
            bookings: e.bookedSlots,
            slotsLeft: e.totalSlots - (e.bookedSlots || 0) - (e.reservedSlots || 0),
            totalSlots: e.totalSlots,
            destinationId: e.location,
            destination: e.destination,
            image: /^data:image\//i.test(e.poster?.trim() || '') ? `/api/events/${e._id}/poster` : e.poster || null,
            guideName: guideInfo.companyName || guideInfo.name || "Local Guide",
            guideLogo: /^data:image\//i.test(guideInfo.logo?.trim() || '') ? `/api/events/${e._id}/guide-logo` : guideInfo.logo || null,
            guideId: e.guide.toString(),
            destinationLink: e.destinationLink,
            createdAt: e.createdAt,
            isPast: tab === "past",
            _source: "db",
        };
    });

    return {
        success: true,
        total,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        tab,
        organizers: allOrganizers,
        events,
    };
}
