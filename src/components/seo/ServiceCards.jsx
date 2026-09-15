import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Compass, Headphones, Luggage } from 'lucide-react';
import { travelServices } from '@/data/travelGuides';

const icons = { trips: Luggage, offbeats: Compass, events: CalendarDays, companion: Headphones };

export default function ServiceCards({ services }) {
  return <div className="grid gap-5 md:grid-cols-2">
    {services.map(key => {
      const service = travelServices[key];
      const Icon = icons[key];
      return <Link key={key} href={service.href} className="group flex flex-col rounded-3xl border border-[#17372f]/15 bg-white p-7 transition hover:border-[#17372f]/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17372f] sm:p-8">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-3 text-sm font-semibold text-[#17372f]"><Icon size={21} aria-hidden="true" />{service.name}</span>
          <ArrowUpRight size={22} className="text-[#8c6939] transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
        </div>
        <h3 className="mt-6 font-serif text-3xl leading-tight text-[#17372f]">{service.title}</h3>
        <p className="mb-7 mt-4 leading-7 text-slate-600">{service.description}</p>
        <span className="mt-auto text-sm font-bold text-[#17372f] underline decoration-[#17372f]/25 underline-offset-4">{service.action}</span>
      </Link>;
    })}
  </div>;
}
