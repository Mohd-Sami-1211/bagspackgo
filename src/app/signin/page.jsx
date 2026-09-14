'use client';

import { useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const { openAuthModal } = useAuth();

  useEffect(() => {
    openAuthModal({ closable: true, tab: 'provider' });
  }, [openAuthModal]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#16483b_0%,_#06110e_48%,_#030807_100%)] px-4 py-16 text-white">
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center text-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Provider sign in</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Sign in or create your provider account to list packages and host events.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal({ closable: true, tab: 'provider' })}
            className="mt-7 rounded-full bg-emerald-400 px-6 py-3 font-black text-[#062018] transition hover:bg-emerald-300"
          >
            Open provider login
          </button>
        </div>
      </div>
    </main>
  );
}
