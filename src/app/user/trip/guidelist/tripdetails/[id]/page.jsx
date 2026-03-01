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
    return <div className="flex justify-center items-center min-h-[50vh]">Loading guide details...</div>;
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
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Loading...</div>}>
      <TripDetailsContent />
    </Suspense>
  );
}