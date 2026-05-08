"use client";
import React from "react";
import { Clock, Sparkles, Camera } from "lucide-react";

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

const TrekItenary = ({ day }) => {
  const title = day.title || `Day ${day.dayNumber || day.day || 1}`;

  // Extract sections correctly: from highlights array if it exists, or splitting the agenda string
  let sections = [];
  if (day.highlights && day.highlights.length > 0) {
    sections = day.highlights;
  } else if (day.agenda) {
    sections = day.agenda.split('|').map(s => s.trim()).filter(Boolean);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-4 space-y-6 border border-gray-100">
      {/* Day Header - Similar to Trip's Location Section layout */}
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white text-sm font-bold shrink-0 shadow-sm">
          {day.dayNumber || day.day || 1}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h4 className="text-[15px] font-bold text-gray-900 tracking-tight mt-1">
              {title}
            </h4>
            {day.date && (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 mt-1">
                 {day.date}
               </span>
            )}
          </div>
          {day.description && (
            <p className="text-sm text-gray-600 mt-2 mb-2">
              {day.description}
            </p>
          )}
        </div>
      </div>

      {/* Sections / Highlights */}
      {sections.length > 0 && (
        <div className="flex items-start space-x-4">
          <Sparkles className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Highlights
            </h4>
            <ul className="space-y-1.5">
              {sections.map((section, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2.5 mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed whitespace-pre-line">{section}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Logistics Section like Trip */}
      {day.pickupTime && (
        <div className="flex items-start space-x-4">
          <Clock className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">
              Pick-up Time
            </h4>
            <div className="text-sm text-gray-600 mt-0.5">
              <span className="block">
                Pick-up at {formatTimeWithAMPM(day.pickupTime)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Photos Row like Trip */}
      {day.photos?.length > 0 && (
        <div className="flex items-start space-x-4">
          <Camera className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Trek Views</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {day.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                >
                  <img
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrekItenary;