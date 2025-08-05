
'use client';
import { Suspense, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import data from '@/data/data.json';
import PersonalDetails from '@/components/home/MergerSection/PersonalDetails';

function PersonalDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const mergerId = params.id;
  const category = searchParams.get('category') || 'individual';
  const count = searchParams.get('count') || '1';

  // Find the merger
  const merger = data.mergers.find(m => m.id === mergerId);
  const guide = data.guides.find(g => g.id === merger?.guideId);

  if (!merger) {
    return <div className="flex justify-center items-center min-h-[50vh]">Merger not found</div>;
  }

  return (
    <PersonalDetails 
      merger={merger}
      guide={guide}
      category={category}
      count={parseInt(count)}
    />
  );
}

export default function PersonalDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading personal details form...</div>}>
      <PersonalDetailsContent />
    </Suspense>
  );
}