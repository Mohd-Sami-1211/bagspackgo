import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OTP } from '@/models/otp.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { sendOTPEmail, sendOTPSMS } from '@/lib/otp-service';
import { sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function getIdentifierType(input) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) return 'email';
    if (/^\d{10}$/.test(input)) return 'phone';
    return null;
}

    // POST /api/auth/user-send-otp  (login or signup OTP for users)
export async function POST(request) {
    try {
        await dbConnect();
        const { identifier: rawIdentifier, purpose = 'auth' } = await request.json();

        if (!rawIdentifier) {
            return NextResponse.json({ success: false, message: 'Please enter your mobile number or email' }, { status: 400 });
        }

        const identifierType = getIdentifierType(rawIdentifier.trim());
        if (!identifierType) {
            return NextResponse.json({ success: false, message: 'Please enter a valid email or 10-digit mobile number' }, { status: 400 });
        }

        const identifier = identifierType === 'email'
            ? sanitizeEmail(rawIdentifier)
            : sanitizePhone(rawIdentifier);

        // If email is provided, check if it already belongs to a service provider
        if (identifierType === 'email') {
            const existingProvider = await Guide.findOne({ email: identifier });
            if (existingProvider) {
                return NextResponse.json({ success: false, message: 'Mail already used as service provider' }, { status: 403 });
            }
        }

        // Rate limit: 1 OTP per 60s
        const recentOTP = await OTP.findOne({
            identifier,
            purpose,
            createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
        });
        if (recentOTP) {
            const waitSec = Math.ceil((60 * 1000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000);
            return NextResponse.json({ success: false, message: `Wait ${waitSec}s before requesting again` }, { status: 429 });
        }

        // Delete old OTPs
        await OTP.deleteMany({ identifier, purpose });

        // Generate + save OTP
        const otpCode = generateOTP();
        await OTP.create({ identifier, identifierType, otp: otpCode, purpose });

        // Send
        if (identifierType === 'email') {
            await sendOTPEmail(rawIdentifier.trim(), otpCode);
        } else {
            await sendOTPSMS(identifier, otpCode);
        }

        return NextResponse.json({
            success: true,
            message: identifierType === 'email' ? 'OTP sent to your email' : 'OTP sent to your mobile',
            identifierType,
        });
    } catch (error) {
        console.error('User OTP send error:', error);
        return NextResponse.json({ success: false, message: 'Something went wrong. Try again.' }, { status: 500 });
    }
}
