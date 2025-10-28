'use client';
import { Suspense, useEffect, useState } from 'react';
import ReviewTrek from 'src/components/home/TrekSection/ReviewJourney';
import { useSearchParams } from 'next/navigation';

function ReviewJourneyContent() {
  const searchParams = useSearchParams();
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('trekData');
      if (storedData) {
        try {
          setTripData(JSON.parse(storedData));
        } catch (error) {
          console.error("Error parsing trek data:", error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading journey details...</div>;
  }

  if (!tripData) {
    return <div>No trek data found. Please start your booking process again.</div>;
  }

  return (
    <ReviewTrek 
      guide={tripData.guide} 
      searchParams={searchParams}
    />
  );
}

export default function ReviewJourneyPage() {
  return (
    <Suspense fallback={<div>Loading journey details...</div>}>
      <ReviewJourneyContent />
    </Suspense>
  );
}