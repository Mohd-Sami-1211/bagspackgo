'use client';
import { Suspense, useEffect, useState } from 'react';
import GuideDetails from 'src/components/home/TripSection/GuideDetails';
import { useParams, usePathname, useSearchParams, notFound } from 'next/navigation';
import { useTripDetail } from '@/lib/useTripCache';

function TripDetailsContent() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState(null);

  // Get parameters from URL
  const category = searchParams.get('category') || 'individual';
  const days = searchParams.get('days') || '1';
  const count = searchParams.get('count') || '1';
  const packageId = searchParams.get('packageId') || (pathname?.startsWith('/trip/') ? params.id : '');

  const { data: result, error, isLoading: loading } = useTripDetail(params.id, packageId);

  useEffect(() => {
    if (result) {
      if (result.success && result.data) {
        const found = result.data.find(g => g.id === params.id || g._id === params.id || g.packages?.some(p => p.id === params.id || p._id === params.id));
        if (found) {
          setGuide(found);
        } else {
          setGuide('not_found');
        }
      } else {
        setGuide('not_found');
      }
    }
  }, [result, params.id, packageId]);

  if (error) notFound();

  if (loading || !result || !guide) {
    // Only show 404 if we explicitly set it to 'not_found'. Otherwise, keep loading.
    if (guide === 'not_found') {
      notFound();
    }
    return (
      <div className="min-h-screen w-full bg-[#f4f3ee]">
        <div className="h-[52vh] min-h-[430px] animate-pulse bg-gradient-to-br from-[#17372f] via-[#234f43] to-[#0b1714]" />
        <div className="mx-auto -mt-20 grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_360px]">
          <div className="h-72 animate-pulse rounded-[2rem] bg-white shadow-xl" />
          <div className="h-72 animate-pulse rounded-[2rem] bg-white shadow-xl" />
        </div>
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
      <div className="min-h-screen bg-[#f4f3ee]">
        <div className="h-[52vh] min-h-[430px] animate-pulse bg-gradient-to-br from-[#17372f] via-[#234f43] to-[#0b1714]" />
      </div>
    }>
      <TripDetailsContent />
    </Suspense>
  );
}
