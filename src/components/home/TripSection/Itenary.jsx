"use client";
import { MapPin, Hotel, Clock, Sparkles, Navigation } from "lucide-react";

const AGENDA_LABELS = {
  'arrival': 'Arrival & Check-in',
  'exploration': 'Exploration',
  'travel-day': 'Travel Day',
  'checkout': 'Exploration & Checkout'
};

const formatTimeWithAMPM = (time) => {
  if (!time || !time.toString().trim()) return "Not specified";
  const t = time.toString().trim();
  if (t.includes("AM") || t.includes("PM")) return t;
  // Only convert if it's a valid HH:MM format
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return t; // Return as-is (could be alphabets or any format)
  const hourNum = parseInt(match[1], 10);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum % 12 || 12;
  return `${displayHour}:${match[2]} ${ampm}`;
};

const Itenary = ({ day }) => {
  const formData = {
    destination: day.destination || "",
    location: day.location || "",
    agenda: day.agenda || "",
    travelFrom: day.travelFrom || "",
    travelTo: day.travelTo || "",
    pickupTime: day.pickupTime || "",
    checkinTime: day.checkinTime || "",
    isDayTrip: day.isDayTrip || false,
    hotelStars: day.hotelStars || "3",
    hotel: day.hotel || null,
    hotelPhotos: day.hotelPhotos || [],
    destinationPhotos: day.destinationPhotos || [],
    highlights: day.highlights?.filter((h) => h.trim()) || [],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-4 space-y-6 border border-gray-100">
      {/* Location Section */}
      <div className="flex items-start space-x-4">
        <MapPin className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h4 className="text-sm font-medium text-gray-700">Location</h4>
            {formData.agenda && (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                 {AGENDA_LABELS[formData.agenda.toLowerCase()] || formData.agenda.replace(/-/g, ' ')}
               </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5 mb-2">
            {formData.location || formData.destination || "Not selected"}
          </p>

          {formData.destinationPhotos?.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.destinationPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                >
                  <img
                    src={photo}
                    alt={`Location ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Highlights Section */}
      {formData.highlights.length > 0 && (
        <div className="flex items-start space-x-4">
          <Sparkles className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Highlights
            </h4>
            <ul className="space-y-1.5">
              {formData.highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 flex items-start"
                >
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2.5 mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Logistics Section */}
      <div className="flex items-start space-x-4">
        {formData.agenda === 'travel-day' || formData.isDayTrip ? (
           <Navigation className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
        ) : (
           <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
        )}
        <div>
          <h4 className="text-sm font-medium text-gray-700">
            {formData.agenda === 'arrival' ? 'Check-in Time' : 
             formData.agenda === 'travel-day' ? 'Travel Route & Time' : 'Pick-up Time'}
          </h4>
          <div className="text-sm text-gray-600 mt-0.5">
            {formData.agenda === 'travel-day' ? (
               <>
                 {formData.travelFrom && formData.travelTo ? (
                   <span className="block mb-1">Travelling from <strong>{formData.travelFrom}</strong> to <strong>{formData.travelTo}</strong></span>
                 ) : (
                   <span className="block mb-1 text-gray-400">Route not specified</span>
                 )}
                 {formData.pickupTime && (
                   <span className="block">Departure at {formatTimeWithAMPM(formData.pickupTime)}</span>
                 )}
               </>
            ) : (
               <span className="block">
                  {formData.agenda === 'arrival' && formData.checkinTime 
                    ? `Check-in at ${formatTimeWithAMPM(formData.checkinTime)}` 
                    : formData.pickupTime 
                      ? `Pick-up at ${formatTimeWithAMPM(formData.pickupTime)}` 
                      : <span className="text-gray-400">Time not specified</span>}
               </span>
            )}
            {formData.isDayTrip && (
               <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                 Day Trip
               </span>
            )}
          </div>
        </div>
      </div>

      {/* Hotel Section */}
      {formData.agenda !== 'checkout' && (
      <div className="flex items-start space-x-4">
        <Hotel className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700">Accommodation</h4>
          <p className="text-sm text-gray-600 mt-0.5 mb-2">
            {formData.hotel?.name
              ? <>{formData.hotel.name} {formData.hotelStars && <span className="font-semibold text-[#D4AF37] ml-1">({formData.hotelStars} Star <Hotel className="inline w-3 h-3 text-[#D4AF37]"/>)</span>}</>
              : "Accommodation not specified"}
          </p>

          {formData.hotelPhotos?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.hotelPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                >
                  <img
                    src={photo}
                    alt={`Hotel ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Itenary;
;
