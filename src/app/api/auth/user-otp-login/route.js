import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OTP } from '@/models/otp.model';
import { User } from '@/models/user.model';
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

        const { identifier: rawIdentifier, otp, purpose = 'login', name, dob } = await request.json();

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

        let user;

        if (purpose === 'login') {
            // Find existing user
            user = await User.findOne(searchQuery);
            if (!user) {
                return NextResponse.json({ success: false, message: 'Account not found. Please sign up.' }, { status: 404 });
            }
        } else if (purpose === 'signup') {
            // Create new user account
            if (!name || name.trim().length < 2) {
                return NextResponse.json({ success: false, message: 'Please enter your name' }, { status: 400 });
            }

            // Check not already registered
            const existing = await User.findOne(searchQuery);
            if (existing) {
                return NextResponse.json({ success: false, message: 'Account already exists. Please log in.' }, { status: 409 });
            }

            const accountData = {
                username: name.trim(),
                phone: identifierType === 'phone' ? identifier : '',
                email: identifierType === 'email' ? identifier : '',
                password: '',
                isPhoneVerified: identifierType === 'phone',
                isEmailVerified: identifierType === 'email',
                role: 'user',
            };
            if (dob) accountData.dob = new Date(dob);

            user = await User.create(accountData);

            // Welcome email (non-blocking)
            if (accountData.email) {
                sendWelcomeEmail(accountData.email, name, 'user').catch(err =>
                    console.error('Welcome email error:', err.message)
                );
            }
        }

        // Generate JWT token and set cookie
        const token = generateToken({
            userId: user._id.toString(),
            username: user.username,
            role: 'user',
            email: user.email,
            phone: user.phone,
        });

        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: 'user',
        };

        const response = NextResponse.json({
            success: true,
            message: purpose === 'login' ? 'Logged in successfully!' : 'Account created! Welcome to BagsPackGo.',
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
