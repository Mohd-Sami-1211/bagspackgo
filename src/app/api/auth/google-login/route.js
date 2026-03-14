import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/user.model';
import { generateToken, getTokenCookieOptions } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        
        const { credential } = await request.json();
        if (!credential) {
            return NextResponse.json({ success: false, message: 'No Google credential provided' }, { status: 400 });
        }

        // Validate the Access Token securely with Google's userinfo endpoint
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${credential}` }
        });
        const googlePayload = await googleRes.json();

        if (googlePayload.error || !googlePayload.email) {
            return NextResponse.json({ success: false, message: 'Invalid Google token' }, { status: 401 });
        }
        if (googlePayload.email_verified !== 'true' && googlePayload.email_verified !== true) {
             return NextResponse.json({ success: false, message: 'Google email is not verified' }, { status: 401 });
        }

        const email = googlePayload.email.toLowerCase();
        const googleName = googlePayload.name || '';
        
        let user = await User.findOne({ email });
        let message = 'Logged in successfully with Google!';
        
        if (!user) {
            user = await User.create({
                username: googleName,
                email: email,
                phone: '', 
                password: '',
                isEmailVerified: true,
                isPhoneVerified: false,
                role: 'user'
            });
            message = 'Google account connected! Welcome to BagsPackGo.';
        }

        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role
        };
        
        const token = generateToken({
            userId: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role
        });

        const response = NextResponse.json({
            success: true,
            message,
            user: userResponse
        }, { status: 200 });

        response.cookies.set(getTokenCookieOptions(token));
        return response;

    } catch (error) {
        console.error("Google Login Error:", error);
        return NextResponse.json({ success: false, message: "Google Login Failed. Try again." }, { status: 500 });
    }
}
