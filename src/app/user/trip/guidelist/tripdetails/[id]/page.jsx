'use client';
import { Suspense, useEffect, useState } from 'react';
import GuideDetails from 'src/components/home/TripSection/GuideDetails';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { useTripDetail } from '@/lib/useTripCache';

function TripDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState(null);

  // Get parameters from URL
  const category = searchParams.get('category') || 'individual';
  const days = searchParams.get('days') || '1';
  const count = searchParams.get('count') || '1';

  const { data: result, isLoading: loading } = useTripDetail(params.id);

  useEffect(() => {
    if (result) {
      console.log('Result from API:', result);
      console.log('Looking for guide ID:', params.id);
      if (result.success && result.data) {
        const found = result.data.find(g => g.id === params.id || g._id === params.id || g.packages?.some(p => p.id === params.id || p._id === params.id));
        console.log('Found guide:', found ? 'yes' : 'no');
        if (found) {
          setGuide(found);
        } else {
          setGuide('not_found');
        }
      } else {
        console.log('Result not successful or no data');
        setGuide('not_found');
      }
    }
  }, [result, params.id]);

  if (loading || !result || !guide) {
    // Only show 404 if we explicitly set it to 'not_found'. Otherwise, keep loading.
    if (guide === 'not_found') {
      notFound();
    }
    return (
      <div className="fixed inset-0 z-50 bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
      </div>
    );
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