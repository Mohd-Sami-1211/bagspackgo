'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Clock, CheckCircle, MessageSquare, Send, AlertCircle, UserCircle2, Loader2, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AccountPageHeader from '@/components/user/AccountPageHeader';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function HelpMainContent() {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState('callback'); // 'callback', 'email', 'history'
  const [loading, setLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [success, setSuccess] = useState(false);
  const supportKey = user ? `/api/user/support?page=${historyPage}&limit=6` : null;
  const { data: supportData, isLoading: loadingQueries, mutate: mutateQueries } = useSWR(supportKey, {
    dedupingInterval: 30000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const queries = supportData?.queries || [];
  const queryPagination = supportData?.pagination || { page: historyPage, total: queries.length, totalPages: 1 };

  // Form states
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
        openAuthModal({ closable: true, tab: 'user' });
        return;
    }
    setLoading(true);
    try {
      const payload = activeTab === 'callback' 
        ? { type: 'callback', phone, subject: 'Callback Request', message: 'User requested a call back.' }
        : { type: 'message', subject, message };

      const res = await fetch('/api/user/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setActiveTab('history');
          setHistoryPage(1);
          mutateQueries();
          setSubject('');
          setMessage('');
          setPhone('');
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'resolved': return <Badge variant="success" className="text-[10px] gap-1"><CheckCircle className="w-3 h-3" /> Resolved</Badge>;
      case 'in-progress': return <Badge variant="warning" className="text-[10px] gap-1"><Clock className="w-3 h-3" /> In Progress</Badge>;
      default: return <Badge variant="outline" className="text-[10px] gap-1"><AlertCircle className="w-3 h-3" /> Pending</Badge>;
    }
  };

  const tabs = [
    { id: 'callback', label: 'Request a callback', caption: 'Talk to our team', icon: Phone },
    { id: 'email', label: 'Send a message', caption: 'Explain your issue', icon: Mail },
    { id: 'history', label: 'Your requests', caption: `${queryPagination.total} support tickets`, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f6] px-4 py-8 font-sans sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AccountPageHeader eyebrow="Help centre" title="How can we help you?" description="Request a callback or send us an email. We will keep your request and our reply together here." icon={LifeBuoy} />

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {tabs.slice(0, 2).map((tab) => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`group flex items-center gap-4 rounded-2xl border p-5 text-left shadow-sm transition ${active ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md'}`}><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tab.id === 'email' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}><Icon className="h-6 w-6" /></span><span className="flex-1"><span className="block text-base font-black text-slate-900">{tab.label}</span><span className="mt-1 block text-sm text-slate-500">{tab.caption}</span></span><span className={`h-3 w-3 rounded-full border-2 ${active ? 'border-emerald-700 bg-emerald-700' : 'border-slate-300'}`} /></button>; })}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><MessageSquare className="h-5 w-5" /></span><div><p className="text-sm font-black text-slate-900">Your support requests</p><p className="text-xs text-slate-400">{queryPagination.total} request{queryPagination.total === 1 ? '' : 's'} and replies</p></div></div><button onClick={() => setActiveTab('history')} className={`rounded-full px-4 py-2 text-xs font-black transition ${activeTab === 'history' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>View requests</button></div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          <AnimatePresence mode="wait">
            {activeTab === 'callback' && (
              <motion.div key="callback" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid md:grid-cols-[0.85fr_1.15fr]">
                <div className="bg-emerald-50 p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm"><Phone className="h-6 w-6" /></div><h2 className="mt-6 text-2xl font-black text-emerald-950">We’ll call you</h2><p className="mt-2 text-sm leading-6 text-emerald-900/65">Share a reachable number. A support team member will contact you within 2–4 business hours.</p><div className="mt-8 rounded-2xl border border-emerald-200 bg-white/70 p-4"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Best for</p><p className="mt-2 text-sm font-semibold text-slate-700">Payment questions, urgent booking changes and trip coordination.</p></div></div>
                <form onSubmit={handleSubmit} className="p-6 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Callback details</p><h3 className="mt-2 text-xl font-black text-slate-900">Where should we reach you?</h3><div className="mt-8"><label className="text-xs font-black uppercase tracking-wider text-slate-600">Phone number</label><div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100"><span className="flex items-center border-r border-slate-200 px-4 text-sm font-bold text-slate-500">+91</span><input type="tel" required inputMode="numeric" pattern="[0-9]{10}" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm font-bold text-slate-900 outline-none" placeholder="9876543210" /></div><p className="mt-2 text-xs text-slate-400">Enter a 10-digit Indian mobile number.</p></div><button disabled={loading || success} type="submit" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60 sm:w-auto">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Requesting…</> : success ? <><CheckCircle className="h-4 w-4" />Request received</> : <><Phone className="h-4 w-4" />Request callback</>}</button></form>
              </motion.div>
            )}

            {activeTab === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid md:grid-cols-[0.85fr_1.15fr]">
                <div className="bg-sky-50 p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm"><Mail className="h-6 w-6" /></div><h2 className="mt-6 text-2xl font-black text-slate-900">Tell us what happened</h2><p className="mt-2 text-sm leading-6 text-slate-600">Include your booking reference and useful details so our team can resolve the issue faster.</p><a href="mailto:bagspackgo01@gmail.com" className="mt-8 block rounded-2xl border border-sky-200 bg-white/75 p-4 text-sm font-black text-sky-700">bagspackgo01@gmail.com</a></div>
                <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8"><div><label className="text-xs font-black uppercase tracking-wider text-slate-600">Subject</label><Input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="For example: payment confirmation" className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 font-semibold" /></div><div><label className="text-xs font-black uppercase tracking-wider text-slate-600">Message</label><Textarea required rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe your issue and include the booking reference if available…" className="mt-2 resize-y rounded-xl border-slate-200 bg-slate-50 font-medium" /></div><button disabled={loading || success} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60 sm:w-auto">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : success ? <><CheckCircle className="h-4 w-4" />Message sent</> : <><Send className="h-4 w-4" />Send message</>}</button></form>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-5 sm:p-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Support history</p><h2 className="mt-1 text-2xl font-black text-slate-900">Your requests</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">{queryPagination.total} total</span></div>{loadingQueries ? <div className="flex min-h-[280px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : queries.length > 0 ? <div className="grid gap-4">{queries.map((query) => <article key={query._id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 shadow-sm">{query.type === 'callback' ? 'Callback' : 'Message'}</span><span className="text-xs font-semibold text-slate-400">{new Date(query.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div><h3 className="mt-3 font-black text-slate-900">{query.subject || 'Support request'}</h3></div>{getStatusBadge(query.status)}</div><p className="mt-3 text-sm leading-6 text-slate-600">{query.message}</p>{query.adminReply && <div className="mt-4 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><UserCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /><div><p className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Support team reply</p><p className="mt-1 text-sm leading-6 text-slate-700">{query.adminReply}</p></div></div>}</article>)}</div> : <div className="flex min-h-[300px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"><MessageSquare className="h-7 w-7 text-emerald-500" /></div><h3 className="mt-5 text-lg font-black text-slate-800">No support requests yet</h3><p className="mt-1 text-sm text-slate-500">When you contact us, your request and replies will appear here.</p></div>}{queryPagination.totalPages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><button disabled={historyPage <= 1} onClick={() => setHistoryPage((value) => Math.max(1, value - 1))} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-40">Previous</button><span className="text-xs font-bold text-slate-500">{historyPage} / {queryPagination.totalPages}</span><button disabled={historyPage >= queryPagination.totalPages} onClick={() => setHistoryPage((value) => value + 1)} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Next</button></div>}</motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
