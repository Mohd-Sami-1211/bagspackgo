'use client';
import { Suspense, useEffect, useState } from 'react';
import ReviewJourney from 'src/components/home/TripSection/ReviewJourney';
import { useSearchParams } from 'next/navigation';

export default function ReviewJourneyPage({ params }) {
  const searchParams = useSearchParams();
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tripData');
      setTripData(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.error('Could not restore trip details:', error);
      localStorage.removeItem('tripData');
      setTripData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) return <div>Loading journey details...</div>;

  return (
    <Suspense fallback={<div>Loading journey details...</div>}>
      <ReviewJourney 
        guide={tripData?.guide}
        tripData={tripData}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
