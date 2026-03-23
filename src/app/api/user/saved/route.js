import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Saved } from '@/models/saved.model';
import { Package } from '@/models/package.model';

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
                itemData = await Package.findById(record.itemId).select('title name destination label days packageCategory pricingTiers photos coverImage images').lean();
            }
            // Add 'event' handling if event model exists
            
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
        const { itemId, itemType } = body;

        if (!itemId || !itemType) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();
        
        const existing = await Saved.findOne({ userId: user.userId, itemId });
        if (existing) {
             return NextResponse.json({ success: true, message: "Already saved" });
        }

        const savedItem = await Saved.create({
            userId: user.userId,
            itemId,
            itemType
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
