'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import EventCard from './EventCard';

export default function LiveEventsSection({ events, showViewAll = true, onViewAll }) {
  if (!events.length) return null;

  const ViewAll = onViewAll ? 'button' : Link;
  const viewAllProps = onViewAll
    ? { type: 'button', onClick: onViewAll }
    : { href: '/user/events' };

  return (
    <section aria-label="Live Events" className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-normal tracking-[-0.035em] text-[#17372f] sm:text-4xl">Live Events</h2>
          {showViewAll && (
            <ViewAll {...viewAllProps} className="group flex items-center gap-1.5 text-sm font-semibold text-[#1d6b55] transition-colors hover:text-[#124838]">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </ViewAll>
          )}
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8"
        >
          {events.map(event => <EventCard key={event.id} event={event} />)}
        </motion.div>
      </div>
    </section>
  );
}
