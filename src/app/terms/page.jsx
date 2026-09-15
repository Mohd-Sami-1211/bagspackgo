'use client';
import Link from 'next/link';
import { ArrowLeft, FileCheck2 } from 'lucide-react';

export default function UserTermsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f8f6] px-4 pb-16 pt-8 md:px-8 md:pt-10 lg:px-12">
      <div className="mx-auto w-full max-w-5xl flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.3)]">
        
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-amber-50/60 px-6 py-8 sm:gap-6 sm:px-10 sm:py-10">
          <Link href="/" className="group mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700" aria-label="Back to home">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700"><FileCheck2 className="h-4 w-4" />bagspackgo legal</p>
            <h1 className="mb-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Terms & Conditions</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Last updated: September 2026</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-9 rounded-2xl border border-amber-100 bg-amber-50/80 p-5 text-sm leading-6 text-amber-950">
            Please read these terms before booking. Package-specific cancellation, payment, safety, and participation conditions may also appear during checkout.
          </div>
          <div className="space-y-8 text-gray-600 leading-relaxed font-medium text-sm sm:text-[15px]">
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">1. Introduction</h2>
              <p className="mb-2">Welcome to bagspackgo. By accessing or using our platform, you agree to comply with and be bound by these Terms & Conditions.</p>
              <p>bagspackgo operates as a marketplace platform that connects users with independent travel service providers for trips, treks, and events.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">2. Nature of Platform</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>bagspackgo is not a travel service provider.</li>
                <li>We act solely as an intermediary between users and service providers.</li>
                <li>All services are provided by independent guides.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">3. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Users must be 18 years or older.</li>
                <li>Users must provide accurate and complete information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">4. Booking & Payments</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All payments are processed via Razorpay.</li>
                <li>Depending on the package, users may pay the full amount or a 30% upfront amount.</li>
                <li>For a partial payment, the remaining amount is due directly on the trip day as shown during checkout and on the booking pass.</li>
                <li>Payment handling is managed securely by third-party payment processors.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">5. Cancellation & Refund Policy (Trips & Treks)</h2>
              <p className="mb-4">All cancellations and refunds are managed solely by bagspackgo and are subject to applicable deductions including platform fees, payment gateway charges, and operational costs.</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-gray-900 mb-4 tracking-tight">Refund Structure</h3>
                <div className="grid gap-3 mb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-2 gap-1 text-sm">
                    <span>Cancellation within 24 hours of booking</span>
                    <span className="font-bold text-emerald-600">~90% refund</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-2 gap-1 text-sm">
                    <span>Cancellation after 24H & more than 7 days before start</span>
                    <span className="font-bold text-emerald-600">~75% refund</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-2 gap-1 text-sm">
                    <span>Cancellation after 24H & less than 7 days before start</span>
                    <span className="font-bold text-emerald-600">~60% refund</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
                    <span>Cancellation within 48 hours prior to start</span>
                    <span className="font-bold text-emerald-600">~30% refund</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 tracking-tight">Important Notes</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
                  <li>No refunds beyond the above structure.</li>
                  <li>No refunds for no-shows or failure to participate.</li>
                  <li>Refund percentages are approximate and may vary slightly.</li>
                  <li>bagspackgo holds final authority on all refund decisions.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">6. Event Booking Policy</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><span className="font-bold text-red-600">No cancellation</span> allowed for events.</li>
                <li><span className="font-bold text-red-600">No refunds</span> will be issued for event bookings.</li>
                <li className="font-bold text-gray-900">All event bookings are final.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">7. Service Provider Disclaimer</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Providers are verified using government documents.</li>
                <li>bagspackgo does not guarantee service quality, safety, or accuracy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">8. Liability Limitation</h2>
              <p className="mb-2">bagspackgo shall not be held liable for:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Injuries, accidents, or death</li>
                <li>Loss or damage of belongings</li>
                <li>Delays or cancellations by providers</li>
                <li>Natural disasters or unforeseen events</li>
              </ul>
              <p className="font-bold text-gray-900 text-xs tracking-wider uppercase">Users participate at their own risk.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">9. Community Guidelines</h2>
              <p className="mb-2">Users may post reviews and travel stories. Users must not:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-2">
                <li>Post abusive, illegal, or misleading content.</li>
                <li>Harass or harm others.</li>
                <li>Share spam or fraudulent information.</li>
              </ul>
              <p>bagspackgo reserves the right to remove content or suspend accounts.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">10. Account Suspension & Intellectual Property</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Accounts may be suspended for fraud, policy violations, or misuse of platform.</li>
                <li>Platform content belongs to bagspackgo.</li>
                <li>Users grant rights to use uploaded content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">11. Modifications</h2>
              <p>bagspackgo may update these terms at any time. Continued use of the platform implies acceptance of any modifications.</p>
            </section>
          </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="mt-8 text-center pb-8">
        <p className="text-gray-400 font-medium text-xs tracking-widest uppercase">
          Please also review our <Link href="/privacy" className="font-bold text-emerald-700 hover:text-emerald-800">Privacy Policy</Link>
        </p>
      </div>

    </div>
  );
}
