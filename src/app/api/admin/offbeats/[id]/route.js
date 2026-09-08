import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';

export const maxDuration = 60; // Allow more time for large uploads

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await dbConnect();
        const offbeat = await OffBeat.findById(id);
        if (!offbeat) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: offbeat });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        await dbConnect();
        const body = await req.json();

        // Use the native collection for the lightweight featured toggle so the
        // newly added field also works immediately during Next.js hot reloads.
        if (Object.keys(body).length === 1 && typeof body.featured === 'boolean') {
            if (!mongoose.isValidObjectId(id)) {
                return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
            }
            const offbeat = await OffBeat.collection.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { featured: body.featured, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );
            if (!offbeat) {
                return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
            }
            return NextResponse.json(
                { success: true, data: offbeat },
                { headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const offbeat = await OffBeat.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: offbeat });
    } catch (error) {
        console.error('Update Offbeat Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        await dbConnect();
        await OffBeat.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
