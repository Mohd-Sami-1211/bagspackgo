'use client';

import { ArrowLeft } from 'lucide-react';
import useHistoryBack from '@/hooks/useHistoryBack';

export default function AccountPageHeader({ eyebrow, title, description, icon: Icon, trailing, backHref = '/' }) {
  const goBack = useHistoryBack(backHref);

  return (
    <section className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-7">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={goBack}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 active:scale-95 sm:mt-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:flex">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 pt-0.5">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">{eyebrow}</p>
          <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      {trailing && <div className="w-full shrink-0 overflow-x-auto sm:w-auto sm:overflow-visible">{trailing}</div>}
    </section>
  );
}
