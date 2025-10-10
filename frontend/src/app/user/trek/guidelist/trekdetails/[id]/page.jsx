'use client';
import { Suspense } from 'react';
import TrekGuideDetails from 'frontend/src/components/home/TrekSection/GuideDetails';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import data from '@/data/data.json';

function TrekDetailsContent() {
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
    <TrekGuideDetails 
      guide={guide}
      category={category}
      days={days}
      count={count}
    />
  );
}

export default function TrekDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading guide details...</div>}>
      <TrekDetailsContent /> {/* Fixed: Was rendering GuideDetails directly */}
    </Suspense>
  );
}