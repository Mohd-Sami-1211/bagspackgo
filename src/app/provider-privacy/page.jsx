'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ProviderPrivacyPage() {
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
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest mb-1.5">Service Provider Privacy Policy</h1>
              <p className="text-gray-400 font-medium text-xs tracking-wider uppercase">Last Updated: April 2026</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="space-y-8 text-gray-600 leading-relaxed font-medium text-sm sm:text-[15px]">
            
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">1. Information Collected</h2>
              <p className="mb-2">We collect the following information from service providers:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Personal and business details (name, company, contact information)</li>
                <li>Verification documents (government ID, business license)</li>
                <li>Performance data (ratings, reviews, booking history)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">2. Usage of Information</h2>
              <p className="mb-2">Provider information is used for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Verification and onboarding of service providers</li>
                <li>Payment processing and settlement</li>
                <li>Platform improvement and quality monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">3. Data Sharing</h2>
              <p className="mb-2">We may share limited provider data with:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-bold text-gray-900">Users</span> — limited profile information to help travelers choose providers</li>
                <li><span className="font-bold text-gray-900">Payment processors</span> — for secure and timely payment settlement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">4. Data Security</h2>
              <p className="mb-2">Reasonable measures are used to protect your data, including secure storage of verification documents and encrypted transmission of sensitive information.</p>
              <p>We regularly review our security practices to maintain data integrity.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-2.5">5. Provider Rights</h2>
              <p className="mb-2">As a service provider, you may:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Request updates or corrections to your business information.</li>
                <li>Request deletion of your provider account and associated data.</li>
              </ul>
              <p>To exercise these rights, please contact us at <a href="mailto:bagspackgo01@gmail.com" className="text-blue-600 font-bold hover:underline">support@bagspackgo.com</a>.</p>
            </section>

          </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="mt-8 text-center pb-8">
        <p className="text-gray-400 font-medium text-xs tracking-widest uppercase">
          Please also review our <Link href="/provider-terms" className="text-blue-600 font-bold hover:text-blue-700">Provider Terms</Link>
        </p>
      </div>

    </div>
  );
}
