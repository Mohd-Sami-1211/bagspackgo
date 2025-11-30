'use client';
import { use, Suspense } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

function EventDetailsContent({ params }) {
  const [event, setEvent] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchEventAndGuide() {
      try {
        setLoading(true);
        
        // Option 1: Use populated event API (if you implement Solution 1)
        const eventRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getCompanyEvents?eventId=${id}`);
        const eventData = eventRes?.data?.data;
        
        if (!eventData) {
          setEvent(null);
          return;
        }
        
        setEvent(eventData);
        
        // Option 2: Fetch guide using eventId
        try {
          const guideRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guideInfo?eventId=${id}`);
          console.log(guideRes);
          setGuide(guideRes?.data?.data);
        } catch (guideError) {
          console.error('Error fetching guide:', guideError);
          // Guide is optional, continue without it
        }
        
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEventAndGuide();
  }, [id]);

  // Early return for loading
  if (loading) {
    return <LoadingSpinner />;
  }

  // Early return for not found
  if (!event) {
    notFound();
  }
  console.log(event)

  // Only render when we have data
  return (
    <EventDetails 
      event={event}
      guide={guide}
    />
  );
}

// Reusable loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

export default function EventDetailsPage({ params }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EventDetailsContent params={params} />
    </Suspense>
  );
}