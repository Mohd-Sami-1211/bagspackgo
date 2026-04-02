import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Admin } from '@/models/admin.model';
import { getCurrentAdmin } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export async function PATCH(req) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        
        const { name, email, currentPassword, newPassword } = await req.json();

        // fetch complete admin with password for verification
        const adminDoc = await Admin.findById(admin.id).select('+password');
        if (!adminDoc) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });

        // Update profile details
        if (name) adminDoc.name = name;
        if (email) {
            // Check if email already exists for another admin
            const existing = await Admin.findOne({ email, _id: { $ne: admin.id } });
            if (existing) return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
            adminDoc.email = email;
        }

        // Update password if requested
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, adminDoc.password);
            if (!isMatch) return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 400 });
            
            const salt = await bcrypt.genSalt(10);
            adminDoc.password = await bcrypt.hash(newPassword, salt);
        } else if (newPassword) {
            return NextResponse.json({ success: false, message: 'Current password required to set new password' }, { status: 400 });
        }

        await adminDoc.save();

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
