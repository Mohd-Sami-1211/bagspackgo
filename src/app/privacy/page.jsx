'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function UserPrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#16483b_0%,_#06110e_42%,_#030807_100%)] flex flex-col pt-10 pb-16 px-4 md:px-8 lg:px-12 w-full">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex-1">
        
        {/* Header */}
        <div className="px-6 py-9 sm:px-10 border-b border-white/10 bg-[#0b211b] flex items-start gap-4 sm:gap-6">
          <button onClick={() => router.back()} className="w-10 h-10 mt-1 shrink-0 bg-white/10 border border-white/15 rounded-full flex items-center justify-center text-white/80 hover:bg-white/20 transition shadow-sm group">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.24em] mb-2">bagspackgo legal</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">Privacy Policy</h1>
            <p className="text-white/55 font-medium text-xs tracking-wider uppercase">Last updated: September 2026</p>
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
              </ul>
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
      <div className="mt-8 text-center pb-8">
        <p className="text-white/60 font-medium text-xs tracking-widest uppercase">
          Please also review our <Link href="/terms" className="text-emerald-300 font-bold hover:text-emerald-200">Terms & Conditions</Link>
        </p>
      </div>

    </div>
  );
}
