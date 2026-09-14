import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Saved } from '@/models/saved.model';
import { Package } from '@/models/package.model';
import { Event } from '@/models/event.model';
import { OffBeat } from '@/models/offbeat.model';
import { GuideDetails } from '@/models/guidedetails.model';

export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10));
        const limit = Math.min(24, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '9', 10)));
        const requestedType = url.searchParams.get('type');
        const allowedTypes = new Set(['trip', 'trek', 'event', 'offbeat']);
        const query = { userId: user.userId };
        if (allowedTypes.has(requestedType)) query.itemType = requestedType;

        await dbConnect();
        const [savedRecords, total] = await Promise.all([
            Saved.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Saved.countDocuments(query),
        ]);

        const packageIds = savedRecords.filter((record) => ['trip', 'trek'].includes(record.itemType)).map((record) => record.itemId);
        const eventIds = savedRecords.filter((record) => record.itemType === 'event').map((record) => record.itemId);
        const offbeatIds = savedRecords.filter((record) => record.itemType === 'offbeat').map((record) => record.itemId);

        const [packages, events, offbeats] = await Promise.all([
            packageIds.length ? Package.find({ _id: { $in: packageIds } }).select({ title: 1, name: 1, destination: 1, label: 1, days: 1, packageCategory: 1, pricingTiers: 1, coverImage: 1, photos: { $slice: 1 }, images: { $slice: 1 } }).lean() : [],
            eventIds.length ? Event.find({ _id: { $in: eventIds } }).select({ title: 1, eventType: 1, destination: 1, date: 1, duration: 1, pricePerSlot: 1, poster: 1, location: 1, totalSlots: 1, bookedSlots: 1, reservedSlots: 1, guide: 1, photographs: { $slice: 1 } }).populate({ path: 'guide', select: 'username' }).lean() : [],
            offbeatIds.length ? OffBeat.find({ _id: { $in: offbeatIds } }).select({ title: 1, destination: 1, shortDescription: 1, region: 1, status: 1, coverPhoto: 1, photographs: { $slice: 1 } }).lean() : [],
        ]);

        const guideIds = events.map((event) => event.guide?._id).filter(Boolean);
        const guideDetails = guideIds.length ? await GuideDetails.find({ guide: { $in: guideIds } }).select('guide companyname').lean() : [];
        const companyByGuide = new Map(guideDetails.map((detail) => [detail.guide.toString(), detail.companyname]));
        const packageById = new Map(packages.map((item) => [item._id.toString(), item]));
        const eventById = new Map(events.map((item) => [item._id.toString(), item]));
        const offbeatById = new Map(offbeats.map((item) => [item._id.toString(), item]));

        const validItems = savedRecords.map((record) => {
            const itemId = record.itemId.toString();
            let itemData = ['trip', 'trek'].includes(record.itemType) ? packageById.get(itemId) : record.itemType === 'event' ? eventById.get(itemId) : offbeatById.get(itemId);
            if (!itemData) return null;
            if (record.itemType === 'event') {
                itemData = {
                    ...itemData,
                    name: itemData.title,
                    coverImage: itemData.poster || itemData.photographs?.[0] || '',
                    price: itemData.pricePerSlot,
                    organizer: companyByGuide.get(itemData.guide?._id?.toString()) || itemData.guide?.username || 'Premium Host',
                    slotsRemaining: Math.max(0, Number(itemData.totalSlots || 0) - Number(itemData.bookedSlots || 0) - Number(itemData.reservedSlots || 0)),
                };
            } else if (record.itemType === 'offbeat') {
                itemData = { ...itemData, name: itemData.title, coverImage: itemData.coverPhoto || itemData.photographs?.[0] || '' };
            }
            return { ...record, item: itemData };
        }).filter(Boolean);

        return NextResponse.json({
            success: true,
            saved: validItems,
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), hasMore: page * limit < total },
        }, { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=45' } });
    } catch (error) {
        console.error("Saved items fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch saved items" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { itemId, itemType, config } = body;

        if (!itemId || !itemType) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();
        
        const existing = await Saved.findOne({ userId: user.userId, itemId });
        if (existing) {
             if (config) {
                 existing.config = config;
                 await existing.save();
             }
             return NextResponse.json({ success: true, message: "Already saved", saved: existing });
        }

        const savedItem = await Saved.create({
            userId: user.userId,
            itemId,
            itemType,
            config: config || {}
        });

        return NextResponse.json({ success: true, saved: savedItem });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ success: true, message: "Already saved" });
        }
        console.error("Saved item post error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const itemId = url.searchParams.get('itemId');

        if (!itemId) return NextResponse.json({ success: false, message: "Missing itemId" }, { status: 400 });

        await dbConnect();
        await Saved.findOneAndDelete({ userId: user.userId, itemId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove saved item error:", error);
        return NextResponse.json({ success: false, message: "Failed to remove" }, { status: 500 });
    }
}
