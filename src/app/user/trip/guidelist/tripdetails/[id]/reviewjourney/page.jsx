'use client';
import { Suspense } from 'react';
import ReviewJourney from 'src/components/home/TripSection/ReviewJourney';
import { useSearchParams } from 'next/navigation';

export default function ReviewJourneyPage({ params }) {
  const searchParams = useSearchParams();
  
  // Get guide data from localStorage (stored when navigating from GuideDetails)
  const tripData = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('tripData') || {})
    : {};

  return (
    <Suspense fallback={<div>Loading journey details...</div>}>
      <ReviewJourney 
        guide={tripData.guide} 
        tripData={tripData}
        searchParams={searchParams}
      />
    </Suspense>
  );
}