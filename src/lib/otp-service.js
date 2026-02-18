import nodemailer from "nodemailer";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Send OTP via Email using Gmail SMTP
 * @param {string} email - Recipient email address
 * @param {string} otp - 4-digit OTP code
 * @returns {Promise<boolean>}
 */
export async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your bagspackgo Verification Code",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #166534; font-size: 28px; margin: 0;">bagspackgo</h1>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Just pack your bags, we've got the rest...</p>
                </div>
                
                <div style="background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Your verification code is:</p>
                    
                    <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; margin: 16px 0;">
                        <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #166534;">${otp}</span>
                    </div>
                    
                    <p style="color: #9ca3af; font-size: 13px; margin: 16px 0 0;">
                        This code expires in <strong>5 minutes</strong>.<br/>
                        Do not share this code with anyone.
                    </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 20px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️  OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw new Error("Failed to send verification email. Please try again.");
    }
}

/**
 * Send OTP via SMS (console-based for now)
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - 4-digit OTP code
 * @returns {Promise<boolean>}
 */
export async function sendOTPSMS(phone, otp) {
    // For development: log OTP to console
    console.log(`\n========================================`);
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log(`========================================\n`);

    // TODO: Replace with actual SMS provider (Twilio, MSG91, etc.)
    // await twilioClient.messages.create({
    //     body: `Your BagsPackGo verification code is: ${otp}`,
    //     to: `+91${phone}`,
    //     from: process.env.TWILIO_PHONE_NUMBER
    // });

    return true;
}

/**
 * Send Welcome Email after successful registration
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @param {string} role - 'user' or 'provider'
 * @returns {Promise<boolean>}
 */
export async function sendWelcomeEmail(email, name, role) {
    const roleLabel = role === "user" ? "Traveler" : "Service Provider";
    const roleMessage =
        role === "user"
            ? "You now have access to explore amazing destinations, book trips, treks, and connect with fellow travelers."
            : "You can now set up your company profile, list your services, and start connecting with travelers.";

    const mailOptions = {
        from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Welcome to bagspackgo, ${name}! 🎉`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- Header Banner -->
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); padding: 40px 32px; text-align: center;">
                    <h1 style="color: white; font-size: 32px; margin: 0 0 8px;">Welcome to bagspackgo!</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Your adventure begins now 🌍</p>
                </div>

                <!-- Body -->
                <div style="background: white; padding: 36px 32px;">
                    <p style="color: #374151; font-size: 18px; margin: 0 0 16px;">
                        Hi <strong>${name}</strong> 👋
                    </p>
                    
                    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
                        Thank you for joining bagspackgo as a <strong style="color: #16a34a;">${roleLabel}</strong>! 
                        We're thrilled to have you on board.
                    </p>

                    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                        ${roleMessage}
                    </p>

                    <!-- What's Next Box -->
                    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin: 0 0 28px;">
                        <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 12px;">🚀 What's next?</p>
                        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            ${role === "user" ? `
                                <li>Complete your profile</li>
                                <li>Browse destinations and trips</li>
                                <li>Connect with service providers</li>
                                <li>Book your first adventure!</li>
                            ` : `
                                <li>Complete your company profile</li>
                                <li>Upload your license & ID verification</li>
                                <li>Create trip & trek packages</li>
                                <li>Start receiving bookings!</li>
                            `}
                        </ul>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 0 0 16px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin" 
                           style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 8px rgba(34,197,94,0.3);">
                            Sign In to Get Started →
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">
                        Need help? Just reply to this email — we're here for you.
                    </p>
                    <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                        © ${new Date().getFullYear()} BagsPackGo. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`🎉 Welcome email sent to ${email}`);
        return true;
    } catch (error) {
        // Don't throw — welcome email failure shouldn't block signup
        console.error("Welcome email failed:", error.message);
        return false;
    }
}
