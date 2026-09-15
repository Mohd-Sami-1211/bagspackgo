'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Calendar, Trash2, ArrowRight, Compass, Mountain, Ticket, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AccountPageHeader from '@/components/user/AccountPageHeader';
import { packageHeroFor } from '@/lib/packageHero';

const SavedMainContent = () => {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const savedKey = `/api/user/saved?page=${page}&limit=9${categoryFilter === 'all' ? '' : `&type=${categoryFilter}`}`;
  const { data, error, isLoading: loading, mutate } = useSWR(savedKey, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const savedItems = data?.saved || [];
  const pagination = data?.pagination || { page, total: savedItems.length, totalPages: 1 };

  const handleOpenConfig = (e, record) => {
    e.preventDefault();
    const pkg = record.item;
    
    const cat = record.config?.category || pkg.packageCategory || 'individual';
    const count = record.config?.peopleCount || 1;
    const dateQuery = record.config?.date ? `&date=${new Date(record.config.date).toISOString()}` : '';
    const days = record.config?.days || pkg.days || 1;

    let path = '';
    if (record.itemType === 'event') {
      path = `/user/events/eventdetails/${record.itemId}`;
    } else if (record.itemType === 'offbeat') {
      path = `/user/offbeats/${record.itemId}`;
    } else {
      path = `/trip/${pkg._id}?${dateQuery.replace(/^&/, '')}${dateQuery ? '&' : ''}count=${count}&category=${cat}&days=${days}`;
    }
    router.push(path);
  };

  const handleUnsave = async (itemId) => {
    const previous = data;
    await mutate((current) => current ? {
      ...current,
      saved: current.saved.filter((item) => item.itemId !== itemId),
      pagination: { ...current.pagination, total: Math.max(0, Number(current.pagination?.total || 1) - 1) },
    } : current, { revalidate: false });
    try {
      const response = await fetch(`/api/user/saved?itemId=${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to remove saved item');
      await mutate();
    } catch (err) {
      console.error('Failed to unsave item:', err);
      await mutate(previous, { revalidate: false });
    }
  };
  const filteredItems = savedItems;

  const TYPE_CONFIG = {
    trip: { label: 'Trip', icon: Compass, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', fallback: 'from-emerald-700 to-teal-900' },
    event: { label: 'Event', icon: Ticket, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', fallback: 'from-violet-600 to-indigo-900' },
    offbeat: { label: 'Offbeat', icon: Mountain, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', fallback: 'from-amber-500 to-orange-800' },
  };

  const getPrice = (record) => {
    const pkg = record.item || {};
    const tiers = pkg.pricingTiers?.length ? [...pkg.pricingTiers].sort((a, b) => a.minPeople - b.minPeople) : [];
    const tier = tiers[0];
    const raw = Number(record.config?.computedPrice || tier?.price || pkg.price?.individual || pkg.price?.starting || pkg.pricePerSlot || pkg.price || 0);
    const discount = Number(tier?.discount || 0);
    return {
      value: discount > 0 && !record.config?.computedPrice ? raw * (1 - discount / 100) : raw,
      original: discount > 0 && !record.config?.computedPrice ? raw : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] justify-center items-center bg-emerald-50/40">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f8f6] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <AccountPageHeader
          eyebrow="Your collection"
          title="Saved"
          description="Trips, events and offbeat experiences you do not want to miss."
          icon={Heart}
          trailing={<div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Bookmark className="h-4 w-4 text-emerald-700" />
            <span className="text-sm font-black text-slate-800">{pagination.total} saved item{pagination.total === 1 ? '' : 's'}</span>
          </div>}
        />

        <div className="my-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'trip', 'event', 'offbeat'].map((cat) => (
              <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1); }} className={`min-w-fit rounded-full border px-5 py-2.5 text-xs font-bold capitalize transition ${categoryFilter === cat ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800'}`}>
                {cat === 'all' ? 'All saved' : `${cat}s`}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-400">Recently saved first</p>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {error ? (
              <div className="col-span-full rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">Saved items could not be loaded. Please try again.</div>
            ) : filteredItems.length > 0 ? filteredItems.map((record) => {
              const pkg = record.item || {};
              const typeCfg = TYPE_CONFIG[record.itemType] || TYPE_CONFIG.trip;
              const Icon = typeCfg.icon;
              const image = record.itemType === 'trip'
                ? packageHeroFor(record.itemId)
                : record.itemType === 'offbeat'
                  ? pkg.coverPhoto || pkg.coverImage
                  : pkg.coverImage || pkg.poster || pkg.images?.[0];
              const title = pkg.label || pkg.title || pkg.name || 'Untitled Package';
              const price = getPrice(record);
              return (
                <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.22 }} key={record._id} onClick={(event) => handleOpenConfig(event, record)} className="group cursor-pointer overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                  <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${typeCfg.fallback}`}>
                    {image ? <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Icon className="absolute bottom-5 left-5 h-16 w-16 text-white/25" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/15" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-800 backdrop-blur"><Icon className="h-3 w-3" />{typeCfg.label}</span>
                    <button onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleUnsave(record.itemId); }} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-red-500" title="Remove from saved" aria-label="Remove from saved"><Trash2 className="h-4 w-4" /></button>
                    <div className="absolute bottom-4 left-4 right-4"><h2 className="line-clamp-2 text-xl font-black leading-tight text-white">{title}</h2></div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{record.itemType === 'event' ? 'Event date' : 'Destination'}</p><p className="mt-1 truncate text-xs font-bold text-slate-800">{record.itemType === 'event' ? (pkg.date ? new Date(pkg.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date coming soon') : (pkg.destination || pkg.location || 'Location varies')}</p></div>
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{record.itemType === 'event' ? 'Availability' : 'Duration'}</p><p className="mt-1 text-xs font-bold text-slate-800">{record.itemType === 'event' ? `${pkg.slotsRemaining || 0} slots left` : (pkg.days ? `${pkg.days} days` : 'Flexible')}</p></div>
                    </div>
                    {record.config?.date && record.itemType !== 'event' && <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><Calendar className="h-3.5 w-3.5" /> Planned for {new Date(record.config.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                    <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                      <div>{record.itemType === 'offbeat' ? <><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Booking type</p><p className="mt-1 text-base font-black text-slate-900">Send an inquiry</p></> : <><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Starting from</p><p className="mt-1 flex items-baseline gap-2"><span className="text-xl font-black text-slate-900">₹{Math.round(price.value).toLocaleString('en-IN')}</span>{price.original > 0 && <span className="text-xs font-semibold text-slate-400 line-through">₹{Math.round(price.original).toLocaleString('en-IN')}</span>}</p></>}</div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white transition group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </motion.article>
              );
            }) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-4 py-24 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"><Bookmark className="h-7 w-7 text-emerald-500" /></div>
                <h3 className="text-lg font-black text-slate-800">Nothing saved here yet</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Save an adventure and it will appear here for easy comparison.</p>
                <Button className="mt-6 rounded-full bg-emerald-700 px-6 hover:bg-emerald-800" onClick={() => router.push(categoryFilter === 'offbeat' ? '/user/offbeats' : categoryFilter === 'event' ? '/user/events' : '/user/trip')}>Explore now</Button>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="text-xs font-bold text-slate-500">Page {page} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedMainContent;
