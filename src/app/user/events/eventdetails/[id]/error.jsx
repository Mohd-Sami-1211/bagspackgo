'use client';

import { RefreshCcw } from 'lucide-react';

export default function EventDetailsError({ reset }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-bold text-slate-900">This event could not be loaded</h2>
      <p className="max-w-md text-sm text-slate-500">
        The connection may have been interrupted. Try the request again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
      >
        <RefreshCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
