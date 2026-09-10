"use client";

import { CalendarDays, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef } from "react";
import Itenary from "./Itenary";

const AGENDA_LABELS = {
  arrival: "Arrival & check-in",
  exploration: "Exploration",
  "travel-day": "Travel day",
  checkout: "Exploration & checkout",
};

function agendaLabel(agenda) {
  if (!agenda) return "Day plan";
  return AGENDA_LABELS[agenda.toLowerCase()] || agenda.replace(/-/g, " ");
}

function compactDate(day) {
  const parsedDate = new Date(day.rawDate || day.date || "");
  if (Number.isNaN(parsedDate.getTime())) return "";
  const weekday = parsedDate.toLocaleDateString("en-US", { weekday: "short" });
  const month = parsedDate.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} ${parsedDate.getDate()}-${month}`;
}

export default function PackageItinerary({ days, activeDay, onDayChange, packageId }) {
  const mobileListRef = useRef(null);
  const mobileButtonRefs = useRef([]);
  const focusedDay = days[activeDay - 1] || days[0];

  useEffect(() => {
    if (days.length && activeDay > days.length) {
      onDayChange(1);
      return;
    }

    const button = mobileButtonRefs.current[activeDay - 1];
    const list = mobileListRef.current;
    if (!button || !list) return;

    const left = button.offsetLeft - (list.clientWidth - button.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeDay, days.length, onDayChange]);

  if (!focusedDay) {
    return <p className="rounded-2xl bg-[#edf3ee] p-5 text-sm text-[#61716c]">The itinerary will appear here once it is added.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-6">
      <aside className="min-w-0">
        <div
          ref={mobileListRef}
          className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:max-h-[680px] md:flex-col md:overflow-y-auto md:pb-0 md:pr-1"
          aria-label="Choose itinerary day"
        >
          {days.map((day, index) => {
            const dayNumber = index + 1;
            const isFocused = dayNumber === activeDay;
            const route = [day.travelFrom, day.travelTo].filter(Boolean).join(" → ");
            const displayDate = compactDate(day);

            return (
              <button
                key={day.dayNumber || dayNumber}
                ref={(element) => { mobileButtonRefs.current[index] = element; }}
                type="button"
                onClick={() => onDayChange(dayNumber)}
                className={`w-[158px] shrink-0 snap-center rounded-2xl border p-3 text-left transition md:w-full md:p-4 ${isFocused
                  ? "border-[#17372f] bg-[#17372f] text-white shadow-[0_14px_30px_-20px_rgba(23,55,47,0.9)]"
                  : "border-[#17372f]/10 bg-[#f7f8f5] text-[#17372f] hover:border-[#17372f]/25 hover:bg-[#edf3ee]"
                }`}
                aria-pressed={isFocused}
              >
                <span className={`text-[10px] font-extrabold tracking-[0.08em] ${isFocused ? "text-emerald-200" : "text-[#8b9a94]"}`}>Day {dayNumber}{displayDate ? ` · ${displayDate}` : ""}</span>
                <span className="mt-1.5 flex items-start gap-1.5 text-sm font-bold leading-5">
                  <MapPin className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isFocused ? "text-emerald-300" : "text-[#1d6b55]"}`} />
                  <span className="line-clamp-2">{day.location || day.destination || `Day ${dayNumber}`}</span>
                </span>
                <span className={`mt-2 block truncate text-[11px] capitalize ${isFocused ? "text-white/65" : "text-[#788781]"}`}>{agendaLabel(day.agenda)}</span>
                {route && (
                  <span className={`mt-2 flex items-center gap-1.5 text-[11px] leading-4 ${isFocused ? "text-emerald-100" : "text-[#61716c]"}`}>
                    <Navigation className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">{route}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0 rounded-[1.4rem] border border-[#17372f]/10 bg-[#fbfcfa] p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h4 className="font-serif text-2xl tracking-[-0.025em] text-[#17372f] sm:text-3xl">Day {activeDay} · {focusedDay.location || focusedDay.destination}</h4>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-bold capitalize text-[#1d6b55]"><CalendarDays className="h-3.5 w-3.5" /> {agendaLabel(focusedDay.agenda)}</span>
        </div>

        <Itenary day={focusedDay} packageId={packageId} dayIndex={activeDay - 1} />
      </section>
    </div>
  );
}
