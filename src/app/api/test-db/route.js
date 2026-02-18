import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ message: 'Database connected successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Database connection failed', details: error.message }, { status: 500 });
    }
}
