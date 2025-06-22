'use client';
import { Suspense } from 'react';
import GuideDetails from '@/components/home/TripSection/GuideDetails';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import data from '@/data/data.json';

function TripDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const category = searchParams.get('category') || 'individual';
  const days = searchParams.get('days') || '1';
  const count = searchParams.get('count') || '1';

  // Find the guide
  const guide = data.guides.find(g => g.id === params.id);

  if (!guide) {
    notFound(); // This will show your 404 page if guide isn't found
  }

  return (
    <GuideDetails 
      guide={guide}
      category={category}
      days={days}
      count={count}
    />
  );
}

export default function TripDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading guide details...</div>}>
      <TripDetailsContent /> {/* Fixed: Was rendering GuideDetails directly */}
    </Suspense>
  );
}