'use client';
import { use, Suspense, useEffect, useState } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound } from 'next/navigation';

function EventDetailsContent({ params }) {
  const { id } = use(params);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          setEvent(false); // Indicates not found
        }
      } catch (err) {
        console.error(err);
        setEvent(false);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (event === false) {
    // If not found from DB, try to fallback to data.json logic for old examples?
    // Let's just return a generic not found for now to enforce db logic
    notFound();
  }

  return (
    <EventDetails
      event={event}
    // For now we don't need 'guides' array since event.guide is populated
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