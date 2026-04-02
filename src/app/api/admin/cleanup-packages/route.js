import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Package } from '@/models/package.model';

// ONE-TIME cleanup: delete all packages (call once then delete this file)
export async function DELETE(req) {
    try {
        await dbConnect();
        const result = await Package.deleteMany({});
        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} packages`
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
