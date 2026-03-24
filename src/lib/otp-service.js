import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";

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
 * Send OTP via SMS (console-based for now) Later we will use the SMS services for OTP verification
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
    //     body: `Your bagspackgo verification code is: ${otp}`,
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
                        © ${new Date().getFullYear()} bagspackgo. All rights reserved.
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

/**
 * Send Approval Email to Provider and Company
 * @param {string} providerEmail - Provider's email address
 * @param {string} companyName - Provider's company name
 * @param {string} providerName - Provider's user name
 * @returns {Promise<boolean>}
 */
export async function sendApprovalEmail(providerEmail, companyName, providerName) {
    const providerMailOptions = {
        from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
        to: providerEmail,
        subject: `Your Application is Approved! Welcome to bagspackgo 🎉`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%); padding: 40px 32px; text-align: center;">
                    <h1 style="color: white; font-size: 32px; margin: 0 0 8px;">Congratulations!</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Your provider application has been approved 🚀</p>
                </div>
                <div style="background: white; padding: 36px 32px;">
                    <p style="color: #374151; font-size: 18px; margin: 0 0 16px;">Hi <strong>${providerName || companyName}</strong> 👋</p>
                    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
                        Great news! We have reviewed your application for <strong>${companyName}</strong> and you are officially approved to join bagspackgo as a Service Provider.
                    </p>
                    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin: 0 0 28px;">
                        <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 12px;">What you can do now:</p>
                        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Access your complete provider dashboard</li>
                            <li>Create and manage your trips & treks</li>
                            <li>View and manage bookings and customers</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 0 0 16px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/serviceprovider" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">Go to Dashboard</a>
                    </div>
                </div>
            </div>
        `,
    };

    const companyMailOptions = {
        from: `"bagspackgo System" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // sending backwards to our own platform email
        subject: `New Provider Approved: ${companyName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #16a34a;">Provider Approved Successfully</h2>
                <p><strong>Company:</strong> ${companyName}</p>
                <p><strong>Provider Email:</strong> ${providerEmail}</p>
                <p><strong>Provider Name:</strong> ${providerName}</p>
                <p>This provider has been granted access to their dashboard.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(providerMailOptions);
        await transporter.sendMail(companyMailOptions);
        console.log(`✅ Approval emails sent for ${companyName}`);
        return true;
    } catch (error) {
        console.error("Approval email failed:", error.message);
        return false;
    }
}

/**
 * Send trip booking confirmation to user and provider
 */
export async function sendTripBookingConfirmation({ userEmail, userName, providerEmail, providerName, bookingRef, packageName, destination, startDate, endDate, numPeople, totalAmount }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const formattedStart = startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';
    const formattedEnd = endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';

    // Email to user
    if (userEmail) {
        const userMail = {
            from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
            to: userEmail,
            subject: `✅ Booking Confirmed — ${packageName} | Ref: ${bookingRef}`,
            attachments: [
                {
                    filename: `BagsPackGo_BookingPass_${bookingRef}.pdf`,
                    content: (() => {
                        const doc = new jsPDF();
                        // Header
                        doc.setFillColor(5, 150, 105);
                        doc.rect(0, 0, 210, 40, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(22);
                        doc.text("BagsPackGo Travel Pass", 15, 25);
                        
                        // Body
                        doc.setTextColor(0, 0, 0);
                        doc.setFontSize(10);
                        doc.text("Booking Reference:", 15, 55);
                        doc.setFontSize(14);
                        doc.text(bookingRef, 15, 62);
                        
                        doc.setFontSize(10);
                        doc.text("Package Name:", 15, 75);
                        doc.setFontSize(14);
                        doc.text(packageName, 15, 82);
                        
                        doc.setFontSize(10);
                        doc.text("Destination:", 15, 95);
                        doc.setFontSize(12);
                        doc.text(destination, 15, 102);
                        
                        doc.setFontSize(10);
                        doc.text("Travel Date:", 110, 55);
                        doc.setFontSize(12);
                        doc.text(formattedStart, 110, 62);
                        
                        doc.setFontSize(10);
                        doc.text("Passengers:", 110, 75);
                        doc.setFontSize(12);
                        doc.text(`${numPeople} Pax`, 110, 82);
                        
                        doc.setFontSize(10);
                        doc.text("Total Paid:", 110, 95);
                        doc.setFontSize(14);
                        doc.setTextColor(5, 150, 105);
                        doc.text(`Rs. ${Number(totalAmount).toLocaleString('en-IN')}`, 110, 102);
                        
                        // Footer
                        doc.setTextColor(150, 150, 150);
                        doc.setFontSize(9);
                        doc.text("Please present this pass with a valid ID at the time of pickup.", 15, 280);
                        doc.text("Thank you for choosing BagsPackGo!", 15, 285);
                        
                        return Buffer.from(doc.output('arraybuffer'));
                    })()
                }
            ],
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10);">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 32px; text-align: center;">
                        <img src="${appUrl}/images/logo.png" alt="BagsPackGo" style="height: 48px; width: auto; margin-bottom: 20px;" />
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Booking Confirmed!</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Your adventure with ${providerName} is ready 🎉</p>
                    </div>
                    <div style="background: white; padding: 40px 32px;">
                        <p style="color: #111827; font-size: 18px; margin: 0 0 16px;">Hi <strong>${userName}</strong>,</p>
                        <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">Pack your bags! Your trip booking for <strong>${packageName}</strong> has been successfully confirmed. A PDF copy of your travel pass is attached below for your journey.</p>
                        
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0;">
                            <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px; border-bottom: 1px solid #e2e8f0; pb-8;">Trip Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="color: #64748b; padding: 8px 0; font-size: 14px;">Booking Reference</td><td style="color: #0f172a; font-weight: 700; font-size: 14px; text-align: right; font-family: monospace;">${bookingRef}</td></tr>
                                <tr><td style="color: #64748b; padding: 8px 0; font-size: 14px;">Destination</td><td style="color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">${destination}</td></tr>
                                <tr><td style="color: #64748b; padding: 8px 0; font-size: 14px;">Travel Dates</td><td style="color: #0f172a; font-size: 14px; text-align: right;">${formattedStart} — ${formattedEnd}</td></tr>
                                <tr><td style="color: #64748b; padding: 8px 0; font-size: 14px;">Passengers</td><td style="color: #0f172a; font-size: 14px; text-align: right;">${numPeople} Pax</td></tr>
                                <tr style="border-top: 1px solid #e2e8f0;"><td style="color: #059669; padding: 16px 0 0; font-size: 18px; font-weight: 800;">Total Paid</td><td style="color: #059669; font-size: 18px; font-weight: 800; text-align: right; padding-top: 16px;">₹${Number(totalAmount).toLocaleString('en-IN')}</td></tr>
                            </table>
                        </div>
                        
                        <div style="background: #fffbeb; border-radius: 12px; padding: 16px; margin-bottom: 32px;">
                            <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;"><strong>Note:</strong> Your guide <strong>${providerName}</strong> will contact you on your registered mobile number for final coordination and pickup details.</p>
                        </div>

                        <div style="text-align: center;">
                            <a href="${appUrl}/user/bookings" style="background: #059669; color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">Manage My Booking →</a>
                        </div>
                    </div>
                    <div style="background: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">Just pack your bags, we've got the rest.</p>
                        <p style="color: #64748b; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} BagsPackGo. All rights reserved.</p>
                    </div>
                </div>
            `,
        };
        try { await transporter.sendMail(userMail); } catch (e) { console.error('User booking email failed:', e.message); }
    }

    // Email to provider
    if (providerEmail) {
        const providerMail = {
            from: `"bagspackgo" <${process.env.GMAIL_USER}>`,
            to: providerEmail,
            subject: `🎒 New Booking Received — ${packageName} | Ref: ${bookingRef}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10);">
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 36px 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 26px;">New Booking!</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">A traveller has booked your package</p>
                    </div>
                    <div style="background: white; padding: 36px 32px;">
                        <p style="color: #374151; font-size: 16px;">Hi <strong>${providerName}</strong>,</p>
                        <p style="color: #4b5563; line-height: 1.6;">Great news! <strong>${userName}</strong> has just booked your <strong>${packageName}</strong> package.</p>
                        <div style="background: #fffbeb; border-radius: 12px; padding: 24px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Booking Ref</td><td style="color: #111827; font-weight: 700; font-size: 14px; text-align: right;">${bookingRef}</td></tr>
                                <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Traveller</td><td style="color: #111827; font-weight: 600; font-size: 14px; text-align: right;">${userName}</td></tr>
                                <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Package</td><td style="color: #111827; font-size: 14px; text-align: right;">${packageName}</td></tr>
                                <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Destination</td><td style="color: #111827; font-size: 14px; text-align: right;">${destination}</td></tr>
                                <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Start Date</td><td style="color: #111827; font-size: 14px; text-align: right;">${formattedStart}</td></tr>
                                <tr><td style="color: #6b7280; padding: 6px 0; font-size: 14px;">Travellers</td><td style="color: #111827; font-size: 14px; text-align: right;">${numPeople}</td></tr>
                                <tr style="border-top: 1px solid #fde68a;"><td style="color: #d97706; padding: 12px 0 0; font-size: 16px; font-weight: 700;">Amount</td><td style="color: #d97706; font-size: 16px; font-weight: 700; text-align: right; padding-top: 12px;">₹${Number(totalAmount).toLocaleString('en-IN')}</td></tr>
                            </table>
                        </div>
                        <div style="text-align: center; margin: 28px 0 8px;">
                            <a href="${appUrl}/serviceprovider/dashboard" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">View Dashboard →</a>
                        </div>
                    </div>
                    <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} bagspackgo. All rights reserved.</p>
                    </div>
                </div>
            `,
        };
        try { await transporter.sendMail(providerMail); } catch (e) { console.error('Provider booking email failed:', e.message); }
    }
}

