'use client';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function UserPrivacyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f8f6] px-4 pb-16 pt-8 md:px-8 md:pt-10 lg:px-12">
      <div className="mx-auto w-full max-w-5xl flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)]">
        
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-sky-50/60 px-6 py-8 sm:gap-6 sm:px-10 sm:py-10">
          <Link href="/user/trip" className="group mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700" aria-label="Back to home">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700"><ShieldCheck className="h-4 w-4" />bagspackgo legal</p>
            <h1 className="mb-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Privacy Policy</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last updated: September 2026</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-9 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm leading-6 text-emerald-950">
            This policy explains what information bagspackgo collects, why we use it, and the choices available to you when you use our travel marketplace.
          </div>
          <div className="space-y-8 text-gray-600 leading-relaxed font-medium text-sm sm:text-[15px]">
            
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">1. Information Collected</h2>
              <p className="mb-2">We collect the following information to provide and improve our services:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Name, email, phone number</li>
                <li>Location data</li>
                <li>Booking and transaction details</li>
                <li>User-generated content (reviews, stories, photos)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">2. Usage of Information</h2>
              <p className="mb-2">Your information is used for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To process bookings and transactions</li>
                <li>To connect users with service providers</li>
                <li>To improve platform experience and personalize content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">3. Payment Security</h2>
              <p className="mb-2">Payments are processed via Razorpay.</p>
              <p>bagspackgo does not store sensitive payment data such as card numbers, CVV, or banking credentials. All payment-related data is handled directly by our payment processor in compliance with PCI-DSS standards.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">4. Data Sharing</h2>
              <p className="mb-2">We may share your data with the following parties only as necessary:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-bold text-gray-900">Service providers</span> — to facilitate your bookings</li>
                <li><span className="font-bold text-gray-900">Payment processors</span> — to securely process transactions</li>
                <li><span className="font-bold text-gray-900">Legal authorities</span> — when required by law or to protect rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">5. Data Security</h2>
              <p className="mb-2">We implement reasonable security measures including encryption, secure servers, and access controls to protect your personal data.</p>
              <p>However, absolute security cannot be guaranteed over the internet. We encourage users to use strong passwords and protect their account credentials.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">6. User Rights</h2>
              <p className="mb-2">You have the right to manage your personal data:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Request updates to your personal information at any time.</li>
                <li>Request deletion of your account and associated data.</li>
              </ul>npm run dev
              <p>To exercise these rights, please contact us at <a href="mailto:bagspackgo01@gmail.com" className="text-emerald-600 font-bold hover:underline">support@bagspackgo.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">7. Cookies</h2>
              <p>Cookies and similar technologies may be used to enhance your browsing experience, remember your preferences, and analyze platform usage. By using bagspackgo, you consent to our use of cookies as described in this policy.</p>
            </section>

          </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="mt-8 pb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Please also review our <Link href="/terms" className="font-bold text-emerald-700 hover:text-emerald-800">Terms & Conditions</Link>
        </p>
      </div>

    </div>
  );
}
