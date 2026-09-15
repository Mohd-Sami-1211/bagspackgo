'use client';

import { useEffect } from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const { openAuthModal } = useAuth();

  useEffect(() => {
    openAuthModal({ closable: true, tab: 'provider' });
  }, [openAuthModal]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8f6] px-4 py-16 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-100/70 to-transparent" />
      <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="relative mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center text-center">
        <div className="w-full rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Building2 className="h-8 w-8" />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">Partner with bagspackgo</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Become a provider</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Sign in or create your provider account to list packages and host events.
          </p>
          <div className="mx-auto mt-6 grid max-w-md gap-2 text-left sm:grid-cols-2">
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" />List trips and events</p>
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Create local events</p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal({ closable: true, tab: 'provider' })}
            className="mt-7 rounded-full bg-emerald-700 px-6 py-3 font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
          >
            Open provider login
          </button>
        </div>
      </div>
    </main>
  );
}
