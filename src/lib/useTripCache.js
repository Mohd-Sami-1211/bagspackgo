import useSWR from 'swr';

// ── Default SWR fetcher ─────────────────────────────────────────────────────
const fetcher = (url) => fetch(url).then((r) => r.json());

// ── Events listing cache (server-side filtered + paginated) ─────────────────
// Caches per unique query string. keepPreviousData keeps old data visible
// while the next page/filter loads — no blank white screen.
// Pass null to skip fetching entirely (deferred loading).
export function useEventsList(queryParams = {}, options = {}) {
    if (queryParams === null) {
        // Conditional fetch: pass null key to SWR to skip
        return useSWR(null, fetcher, { revalidateOnFocus: false, ...options });
    }
    const cleaned = Object.fromEntries(
        Object.entries(queryParams).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const queryString = new URLSearchParams(cleaned).toString();
    const url = `/api/events${queryString ? `?${queryString}` : ''}`;
    return useSWR(url, fetcher, {
        dedupingInterval: 30000,   // 30s — matches CDN s-maxage
        keepPreviousData: true,      // show stale data while revalidating (smooth pagination)
        revalidateOnFocus: false,    // don't refetch just because user switched tabs
        ...options,
    });
}

// ── Single event detail cache ───────────────────────────────────────────────
export function useEventDetail(id, options = {}) {
    const url = id ? `/api/events/${id}` : null;
    return useSWR(url, fetcher, {
        dedupingInterval: 120000,  // 2 min
        revalidateOnFocus: false,
        ...options,
    });
}

// Helper hook for general fetch
export function useFetchData(url, options = {}) {
    return useSWR(url, { ...options });
}

// 1. Trips listing cache
export function useTripPackages(queryParams, options = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `/api/public/trips${queryString ? `?${queryString}` : ''}`;
    return useSWR(url, { ...options, dedupingInterval: 60000 }); // Cache trips for 60 seconds
}

// 2. Specific trip package cache
export function useTripDetail(id, options = {}) {
    // Note: If you want to use the /api/public/trips endpoint with a specific ID filter
    const url = id ? `/api/public/trips?id=${id}` : null;
    return useSWR(url, { ...options, dedupingInterval: 120000 }); // 2 mins
}

// 2.5 Package Photos Cache (Background fetch for Base64)
export function useTripPhotos(packageId, options = {}) {
    const url = packageId ? `/api/public/trips/photos?packageId=${packageId}` : null;
    return useSWR(url, { ...options, dedupingInterval: 300000 }); // Cache photos for 5 mins
}

// 2.6 Event Photos Cache (Background fetch for Base64 gallery images)
export function useEventPhotos(eventId, options = {}) {
    const url = eventId ? `/api/events/${eventId}/photos` : null;
    return useSWR(url, { ...options, dedupingInterval: 300000 }); // Cache photos for 5 mins
}

// 2.7 Event Sponsors Cache (Background fetch for Base64 logo images)
export function useEventSponsors(eventId, options = {}) {
    const url = eventId ? `/api/events/${eventId}/sponsors` : null;
    return useSWR(url, { ...options, dedupingInterval: 300000 }); // Cache sponsors for 5 mins
}

// 3. Saved items IDs cache
// Useful to prevent fetching full saved items just to check if saved
export function useSavedItemIds(options = {}) {
    // Assuming you have an API that returns just IDs, but let's fall back to /api/user/saved for now
    const url = '/api/user/saved';
    return useSWR(url, { ...options, dedupingInterval: 30000 });
}

// 4. Provider profile cache
export function useProviderProfile(id, options = {}) {
    const url = id ? `/api/user/provider/${id}` : null;
    return useSWR(url, { ...options, dedupingInterval: 300000 }); // 5 minutes
}

// 5. User bookings cache
export function useUserBookings(options = {}) {
    return useSWR('/api/user/trip-bookings', { ...options });
}

// 6. Booking Pass cache
export function useBookingPass(id, options = {}) {
    const url = id ? `/api/public/pass/${id}` : null;
    return useSWR(url, { ...options, dedupingInterval: 600000 }); // 10 minutes cache for pass
}

// 7. Offbeat destinations listing cache (paginated, lightweight — no photos[] or heavy fields)
export function useOffbeatList(queryParams = {}, options = {}) {
    const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(queryParams).filter(([, v]) => v !== undefined && v !== null))
    ).toString();
    const url = `/api/public/offbeats${queryString ? `?${queryString}` : ''}`;
    return useSWR(url, { ...options, dedupingInterval: 60000 }); // Cache list for 60s
}

// 8. Offbeat destination detail cache (full document with all photos/videos)
export function useOffbeatDetail(id, options = {}) {
    const url = id ? `/api/public/offbeats/${id}` : null;
    return useSWR(url, { ...options, dedupingInterval: 120000 }); // Cache detail for 2 mins
}

// 8.5 Offbeat Photos Cache (Background fetch for Base64 gallery images)
export function useOffbeatPhotos(id, options = {}) {
    const url = id ? `/api/public/offbeats/${id}/photos` : null;
    return useSWR(url, { ...options, dedupingInterval: 300000 }); // Cache photos for 5 mins
}
