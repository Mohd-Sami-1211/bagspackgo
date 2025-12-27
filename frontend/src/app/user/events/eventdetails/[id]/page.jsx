'use client';
import { use, Suspense } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Script from 'next/script';
import { RAZORPAY_SCRIPT } from 'src/lib/constants';
function EventDetailsContent({ params }) {
  const [event, setEvent] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchEventAndGuide() {
      try {
        setLoading(true);
        const eventRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getCompanyEvents?eventId=${id}`);
        const eventData = eventRes?.data?.data;
        
        if (!eventData) {
          setEvent(null);
          return;
        }
        
        setEvent(eventData);
        try {
          const guideRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guideInfo?eventId=${id}`);
          console.log(guideRes);
          setGuide(guideRes?.data?.data);
        } catch (guideError) {
          console.error('Error fetching guide:', guideError);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    notFound();
  }
  console.log(event)

  return (
    <>
      <Script src={RAZORPAY_SCRIPT} />
      <EventDetails 
        event={event}
        guide={guide}
      />
    </>
   
  );
}

export const LoadingSpinner = () => (
  <div className="max-w-7xl mx-auto mt-8 py-2 px-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg overflow-hidden mb-40">
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      {/* Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-green-500 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
      </div>
      
      {/* Optional loading text */}
      <p className="text-gray-600 font-medium">Loading</p>
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