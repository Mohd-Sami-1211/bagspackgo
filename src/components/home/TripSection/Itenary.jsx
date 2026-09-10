"use client";
import { MapPin, Hotel, Clock, Sparkles, Navigation, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ProgressiveImage from "@/components/common/ProgressiveImage";
import { useTripItineraryPhotos } from "@/lib/useTripCache";

const AGENDA_LABELS = {
  'arrival': 'Arrival & Check-in',
  'exploration': 'Exploration',
  'travel-day': 'Travel Day',
  'checkout': 'Exploration & Checkout'
};

const formatTimeWithAMPM = (time) => {
  if (!time || !time.toString().trim()) return "";
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

const Itenary = ({ day, packageId, dayIndex }) => {
  const [activePhoto, setActivePhoto] = useState(null);
  const [shouldLoadMedia, setShouldLoadMedia] = useState(false);
  const detailsRef = useRef(null);
  const { data: photosData } = useTripItineraryPhotos(shouldLoadMedia ? packageId : null, dayIndex);
  const dayItinPhotos = photosData?.data?.itineraryPhotos?.find(p => p.dayIndex === dayIndex);
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
    hotelPhotos: dayItinPhotos?.hotelPhotos || day.hotelPhotos || [],
    destinationPhotos: dayItinPhotos?.destinationPhotos || day.destinationPhotos || [],
    highlights: day.highlights?.filter((h) => h.trim()) || [],
  };
  const route = [formData.travelFrom, formData.travelTo].filter(Boolean).join(" → ");
  const relevantTime = formData.agenda === 'arrival' ? formData.checkinTime : formData.pickupTime;
  const showLogistics = Boolean(route || relevantTime || formData.isDayTrip);
  const logisticsTitle = route
    ? (relevantTime ? 'Route & schedule' : 'Route')
    : relevantTime
      ? (formData.agenda === 'arrival' ? 'Check-in time' : formData.agenda === 'travel-day' ? 'Departure time' : 'Pick-up time')
      : 'Day trip';

  useEffect(() => {
    const target = detailsRef.current;
    if (!target || shouldLoadMedia) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoadMedia(true);
      observer.disconnect();
    }, { rootMargin: "180px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadMedia]);

  useEffect(() => {
    if (!activePhoto) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActivePhoto(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activePhoto]);

  return (
    <div ref={detailsRef} className="bg-white rounded-xl shadow-sm p-6 mt-4 space-y-6 border border-gray-100">
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
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhoto(photo)}
                  className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 shadow-sm"
                  aria-label={`Open location photo ${idx + 1}`}
                >
                  <img
                    src={photo}
                    alt={`Location ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition group-hover:bg-black/20"><ZoomIn className="h-5 w-5 opacity-0 transition group-hover:opacity-100" /></span>
                </button>
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
      {showLogistics && (
      <div className="flex items-start space-x-4">
        {formData.agenda === 'travel-day' || formData.isDayTrip ? (
           <Navigation className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
        ) : (
           <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
        )}
        <div>
          <h4 className="text-sm font-medium text-gray-700">
            {logisticsTitle}
          </h4>
          <div className="text-sm text-gray-600 mt-0.5">
            {route && <span className="mb-1 block font-semibold">{route}</span>}
            {relevantTime && <span className="block">
              {formData.agenda === 'arrival'
                ? `Check-in at ${formatTimeWithAMPM(formData.checkinTime)}`
                : formData.agenda === 'travel-day'
                  ? `Departure at ${formatTimeWithAMPM(formData.pickupTime)}`
                  : `Pick-up at ${formatTimeWithAMPM(formData.pickupTime)}`}
            </span>}
            {formData.isDayTrip && (
               <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                 Day Trip
               </span>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Hotel Section */}
      {formData.agenda !== 'checkout' && (formData.hotel?.name || formData.hotelPhotos?.length > 0) && (
      <div className="flex items-start space-x-4">
        <Hotel className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-700">Accommodation</h4>
          <p className="text-sm text-gray-600 mt-0.5 mb-2">
            {formData.hotel?.name && <>{formData.hotel.name} {formData.hotelStars && <span className="font-semibold text-[#D4AF37] ml-1">({formData.hotelStars} Star <Hotel className="inline w-3 h-3 text-[#D4AF37]"/>)</span>}</>}
          </p>

          {formData.hotelPhotos?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.hotelPhotos.map((photo, idx) => (
                <button key={idx} type="button" onClick={() => setActivePhoto(photo)} className="group relative overflow-hidden rounded-lg" aria-label={`Open hotel photo ${idx + 1}`}>
                  <ProgressiveImage
                    src={photo}
                    thumbnail={null}
                    alt={`Hotel ${idx + 1}`}
                    className="aspect-video rounded-lg border border-gray-200 shadow-sm group"
                    imgClassName="group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition group-hover:bg-black/20"><ZoomIn className="h-5 w-5 opacity-0 transition group-hover:opacity-100" /></span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {activePhoto && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Day photo preview" onClick={() => setActivePhoto(null)}>
          <button type="button" onClick={() => setActivePhoto(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20" aria-label="Close photo"><X className="h-5 w-5" /></button>
          <img src={activePhoto} alt="Expanded itinerary view" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default Itenary;
;
