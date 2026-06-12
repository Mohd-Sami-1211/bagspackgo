'use client';

import { useState } from 'react';
import MetabaseSignedEmbed from '@/components/analytics/MetabaseSignedEmbed';
import { BarChart3, TrendingUp, Users, ShoppingBag, MousePointerClick, Activity } from 'lucide-react';

const TABS = [
    { id: 'overview',  label: 'Overview',  icon: BarChart3 },
    { id: 'users',     label: 'Users',     icon: Users },
    { id: 'bookings',  label: 'Bookings',  icon: ShoppingBag },
    { id: 'funnels',   label: 'Funnels',   icon: TrendingUp },
    { id: 'events',    label: 'Events',    icon: MousePointerClick },
];

// Map each tab to a Metabase dashboard ID.
// Replace these with your actual Metabase dashboard/question IDs.
const METABASE_DASHBOARDS = {
    overview:  1,
    users:     2,
    bookings:  3,
    funnels:   4,
    events:    5,
};

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-400" />
                        Analytics
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Powered by Metabase + PostHog
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* PostHog live link */}
                    <a
                        href={process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f9531b]/10 border border-[#f9531b]/20 text-[#f9531b] text-sm font-medium hover:bg-[#f9531b]/20 transition-colors"
                    >
                        <MousePointerClick className="w-4 h-4" />
                        Open PostHog
                    </a>
                    {/* Metabase live link */}
                    <a
                        href={process.env.NEXT_PUBLIC_METABASE_SITE_URL || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Open Metabase
                    </a>
                </div>
            </div>

            {/* Setup Banner */}
            {(!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_METABASE_SITE_URL) && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                    <p className="text-amber-400 font-semibold text-sm mb-2">⚙️ Analytics Setup Required</p>
                    <p className="text-amber-300/70 text-xs leading-relaxed">
                        Add the following to your <code className="bg-amber-500/10 px-1 rounded">.env.local</code> to activate analytics:
                    </p>
                    <pre className="mt-2 text-xs text-amber-200/60 bg-black/30 rounded-lg p-3 overflow-x-auto">{`NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com   # or your self-hosted URL

NEXT_PUBLIC_METABASE_SITE_URL=https://metabase.yoursite.com
METABASE_SECRET_KEY=your_metabase_embed_secret`}</pre>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800 overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Metabase Embed */}
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
                <MetabaseSignedEmbed
                    type="dashboard"
                    resourceId={METABASE_DASHBOARDS[activeTab]}
                    height="700px"
                />
            </div>

            {/* PostHog Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-xl bg-gray-900 border border-gray-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-[#f9531b]/10 border border-[#f9531b]/20 flex items-center justify-center">
                            <MousePointerClick className="w-4 h-4 text-[#f9531b]" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">PostHog — Session & Event Tracking</p>
                            <p className="text-gray-500 text-xs">Real-time user analytics</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        PostHog is automatically tracking page views and user sessions across your entire site.
                        Use <code className="bg-gray-800 px-1 rounded text-emerald-300">posthog.capture()</code> anywhere
                        in your code to track custom events like bookings, logins, and searches.
                    </p>
                    <div className="mt-3 bg-gray-950 rounded-lg p-3 text-xs font-mono text-gray-300">
                        <span className="text-gray-500">// Track a custom event</span>{'\n'}
                        <span className="text-blue-400">import</span> posthog <span className="text-blue-400">from</span>{' '}
                        <span className="text-green-400">&apos;@/lib/posthog&apos;</span>;{'\n'}
                        posthog.<span className="text-yellow-300">capture</span>(<span className="text-green-400">&apos;booking_completed&apos;</span>, {'{'}{'\n'}
                        {'  '}<span className="text-emerald-300">package_id</span>: id,{'\n'}
                        {'  '}<span className="text-emerald-300">amount</span>: total{'\n'}
                        {'}'});
                    </div>
                </div>

                <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Metabase — BI Dashboards</p>
                            <p className="text-gray-500 text-xs">Business intelligence</p>
                        </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            Connect to your MongoDB
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            Build charts & dashboards
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            Signed embed (no login needed)
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            Update dashboard IDs above
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
