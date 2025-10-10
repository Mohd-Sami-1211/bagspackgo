'use client';
import { use, Suspense } from 'react';
import EventDetails from 'frontend/src/components/home/EventSection/EventDetails';
import { notFound } from 'next/navigation';
import data from '@/data/data.json';

function EventDetailsContent({ params }) {
  // Unwrap the params promise
  const { id } = use(params);
  
  // Find the event by ID
  const event = data.events.find(e => e.id === id);
  const guides = data.guides;

  if (!event) {
    notFound();
  }

  return (
    <EventDetails 
      event={event}
      guides={guides}
    />
  );
}

export default function EventDetailsPage({ params }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    }>
      <EventDetailsContent params={params} />
    </Suspense>
  );
}