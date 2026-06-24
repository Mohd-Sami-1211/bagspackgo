'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Minus, IndianRupee, Package,
  CalendarDays, Clock, CheckCircle2, XCircle, MapPin, RefreshCw,
  Mountain, Plane, PartyPopper, Zap, ChevronRight,
  ArrowRight, BarChart2, Share2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

// --- Dynamic Imports ---
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />,
});
const PipelineChart = dynamic(() => import('./PipelineChart'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />,
});

// --- Helper Functions ---
function fmt(n) {
  if (n < 0) return `-${fmt(-n)}`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function daysUntil(d) {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));
}

function initials(name) {
  if (!name) return '?';
  const p = name.trim().split(' ').filter(Boolean);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
}

function avatarColor(name) {
  const palette = [
    'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700', 'bg-teal-100 text-teal-700',
    'bg-sky-100 text-sky-700',   'bg-amber-100 text-amber-700',
  ];
  if (!name) return palette[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

// --- Sub-Components ---
function Skeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="h-14 w-72 bg-gray-200/60 rounded-2xl animate-pulse mb-7" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-[1.75rem] bg-white border border-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-white border border-gray-100 animate-pulse" />
        <div className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, change, icon: Icon, href, delay = 0, mounted = false }) {
  const pos     = change > 0;
  const neutral = change === 0 || change === undefined;
  const TIcon   = pos ? TrendingUp : neutral ? Minus : TrendingDown;
  const tCls    = pos
    ? 'text-emerald-600 bg-emerald-50'
    : neutral
    ? 'text-gray-400 bg-gray-100'
    : 'text-red-500 bg-red-50';

  const inner = (
    <div
      style={{ transitionDelay: `${delay}s` }}
      className={`group relative flex flex-col items-start p-6 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm
        hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:border-emerald-100
        transition-all duration-300 text-left overflow-hidden hover:-translate-y-1
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-50 rounded-full scale-0 group-hover:scale-[2.5] transition-transform duration-700 ease-out opacity-0 group-hover:opacity-100 -z-0" />
      <div className="relative z-10 flex items-center justify-between w-full mb-4">
        <div className="p-2.5 bg-gray-50 text-gray-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-gray-100 group-hover:border-emerald-400">
          <Icon size={20} className="stroke-[2]" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${tCls}`}>
            <TIcon size={10} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="relative z-10 text-[24px] font-black text-gray-900 tracking-tight leading-none mb-1">{value}</div>
      <div className="relative z-10 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      {sub && <div className="relative z-10 text-[11px] text-gray-400 mt-1.5">{sub}</div>}
      {href && (
        <div className="relative z-10 flex items-center gap-1 mt-4 text-[11px] font-bold text-emerald-600 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          View details <ArrowRight size={12} />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

function StatusBadge({ status }) {
  const cfg = {
    confirmed:               { label: 'Confirmed',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
    pending:                 { label: 'Pending',     cls: 'bg-amber-50   text-amber-700   border-amber-100',   icon: Clock        },
    cancelled:               { label: 'Cancelled',   cls: 'bg-red-50     text-red-600     border-red-100',     icon: XCircle      },
    cancellation_requested:  { label: 'Cancel Req.', cls: 'bg-orange-50  text-orange-600  border-orange-100',  icon: AlertCircle  },
    refund_initiated:        { label: 'Refunding',   cls: 'bg-purple-50  text-purple-600  border-purple-100',  icon: AlertCircle  },
  }[status] ?? { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock };

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${cfg.cls}`}>
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  );
}

const TABS = ['1D', '1W', '1M', '3M', '6M'];

function ChartTabs({ active, onChange, loading }) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          disabled={loading}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 disabled:opacity-50 ${
            active === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ title, sub, linkLabel, linkHref }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="text-[13px] font-semibold text-gray-800">{title}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {linkHref && (
        <Link href={linkHref} className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          {linkLabel} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

function TimeAgoText({ date }) {
  const [text, setText] = useState(() => timeAgo(date));

  useEffect(() => {
    setText(timeAgo(date));
    const id = setInterval(() => setText(timeAgo(date)), 60000);
    return () => clearInterval(id);
  }, [date]);

  return <span>{text}</span>;
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center py-24">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
        <AlertCircle size={20} className="text-red-400" />
      </div>
      <p className="text-[14px] font-semibold text-gray-700 mb-1">{message}</p>
      <p className="text-[12px] text-gray-400 mb-5">This only affects the dashboard — the rest of the app is unaffected.</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors"
      >
        <RefreshCw size={12} /> Try again
      </button>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function DashboardMainContent() {
  const [dashboardData, setDashboardData]     = useState(null);
  const [activeChartData, setActiveChartData] = useState([]);

  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefresh]    = useState(false);
  const [lastUpd, setLastUpd]       = useState(null);
  const [tab, setTab]               = useState('1M');
  const [tabLoading, setTabLoading] = useState(false);
  const [cardsMounted, setCardsMounted] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  const chartCache = useRef({});
  const committedTab = useRef('1M');
  const loadAbortRef = useRef(null);
  const tabAbortRef = useRef(null);
  const hasDataRef   = useRef(false);

  const load = useCallback(async (refresh = false, windowParam = '1M') => {
    loadAbortRef.current?.abort();
    const controller = new AbortController();
    loadAbortRef.current = controller;

    if (refresh) {
      setRefresh(true);
      chartCache.current = {};
    } else {
      setLoading(true);
    }

    try {
      const [dashRes, chartRes] = await Promise.all([
        fetch('/api/provider/dashboard', { signal: controller.signal }),
        fetch(`/api/provider/dashboard/chart?window=${windowParam}`, { signal: controller.signal }),
      ]);

      if (!dashRes.ok)  throw new Error(`Server returned ${dashRes.status}`);
      if (!chartRes.ok) throw new Error(`Server returned ${chartRes.status}`);

      const [dashJson, chartJson] = await Promise.all([
        dashRes.json(),
        chartRes.json(),
      ]);

      if (!dashJson.success)  throw new Error(dashJson.message  || 'Unknown error');
      if (!chartJson.success) throw new Error(chartJson.message || 'Unknown error');

      setDashboardData(dashJson.data);
      setActiveChartData(chartJson.data);
      chartCache.current[windowParam] = chartJson.data;
      committedTab.current = windowParam;
      hasDataRef.current = true;

      setLastUpd(new Date());
      setDashboardError(null);
      setCardsMounted(false);
      requestAnimationFrame(() => setCardsMounted(true));

    } catch (err) {
      if (err.name === 'AbortError') return;
      setDashboardError('Failed to load dashboard. Please try again.');
      if (hasDataRef.current) {
        toast.error('Could not refresh dashboard. Showing last loaded data.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefresh(false);
      }
    }
  }, []);

  useEffect(() => {
    load(false, tab);
    return () => loadAbortRef.current?.abort();
  }, []);

  const handleTabChange = useCallback(async (newTab) => {
    if (newTab === tab) return;
    setTab(newTab);

    if (chartCache.current[newTab]) {
      setActiveChartData(chartCache.current[newTab]);
      committedTab.current = newTab;
      return;
    }

    tabAbortRef.current?.abort();
    const controller = new AbortController();
    tabAbortRef.current = controller;

    setTabLoading(true);
    try {
      const res = await fetch(`/api/provider/dashboard/chart?window=${newTab}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      } 
      const json = await res.json();

      if (!json.success){
        throw new Error(json.message || 'Unknown error');
      } 

      chartCache.current[newTab] = json.data;
      setActiveChartData(json.data);
      committedTab.current = newTab;

    } catch (err) {
        console.error('Chart data fetch error:', err);
      if (err.name === 'AbortError') return;
      toast.error('Could not load chart data.');
      setTab(committedTab.current);
    } finally {
      if (!controller.signal.aborted) setTabLoading(false);
    }
  }, [tab]);

  const handleShareProfile = useCallback(async () => {
    if (!dashboardData?.profile?.id) return;
    const url = `${window.location.origin}/user/provider/${dashboardData.profile.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dashboardData.profile.companyName || dashboardData.profile.name} on bagspackgo`,
          url,
        });
      } catch (err) {
        if (err?.name !== 'AbortError') {
          toast.error('Could not share profile. Try copying the link instead.');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied!');
      } catch {
        toast.error('Could not copy link. Please copy it manually.');
      }
    }
  }, [dashboardData?.profile]);

  if (loading) return <Skeleton />;
  
  if (dashboardError && !dashboardData) {
    return <DashboardError message={dashboardError} onRetry={() => load(false, tab)} />;
  }

   const { profile, stats: s = {}, pipeline = [], recentBookings, upcomingEvents } = dashboardData || {};
  const inactivePkgs      = (s.totalPackages ?? 0) - (s.activePackages ?? 0);
  const unpublishedEvents = (s.totalEvents ?? 0) - (s.publishedEvents ?? 0);
  const chartData = activeChartData || [];

  const statCards = [
    {
      label:  'Revenue · 30 days',
      value:  fmt(s.earningsLast30 ?? 0),
      sub:    s.earningsLast30 > 0 ? 'Completed deposits this period' : 'No deposits this period',
      change: s.earningsChangePct,
      icon:   IndianRupee,
      href:   '/serviceprovider/dashboard/settings?tab=payments',
      delay:  0,
    },
    {
      label:  'Active Packages',
      value:  s.activePackages ?? 0,
      sub:    inactivePkgs > 0 ? `${inactivePkgs} inactive` : (s.totalPackages > 0 ? 'All packages active' : 'No packages yet'),
      icon:   Package,
      href:   '/serviceprovider/dashboard/settings/packages',
      delay:  0.09,
    },
    {
      label:  'Published Events',
      value:  s.publishedEvents ?? 0,
      sub:    unpublishedEvents > 0 ? `${unpublishedEvents} unpublished` : (s.totalEvents > 0 ? 'All events published' : 'No events yet'),
      icon:   CalendarDays,
      href:   '/serviceprovider/dashboard/events',
      delay:  0.18,
    },
  ];

  const categoryTiles = [
    {
      label: 'Trip Bookings',
      value: s.totalTripBookings ?? 0,
      icon:  Plane,
      href:  '/serviceprovider/dashboard/trips',
      pkgHref: '/serviceprovider/dashboard/settings/packages?tab=trip',
    },
    {
      label: 'Trek Bookings',
      value: s.totalTrekBookings ?? 0,
      icon:  Mountain,
      href:  '/serviceprovider/dashboard/treks',
      pkgHref: '/serviceprovider/dashboard/settings/packages?tab=trek',
    },
    {
      label: 'Events Hosted',
      value: s.totalEvents ?? 0,
      icon:  PartyPopper,
      href:  '/serviceprovider/dashboard/events',
      pkgHref: null,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-4">

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <div className="flex flex-col gap-[3px]">
              <div className="w-5 sm:w-6 h-[3px] rounded-full bg-emerald-500" />
              <div className="w-3 sm:w-4 h-[3px] rounded-full bg-emerald-300" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          </div>
          {lastUpd && (
            <p className="text-[12px] text-gray-400 pl-9">
              Updated <TimeAgoText date={lastUpd} />
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {profile?.applicationStatus === 'approved' && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 text-[11px] font-medium text-gray-600 px-2.5 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </div>
          )}

          <button
            onClick={handleShareProfile}
            className="hidden sm:flex items-center gap-1.5 bg-white border border-gray-200 text-[11px] font-medium text-emerald-600 px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 transition-all active:scale-95"
          >
            <Share2 size={11} /> Share Profile
          </button>
          <button
            onClick={handleShareProfile}
            aria-label="Share profile"
            className="sm:hidden flex items-center justify-center bg-white border border-gray-200 text-emerald-600 w-8 h-8 rounded-xl hover:bg-emerald-50 transition-all active:scale-95"
          >
            <Share2 size={13} />
          </button>

          <button
            onClick={() => load(true, tab)}
            disabled={refreshing}
            className="hidden sm:flex items-center gap-1.5 bg-white border border-gray-200 text-[11px] font-medium text-gray-500 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => load(true, tab)}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            className="sm:hidden flex items-center justify-center bg-white border border-gray-200 text-gray-500 w-8 h-8 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {(profile?.pausedServices?.trip || profile?.pausedServices?.trek || profile?.pausedServices?.event) && (
        <div className="mb-5 flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Zap size={13} className="text-amber-500 shrink-0" />
          <p className="text-[12px] text-amber-800">
            <span className="font-semibold">Services paused: </span>
            {[
              profile.pausedServices.trip  && 'Trips',
              profile.pausedServices.trek  && 'Treks',
              profile.pausedServices.event && 'Events',
            ].filter(Boolean).join(', ')}.{' '}
            <Link href="/serviceprovider/dashboard/settings" className="underline hover:text-amber-900">Manage</Link>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {statCards.map((c) => <StatCard key={c.label} {...c} mounted={cardsMounted} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {categoryTiles.map((tile) => (
          <div key={tile.label} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-emerald-100 hover:shadow-[0_4px_20px_rgba(16,185,129,0.07)] transition-all duration-300">
            <Link href={tile.href} className="block p-4 border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                  <tile.icon size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[20px] font-black text-gray-900 leading-none">{tile.value}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{tile.label}</div>
                </div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
              </div>
            </Link>
            <div className="flex divide-x divide-gray-100">
              <Link href={tile.href} className="flex-1 text-center text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 py-2.5 transition-colors">
                View Bookings
              </Link>
              {tile.pkgHref && (
                <Link href={tile.pkgHref} className="flex-1 text-center text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 py-2.5 transition-colors">
                  View Packages →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold text-gray-800">Revenue</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {tab === '1D' ? 'Hourly · last 24h'
                  : tab === '1W' ? 'Daily · last 7 days'
                  : tab === '1M' ? 'Weekly · last 4 weeks'
                  : tab === '3M' ? 'Monthly · last 3 months'
                  : 'Monthly · last 6 months'}{' · ₹ thousands'}
              </div>
            </div>
            <ChartTabs active={tab} onChange={handleTabChange} loading={tabLoading} />
          </div>
          <RevenueChart data={chartData} loading={tabLoading} />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="text-[13px] font-semibold text-gray-800 mb-0.5">Booking Pipeline</div>
          <div className="text-[11px] text-gray-400 mb-4">Confirmed vs Pending</div>
          <PipelineChart data={pipeline} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5">
          <SectionHeader
            title="Recent Bookings"
            sub="Latest activity across trips & treks"
            linkLabel="View all"
            linkHref="/serviceprovider/dashboard/trips"
          />
          {!recentBookings?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                <BarChart2 size={20} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-medium text-gray-400">No bookings yet</p>
              <p className="text-[11px] text-gray-300 mt-1">Customer bookings will appear here</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(b.bookerName)}`}>
                    {initials(b.bookerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-gray-800 truncate">{b.bookerName}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${b.type === 'Trek' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {b.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      <span className="font-mono">{b.bookingRef}</span>
                      <span className="mx-1.5 text-gray-200">·</span>
                      <TimeAgoText date={b.createdAt} />
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <SectionHeader
            title="Upcoming Events"
            sub="Your next published events"
            linkLabel="View all"
            linkHref="/serviceprovider/dashboard/events"
          />
          {!upcomingEvents?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                <CalendarDays size={20} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-medium text-gray-400">No upcoming events</p>
              <Link
                href="/serviceprovider/dashboard/events"
                className="mt-4 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
              >
                + Create Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => {
                const pct  = ev.totalSlots > 0 ? Math.round((ev.bookedSlots / ev.totalSlots) * 100) : 0;
                const days = daysUntil(ev.date);
                return (
                  <Link
                    key={ev.id}
                    href={`/serviceprovider/dashboard/events/${ev.id}`}
                    className="block border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 hover:bg-gray-50/40 transition-all"
                  >
                    <div className="flex items-start gap-2.5 mb-3">
                      {ev.poster ? (
                        <img
                          src={ev.poster}
                          alt={ev.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <CalendarDays size={14} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 truncate">{ev.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400 truncate">{ev.location}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                        days <= 3 ? 'bg-red-50 text-red-500' : days <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {days}d
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-gray-400">Slots filled</span>
                        <span className="text-[10px] font-semibold text-gray-600">{ev.bookedSlots}/{ev.totalSlots}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-gray-400">{formatDate(ev.date)}</span>
                        <span className="text-[10px] font-semibold text-gray-700">₹{ev.pricePerSlot}/slot</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}