import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Admin } from '@/models/admin.model';
import { getCurrentAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/auth/me
 * Returns current admin info if session is valid.
 * Also checks if admin setup has been done.
 */
export async function GET() {
    try {
        await connectDB();

        // Check if any admin exists at all
        const adminExists = await Admin.findOne({});
        if (!adminExists) {
            return NextResponse.json({ success: true, authenticated: false, needsSetup: true });
        }

        const adminPayload = await getCurrentAdmin();
        if (!adminPayload) {
            return NextResponse.json({ success: true, authenticated: false, needsSetup: false });
        }

        const admin = await Admin.findById(adminPayload.adminId).select('-password');
        if (!admin) {
            return NextResponse.json({ success: true, authenticated: false, needsSetup: false });
        }

        return NextResponse.json({
            success: true,
            authenticated: true,
            admin: { name: admin.name, email: admin.email, lastLogin: admin.lastLogin }
        });
    } catch (err) {
        console.error('[Admin Me Error]', err);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
