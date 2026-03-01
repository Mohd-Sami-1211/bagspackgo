import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OTP } from '@/models/otp.model';
import { User } from '@/models/user.model';
import { sendOTPEmail, sendOTPSMS } from '@/lib/otp-service';
import { sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

function generateOTP() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (1000 + (array[0] % 9000)).toString();
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
        const { identifier: rawIdentifier, purpose = 'login' } = await request.json();

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

        // For LOGIN: check account EXISTS
        if (purpose === 'login') {
            const searchQuery = identifierType === 'email' ? { email: identifier } : { phone: identifier };
            const user = await User.findOne(searchQuery);
            if (!user) {
                return NextResponse.json({
                    success: false,
                    message: 'No account found. Please sign up first.',
                    notRegistered: true
                }, { status: 404 });
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
