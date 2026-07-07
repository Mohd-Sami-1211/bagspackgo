'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound, useParams } from 'next/navigation';
import { RefreshCw, WifiOff } from 'lucide-react';

function EventDetailsContent() {
  const params = useParams();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  // 'loading' | 'idle' | 'not_found' | 'error'
  const [fetchState, setFetchState] = useState('loading');

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setFetchState('loading');

    let retries = 3;
    while (retries >= 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(`/api/events/${id}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.status === 404) {
          setFetchState('not_found');
          setEvent(null);
          break;
        }

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data = await res.json();

        if (data.success && data.event) {
          setEvent(data.event);
          setFetchState('idle');
        } else {
          setFetchState('not_found');
          setEvent(null);
        }
        break;

      } catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err.name === 'AbortError';
        console.error(
          `Event fetch attempt failed (${retries} retries left)${isAbort ? ' — timed out' : ''}:`,
          err
        );
        if (retries === 0) {
          setFetchState('error');
          setEvent(null);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
      retries--;
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  /* ── True 404 — event doesn't exist ── */
  if (fetchState === 'not_found') {
    notFound();
  }

  /* ── Transient server error — retryable ── */
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

  /* ── Render immediately: skeleton while loading, real content once ready ── */
  return <EventDetails event={event} loading={fetchState === 'loading'} onRetry={fetchEvent} />;
}

export default function EventDetailsPage() {
  return (
    <Suspense>
      <EventDetailsContent />
    </Suspense>
  );
}