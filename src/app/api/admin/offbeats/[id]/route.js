import { NextResponse } from 'next/server';
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
        const offbeat = await OffBeat.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: offbeat });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
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
