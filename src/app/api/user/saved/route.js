import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Saved } from '@/models/saved.model';
import { Package } from '@/models/package.model';
import { Event } from '@/models/event.model';
import { Guide } from '@/models/guide.model';

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const savedRecords = await Saved.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
        
        // Manually populate since refs might be mixed or in different collections
        const populatedItems = await Promise.all(savedRecords.map(async (record) => {
            let itemData = null;
            if (record.itemType === 'trip' || record.itemType === 'trek') {
                itemData = await Package.findById(record.itemId).select('title name destination label days packageCategory pricingTiers photos coverImage images provider providerId').lean();
            } else if (record.itemType === 'event') {
                itemData = await Event.findById(record.itemId)
                    .select('title eventType destination date duration pricePerSlot poster photographs location totalSlots bookedSlots guide')
                    .populate({ path: 'guide', select: 'companyName firstName lastName' })
                    .lean();
                if (itemData) {
                    itemData.name = itemData.title;
                    itemData.coverImage = itemData.poster || (itemData.photographs && itemData.photographs[0]) || '';
                    itemData.price = itemData.pricePerSlot;
                    itemData.organizer = itemData.guide?.companyName || (itemData.guide ? `${itemData.guide.firstName} ${itemData.guide.lastName}` : 'System Guide');
                    itemData.slotsRemaining = Math.max(0, (itemData.totalSlots || 0) - (itemData.bookedSlots || 0));
                }
            }
            
            return {
                ...record,
                item: itemData,
            };
        }));
        
        // Filter out items that might have been deleted from DB
        const validItems = populatedItems.filter(p => p.item != null);

        return NextResponse.json({ success: true, saved: validItems });
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
