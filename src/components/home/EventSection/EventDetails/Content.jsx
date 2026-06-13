// components/home/EventSection/EventDetailsContent.jsx
import { CheckCircle, XCircle, Info, AlertCircle, FileText, Sparkles } from 'lucide-react';
import Faq from './Faq';
import Tabs from './Tabs';

export default function Content({ event }) {
  
  const Tab1 = (
    <div className="w-full min-w-0 overflow-hidden break-words space-y-8">
      {/* About */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-emerald-600 mb-3 border-b-2 border-gray-50 pb-2">About This Event</h2>
        <div className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
          {event.about || 'No description provided.'}
        </div>
      </div>

      {/* Photographs Gallery */}
      {event.photographs?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-gray-900" size={20} /> Gallery
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {event.photographs.map((photo, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-100"
              >
                <img src={photo} alt={`Event photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {event.highlights?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} /> Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {event.highlights.map((h, i) => h && (
              <div key={i} className="flex items-center gap-2.5 text-gray-700 bg-amber-50/60 p-3 rounded-lg border border-amber-100 max-w-full overflow-hidden">
                <CheckCircle className="text-amber-500 flex-shrink-0" size={16} />
                <span className="break-words w-full text-sm">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's Included */}
      {event.whatsIncluded?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-gray-900" size={20} /> What&apos;s Included
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {event.whatsIncluded.map((item, i) => item && (
              <div key={i} className="flex items-center gap-2.5 text-gray-700 bg-gray-50/60 p-3 rounded-lg border border-gray-200 max-w-full overflow-hidden">
                <CheckCircle className="text-gray-900 flex-shrink-0" size={16} />
                <span className="break-words w-full text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's Excluded */}
      {event.whatsExcluded?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="text-red-500" size={20} /> What&apos;s Excluded
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {event.whatsExcluded.map((item, i) => item && (
              <div key={i} className="flex items-center gap-2.5 text-gray-700 bg-red-50/60 p-3 rounded-lg border border-red-100 max-w-full overflow-hidden">
                <XCircle className="text-red-400 flex-shrink-0" size={16} />
                <span className="break-words w-full text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // -- TAB 2: Itinerary --
  const Tab2 = (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-emerald-600 mb-2 border-b-2 border-gray-50 pb-2">Event Itinerary</h2>
      {event.itinerary?.length > 0 ? (
        <div className="relative pl-6 border-l-2 border-gray-200 space-y-6 py-4">
          {event.itinerary.map((step, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">Step {i + 1}</span>
                </div>
                <p className="text-gray-700 font-medium text-sm sm:text-base">{step}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <Info size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">Itinerary details will be updated soon.</p>
        </div>
      )}
    </div>
  );

  // -- TAB 3: Important Info & FAQs --
  const Tab3 = (
    <div className="space-y-8">
      {/* What to Bring */}
      <div className="bg-blue-50 p-5 sm:p-6 rounded-2xl border border-blue-100 shadow-sm">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Info size={20} /> What to Bring
        </h3>
        {event.whatToBring?.length > 0 ? (
          <ul className="space-y-2">
            {event.whatToBring.map((item, i) => item && (
              <li key={i} className="flex items-start gap-2.5 text-blue-700 text-sm leading-relaxed">
                <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-blue-600 text-sm">Nothing specific mentioned.</p>
        )}
      </div>

      {/* Restrictions */}
      <div className="bg-rose-50 p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-base sm:text-lg">
          <AlertCircle size={20} /> Essential Restrictions
        </h3>
        {event.restrictions?.length > 0 ? (
          <ul className="space-y-2">
            {event.restrictions.map((item, i) => item && (
              <li key={i} className="flex items-start gap-2.5 text-rose-700 text-sm leading-relaxed">
                <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-rose-600 text-sm">No specific restrictions mentioned.</p>
        )}
      </div>

      {/* Terms & Conditions */}
      {event.termsAndConditions?.length > 0 && (
        <div className="bg-amber-50 p-5 sm:p-6 rounded-2xl border border-amber-100 shadow-sm">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-base sm:text-lg">
            <FileText size={20} className="text-amber-600" /> Terms & Conditions
          </h3>
          <ol className="space-y-2.5">
            {event.termsAndConditions.map((tc, i) => (
              <li key={i} className="flex items-start gap-2.5 text-amber-800 text-sm leading-relaxed">
                <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{tc}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* FAQs */}
      <Faq faqs={event.faqs} />
    </div>
  );

  return (
    <Tabs tab1={Tab1} tab2={Tab2} tab3={Tab3} />
  );
}