'use client';

import { SWRConfig } from 'swr';

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await res.json().catch(() => ({}));
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export default function SWRProvider({ children }) {
    return (
        <SWRConfig 
            value={{
                fetcher,
                revalidateOnFocus: false, // Do not refetch aggressively on window focus
                revalidateIfStale: true,
                shouldRetryOnError: false, // Disable automatic retries to avoid spamming failed endpoints
                keepPreviousData: true, // Keep old data while fetching new data (good for search)
            }}
        >
            {children}
        </SWRConfig>
    );
}
