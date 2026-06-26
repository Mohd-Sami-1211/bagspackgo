import useSWR from 'swr';

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
