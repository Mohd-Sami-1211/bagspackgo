'use client';
import { Suspense, useEffect, useState } from 'react';
import GuideDetails from 'src/components/home/TripSection/GuideDetails';
import { useParams, useSearchParams, notFound } from 'next/navigation';

function TripDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get parameters from URL
  const category = searchParams.get('category') || 'individual';
  const days = searchParams.get('days') || '1';
  const count = searchParams.get('count') || '1';

  useEffect(() => {
    async function fetchGuide() {
      try {
        const res = await fetch('/api/public/trips');
        const json = await res.json();
        if (json.success && json.data) {
          const found = json.data.find(g => g.id === params.id);
          if (found) {
            setGuide(found);
          } else {
            setGuide('not_found');
          }
        }
      } catch (err) {
        console.error(err);
        setGuide('not_found');
      } finally {
        setLoading(false);
      }
    }
    fetchGuide();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4 -mt-20">
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
      <div className="min-h-screen bg-[#F2FFFC] w-full flex flex-col items-center justify-center gap-4 -mt-20">
        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading package details...</p>
      </div>
    }>
      <TripDetailsContent />
    </Suspense>
  );
}