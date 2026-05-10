'use client';
import { Suspense, useEffect, useState } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound, useParams } from 'next/navigation';

function EventDetailsContent() {
  const params = useParams();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    async function fetchEvent() {
      let retries = 2;
      while (retries >= 0) {
        try {
          const res = await fetch(`/api/events/${id}`);
          if (res.status === 404) {
            setEvent(false);
            break;
          }
          if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
          }
          
          const text = await res.text();
          const data = JSON.parse(text);
          
          if (data.success && data.event) {
            setEvent(data.event);
          } else {
            setEvent(false); // Not found
          }
          break; // Success, exit loop
        } catch (err) {
          console.error(`Fetch attempt failed (${retries} retries left):`, err);
          if (retries === 0) {
            setEvent(false);
          } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
        retries--;
      }
      setLoading(false);
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

export default function EventDetailsPage() {
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
      <EventDetailsContent />
    </Suspense>
  );
}