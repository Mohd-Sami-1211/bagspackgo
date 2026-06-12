// src/components/analytics/MetabaseEmbed.jsx
'use client';

import { useMemo } from 'react';

/**
 * MetabaseEmbed
 * -------------
 * Renders a Metabase question or dashboard as a signed iframe.
 *
 * Props:
 *  - type        : 'question' | 'dashboard'  (default: 'dashboard')
 *  - resourceId  : number  — the dashboard or question ID in Metabase
 *  - params      : object  — optional filter params to pre-fill in the embed
 *  - bordered    : boolean — show Metabase's border (default: false)
 *  - titled      : boolean — show the resource title (default: true)
 *  - height      : string  — CSS height of the iframe (default: '600px')
 *  - className   : string  — extra classes for the wrapper div
 *
 * Environment variables required (in .env.local):
 *  NEXT_PUBLIC_METABASE_SITE_URL  — e.g. https://metabase.yoursite.com
 *
 * ⚠️  For PUBLIC embeds only.
 *     For SIGNED embeds you also need METABASE_SECRET_KEY on the server side.
 *     See /src/app/api/analytics/metabase-token/route.js for the signing API.
 */
export default function MetabaseEmbed({
    type = 'dashboard',
    resourceId,
    params = {},
    bordered = false,
    titled = true,
    height = '600px',
    className = '',
}) {
    const siteUrl = process.env.NEXT_PUBLIC_METABASE_SITE_URL;

    const iframeSrc = useMemo(() => {
        if (!siteUrl || !resourceId) return null;

        // Build public embed URL (unsigned).
        // Replace with signed JWT URL once you configure the secret key.
        const searchParams = new URLSearchParams({
            bordered: String(bordered),
            titled: String(titled),
            ...Object.fromEntries(
                Object.entries(params).map(([k, v]) => [k, String(v)])
            ),
        });

        return `${siteUrl}/embed/${type}/${resourceId}#${searchParams.toString()}`;
    }, [siteUrl, resourceId, type, bordered, titled, params]);

    if (!siteUrl) {
        return (
            <div className={`metabase-embed-placeholder ${className}`}>
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center p-6">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 font-medium">Metabase not configured</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_METABASE_SITE_URL</code> to your <code className="bg-gray-100 px-1 rounded">.env.local</code>
                    </p>
                </div>
            </div>
        );
    }

    if (!resourceId) {
        return (
            <div className={`metabase-embed-placeholder ${className}`}>
                <div className="flex items-center justify-center h-64 bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl text-center p-6">
                    <p className="text-amber-600 text-sm">
                        Pass a <code className="bg-amber-100 px-1 rounded">resourceId</code> prop to show a Metabase embed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`metabase-embed-wrapper w-full overflow-hidden rounded-xl shadow-sm ${className}`}>
            <iframe
                src={iframeSrc}
                style={{ width: '100%', height, border: 'none' }}
                allowTransparency
                title={`Metabase ${type} ${resourceId}`}
            />
        </div>
    );
}
