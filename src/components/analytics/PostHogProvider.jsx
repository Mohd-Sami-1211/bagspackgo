// src/components/analytics/PostHogProvider.jsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * PostHogProvider
 * ---------------
 * • Initialises posthog-js once on mount (client-side only).
 * • Automatically captures a $pageview event on every route change.
 * • Guards against missing API key (useful during local dev without the key set).
 *
 * Wrap this around your app in layout.js (inside a <Suspense> boundary because
 * useSearchParams() requires one in Next.js App Router).
 */
export function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!POSTHOG_KEY) return;
        if (pathname) {
            const url = window.origin + pathname;
            const search = searchParams?.toString();
            posthog.capture('$pageview', {
                $current_url: search ? `${url}?${search}` : url,
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export default function PostHogProvider({ children }) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!POSTHOG_KEY) {
            console.warn(
                '[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set. ' +
                'Analytics will not be collected. ' +
                'Add it to your .env.local file.'
            );
            return;
        }

        if (!initialized.current) {
            posthog.init(POSTHOG_KEY, {
                api_host: POSTHOG_HOST,
                // Capture page views manually via PostHogPageView component
                capture_pageview: false,
                // Respect Do Not Track
                respect_dnt: true,
                // Capture performance metrics
                capture_performance: true,
                // Session recording (set to false to disable)
                session_recording: {
                    maskAllInputs: true, // Hide sensitive inputs by default
                },
                // Loaded callback — useful for identifying users
                loaded: (ph) => {
                    if (process.env.NODE_ENV === 'development') {
                        // Disable in dev so you don't pollute your data
                        // Comment this out if you want dev tracking
                        ph.opt_out_capturing();
                        console.log('[PostHog] Initialized (dev mode — capturing disabled)');
                    }
                },
            });
            initialized.current = true;
        }
    }, []);

    return children;
}
