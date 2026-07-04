'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound, useParams } from 'next/navigation';
import { RefreshCw, WifiOff } from 'lucide-react';

function EventDetailsContent() {
  const params = useParams();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // 'idle' | 'loading' | 'not_found' | 'error'
  const [fetchState, setFetchState] = useState('loading');

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setFetchState('loading');

    let retries = 2;
    while (retries >= 0) {
      // Per-attempt 8-second timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(`/api/events/${id}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // True 404 — event doesn't exist, no point retrying
        if (res.status === 404) {
          setFetchState('not_found');
          setEvent(false);
          break;
        }

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        if (data.success && data.event) {
          setEvent(data.event);
          setFetchState('idle');
        } else {
          // API returned 200 but said not found
          setFetchState('not_found');
          setEvent(false);
        }
        break; // success — exit loop

      } catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err.name === 'AbortError';
        console.error(
          `Event fetch attempt failed (${retries} retries left)${isAbort ? ' — timed out' : ''}:`,
          err
        );

        if (retries === 0) {
          // All retries exhausted — show retryable error UI
          setFetchState('error');
          setEvent(null);
        } else {
          // Wait 800ms before next retry
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
      retries--;
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-md px-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  /* ── True 404 — event doesn't exist ── */
  if (fetchState === 'not_found') {
    notFound();
  }

  /* ── Transient server error / timeout — let the user retry ── */
  if (fetchState === 'error') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-6 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Couldn&apos;t load event</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            The server took too long to respond. This is usually temporary — please try again.
          </p>
        </div>
        <button
          onClick={fetchEvent}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  /* ── Event loaded successfully ── */
  return <EventDetails event={event} />;
}

const LoadingSkeleton = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-md px-6">
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EventDetailsContent />
    </Suspense>
  );
}