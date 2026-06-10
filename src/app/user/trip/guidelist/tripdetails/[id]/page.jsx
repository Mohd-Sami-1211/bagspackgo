'use client';
import { Suspense, useEffect, useState } from 'react';
import GuideDetails from 'src/components/home/TripSection/GuideDetails';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { useTripDetail } from '@/lib/useTripCache';

function TripDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get parameters from URL
  const category = searchParams.get('category') || 'individual';
  const days = searchParams.get('days') || '1';
  const count = searchParams.get('count') || '1';

  const { data: result, isLoading: loading } = useTripDetail(params.id);

  useEffect(() => {
    if (result) {
      if (result.success && result.data) {
        const found = result.data.find(g => g.id === params.id);
        if (found) {
          setGuide(found);
        } else {
          setGuide('not_found');
        }
      } else {
        setGuide('not_found');
      }
    }
  }, [result, params.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
      </div>
    );
  }

  if (guide === 'not_found' || !guide) {
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
    <Suspense fallback={
      <div className="fixed inset-0 z-50 bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
      </div>
    }>
      <TripDetailsContent />
    </Suspense>
  );
}