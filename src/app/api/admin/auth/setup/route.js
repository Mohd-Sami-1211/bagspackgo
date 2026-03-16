import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { Admin } from '@/models/admin.model';
import { generateAdminToken, getAdminCookieOptions } from '@/lib/adminAuth';

/**
 * POST /api/admin/auth/setup
 * One-time admin account creation. Disabled if an Admin already exists.
 */
export async function POST(req) {
    try {
        await connectDB();

        // Only allow setup if no admin exists yet
        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) {
            return NextResponse.json({ success: false, message: 'Setup already completed.' }, { status: 403 });
        }

        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ success: false, message: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await Admin.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            isSetup: true,
        });

        // Auto-login after setup
        const token = generateAdminToken({ adminId: admin._id.toString(), email: admin.email, name: admin.name });
        const cookieOpts = getAdminCookieOptions(token);

        const response = NextResponse.json({ success: true, message: 'Admin account created.' });
        response.cookies.set(cookieOpts);
        return response;
    } catch (err) {
        console.error('[Admin Setup Error]', err);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
