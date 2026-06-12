// src/components/analytics/MetabaseSignedEmbed.jsx
'use client';

import { useEffect, useState } from 'react';

/**
 * MetabaseSignedEmbed
 * -------------------
 * Fetches a server-signed JWT token from /api/analytics/metabase-token
 * and renders a secure Metabase iframe. The secret key is NEVER exposed
 * to the client — all signing happens server-side.
 *
 * Props:
 *  - type        : 'question' | 'dashboard'  (default: 'dashboard')
 *  - resourceId  : number  — the dashboard or question ID in Metabase
 *  - params      : object  — optional locked filter params
 *  - height      : string  — CSS height (default: '600px')
 *  - className   : string  — extra classes
 */
export default function MetabaseSignedEmbed({
    type = 'dashboard',
    resourceId,
    params = {},
    height = '600px',
    className = '',
}) {
    const [iframeUrl, setIframeUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!resourceId) return;

        setLoading(true);
        setError(null);

        const url = new URL('/api/analytics/metabase-token', window.location.origin);
        url.searchParams.set('type', type);
        url.searchParams.set('id', String(resourceId));
        if (Object.keys(params).length > 0) {
            url.searchParams.set('params', JSON.stringify(params));
        }

        fetch(url.toString())
            .then((r) => r.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setIframeUrl(data.iframeUrl);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [type, resourceId, JSON.stringify(params)]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-50 rounded-xl ${className}`} style={{ height }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-red-50 border-2 border-dashed border-red-200 rounded-xl p-6 text-center ${className}`} style={{ height }}>
                <svg className="w-10 h-10 text-red-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-600 font-medium">Metabase Error</p>
                <p className="text-red-400 text-sm mt-1">{error}</p>
                <p className="text-gray-400 text-xs mt-3">
                    Check <code className="bg-gray-100 px-1 rounded">METABASE_SECRET_KEY</code> and{' '}
                    <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_METABASE_SITE_URL</code> in .env.local
                </p>
            </div>
        );
    }

    return (
        <div className={`metabase-embed-wrapper w-full overflow-hidden rounded-xl shadow-sm ${className}`}>
            <iframe
                src={iframeUrl}
                style={{ width: '100%', height, border: 'none' }}
                allowTransparency
                title={`Metabase ${type} ${resourceId}`}
            />
        </div>
    );
}
