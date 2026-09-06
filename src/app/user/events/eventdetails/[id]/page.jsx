'use client';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import EventDetails from 'src/components/home/EventSection/EventDetails';
import { notFound, useParams } from 'next/navigation';
import { Loader2, WifiOff } from 'lucide-react';

function EventDetailsContent() {
  const params = useParams();
  const id = params?.id;

  const [event, setEvent] = useState(null);
  // 'loading' | 'idle' | 'not_found' | 'slow'
  const [fetchState, setFetchState] = useState('loading');
  const isMounted = useRef(true);
  const slowTimer = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; clearTimeout(slowTimer.current); };
  }, []);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setFetchState('loading');

    // After 12 seconds of loading, show the slow-connection message
    slowTimer.current = setTimeout(() => {
      if (isMounted.current) setFetchState('slow');
    }, 12000);

    let attempt = 0;

    while (isMounted.current) {
      attempt++;
      const controller = new AbortController();
      // Progressive timeout: 15s → 25s → 40s → 60s
      const timeout = Math.min(15000 + (attempt - 1) * 10000, 60000);
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(`/api/events/${id}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!isMounted.current) return;

        if (res.status === 404) {
          clearTimeout(slowTimer.current);
          setFetchState('not_found');
          setEvent(null);
          return;
        }

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data = await res.json();
        if (!isMounted.current) return;

        if (data.success && data.event) {
          clearTimeout(slowTimer.current);
          setEvent(data.event);
          setFetchState('idle');
          return;
        } else {
          clearTimeout(slowTimer.current);
          setFetchState('not_found');
          setEvent(null);
          return;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (!isMounted.current) return;
        console.warn(`Event fetch attempt #${attempt} failed:`, err.message);

        // Exponential backoff: 1s → 2s → 4s → 8s (capped)
        const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  /* ── True 404 ── */
  if (fetchState === 'not_found') {
    notFound();
  }

  /* ── Loading / Slow — same spinner, slow just adds a message ── */
  if (fetchState === 'loading' || fetchState === 'slow') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-5 px-6 text-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        {fetchState === 'slow' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <WifiOff className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-gray-700">It&apos;s taking more time than usual</p>
            </div>
            <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
              Your internet might be slow. Please wait, we&apos;re loading this for you.
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Content loaded ── */
  return <EventDetails event={event} loading={false} onRetry={fetchEvent} />;
}

export default function EventDetailsPage() {
  return (
    <Suspense>
      <EventDetailsContent />
    </Suspense>
  );
}