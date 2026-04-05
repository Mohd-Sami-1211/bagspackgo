'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ProviderTermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-6 pb-16 px-4 md:px-8 lg:px-12 w-full">
      <div className="w-full bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex-1">
        
        {/* Header */}
        <div className="px-6 py-8 sm:px-10 border-b border-gray-100 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          
          <div className="flex items-start gap-4 sm:gap-6">
            <button onClick={() => router.back()} className="w-10 h-10 mt-1 shrink-0 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition shadow-sm group">
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase mb-3">
                Partner Portal Legal
              </div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest mb-1.5">Service Provider Terms</h1>
              <p className="text-gray-400 font-medium text-xs tracking-wider uppercase">Last Updated: April 2026</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="space-y-8 text-gray-600 leading-relaxed font-medium text-sm sm:text-[15px]">
            
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">1. Introduction</h2>
              <p>These Terms govern the relationship between bagspackgo and service providers (guides, organizers).</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">2. Platform Role</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>bagspackgo operates as a <span className="font-bold text-gray-900">marketplace only</span>.</li>
                <li>We do not guarantee bookings or earnings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">3. Commission Structure</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-bold text-gray-900">10% commission</span> on trips and treks.</li>
                <li><span className="font-bold text-gray-900">7% commission</span> on events.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">4. Payment Structure</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-5">
                <h3 className="font-bold text-gray-900 mb-3 tracking-tight">Trips & Treks</h3>
                <p className="mb-2">Payments will be released in 3 phases:</p>
                <ol className="list-decimal pl-5 space-y-1.5 mb-4">
                  <li><span className="font-bold text-gray-900">Initial release</span> at trip start.</li>
                  <li><span className="font-bold text-gray-900">Mid-phase release</span> during execution.</li>
                  <li><span className="font-bold text-gray-900">Final settlement</span> after completion.</li>
                </ol>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded font-semibold tracking-wide">Note: bagspackgo may withhold or adjust payments in case of disputes.</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-gray-900 mb-3 tracking-tight">Events</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Events have a <span className="font-bold text-red-600">no cancellation</span> policy.</li>
                  <li>Amount collected in a day will be credited by the <span className="font-bold text-gray-900">end of business day</span>.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">5. Guide Compensation (User Cancellation)</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Providers may receive partial compensation for last-minute cancellations by users.</li>
                <li>Compensation amount is determined solely by bagspackgo based on the situation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">6. Responsibilities of Providers</h2>
              <p className="mb-2">Providers must:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Deliver services exactly as promised in the itinerary.</li>
                <li>Maintain safety and professionalism at all times.</li>
                <li>Provide accurate and truthful listings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">7. Prohibited Activities</h2>
              <p className="mb-2">Providers must not:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Mislead users or misrepresent services.</li>
                <li>Accept or solicit off-platform payments from users acquired via bagspackgo.</li>
                <li>Cancel confirmed bookings irresponsibly.</li>
                <li>Provide unsafe or illegal services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">8. Penalties, Deductions & Liability</h2>
              <p className="mb-2">bagspackgo reserves the right to deduct penalties for:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Irresponsible behavior.</li>
                <li>Poor service quality or failure to deliver promised amenities.</li>
                <li>Last-minute cancellations.</li>
              </ul>
              <p className="mb-2">Providers are solely responsible for:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-4">
                <li>Service execution and physical safety of users.</li>
                <li>Legal compliance of their operations.</li>
              </ul>
              <p className="font-bold text-red-700 text-xs bg-red-50 border border-red-100 p-3 rounded">bagspackgo is not liable for provider actions. Repeated violations will result in account suspension or termination.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">9. Disputes</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All disputes are handled directly by bagspackgo.</li>
                <li>Platform decisions are final in payment and dispute matters.</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="mt-8 text-center pb-8">
        <p className="text-gray-400 font-medium text-xs tracking-widest uppercase">
          Please also review our <Link href="/provider-privacy" className="text-blue-600 font-bold hover:text-blue-700">Provider Privacy Policy</Link>
        </p>
      </div>

    </div>
  );
}
