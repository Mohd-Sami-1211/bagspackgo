'use client';
import { Suspense } from 'react';
import MergerDetails from 'frontend/src/components/home/MergerSection/MergerDetails';
import { useParams, notFound } from 'next/navigation';
import data from '@/data/data.json';

function MergerDetailsContent() {
  const params = useParams();
  
  // Find the merger
  const merger = data.mergers.find(m => m.id === params.id);
  const guides = data.guides;

  if (!merger) {
    notFound();
  }

  return (
    <MergerDetails 
      merger={merger}
      guides={guides}
    />
  );
}

export default function MergerDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading merger details...</div>}>
      <MergerDetailsContent />
    </Suspense>
  );
}