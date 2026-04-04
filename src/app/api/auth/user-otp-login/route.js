import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OTP } from '@/models/otp.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { generateToken, getTokenCookieOptions } from '@/lib/auth';
import { sanitizeEmail, sanitizePhone } from '@/lib/sanitize';
import { sendWelcomeEmail } from '@/lib/otp-service';

const MAX_ATTEMPTS = 5;

function getIdentifierType(input) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) return 'email';
    if (/^\d{10}$/.test(input)) return 'phone';
    return null;
}

/**
 * POST /api/auth/user-otp-login
 * Body: { identifier, otp, purpose: 'login' | 'signup', name?, dob? }
 *
 * For LOGIN: verifies OTP → finds user → sets JWT cookie → returns user
 * For SIGNUP: verifies OTP → creates user with name/dob → sets JWT cookie → returns user
 */
export async function POST(request) {
    try {
        await dbConnect();

        const { identifier: rawIdentifier, otp, purpose = 'auth', name, dob } = await request.json();

        if (!rawIdentifier || !otp) {
            return NextResponse.json({ success: false, message: 'Identifier and OTP are required' }, { status: 400 });
        }

        if (!/^\d{4}$/.test(otp)) {
            return NextResponse.json({ success: false, message: 'Please enter a valid 4-digit OTP' }, { status: 400 });
        }

        const identifierType = getIdentifierType(rawIdentifier.trim());
        if (!identifierType) {
            return NextResponse.json({ success: false, message: 'Invalid identifier' }, { status: 400 });
        }

        const identifier = identifierType === 'email'
            ? sanitizeEmail(rawIdentifier)
            : sanitizePhone(rawIdentifier);

        // Find OTP record
        const otpRecord = await OTP.findOne({ identifier, purpose }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json({ success: false, message: 'OTP has expired. Request a new one.' }, { status: 400 });
        }

        // Check max attempts
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return NextResponse.json({ success: false, message: 'Too many failed attempts. Request a new OTP.' }, { status: 429 });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            const remaining = MAX_ATTEMPTS - otpRecord.attempts;
            return NextResponse.json({
                success: false,
                message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
            }, { status: 400 });
        }

        // OTP correct — delete it
        await OTP.deleteOne({ _id: otpRecord._id });

        const searchQuery = identifierType === 'email' ? { email: identifier } : { phone: identifier };

        if (identifierType === 'email') {
            const existingProvider = await Guide.findOne({ email: identifier });
            if (existingProvider) {
                return NextResponse.json({ success: false, message: 'Mail already used as service provider' }, { status: 403 });
            }
        }

        let user = await User.findOne(searchQuery);
        if (user && user.role === 'provider' && identifierType === 'email') {
            return NextResponse.json({ success: false, message: 'Mail already used as service provider' }, { status: 403 });
        }

        let message = 'Logged in successfully!';

        if (!user) {
            const finalName = (name && name.trim().length >= 2) ? name.trim() : '';

            const dummyPhone = '00' + Math.floor(10000000 + Math.random() * 90000000).toString();
            const accountData = {
                username: finalName,
                phone: identifierType === 'phone' ? identifier : dummyPhone,
                email: identifierType === 'email' ? identifier : '',
                password: '',
                isPhoneVerified: identifierType === 'phone',
                isEmailVerified: identifierType === 'email',
                role: 'user',
            };
            if (dob) accountData.dob = new Date(dob);

            user = await User.create(accountData);
            message = 'Account created! Welcome to bagspackgo.';

            // Welcome email (non-blocking)
            if (accountData.email && finalName) {
                sendWelcomeEmail(accountData.email, finalName, 'user').catch(err =>
                    console.error('Welcome email error:', err.message)
                );
            }
        }

        // Generate JWT token and set cookie
        const token = generateToken({
            userId: user._id.toString(),
            username: user.username,
            role: user.role,
            email: user.email,
            phone: user.phone,
        });

        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };

        const response = NextResponse.json({
            success: true,
            message,
            user: userResponse,
        }, { status: 200 });

        const cookieOptions = getTokenCookieOptions(token);
        response.cookies.set(cookieOptions);

        return response;
    } catch (error) {
        console.error('User OTP Login Error:', error);
        return NextResponse.json({ success: false, message: 'Something went wrong. Try again.' }, { status: 500 });
    }
}
