import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { Admin } from '@/models/admin.model';
import { generateAdminToken, getAdminCookieOptions } from '@/lib/adminAuth';

/**
 * POST /api/admin/auth/login
 */
export async function POST(req) {
    try {
        await connectDB();

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
        }

        const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = generateAdminToken({ adminId: admin._id.toString(), email: admin.email, name: admin.name });
        const cookieOpts = getAdminCookieOptions(token);

        const response = NextResponse.json({
            success: true,
            admin: { name: admin.name, email: admin.email }
        });
        response.cookies.set(cookieOpts);
        return response;
    } catch (err) {
        console.error('[Admin Login Error]', err);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
