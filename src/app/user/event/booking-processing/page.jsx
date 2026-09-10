'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, Home, RefreshCw, ShieldCheck } from 'lucide-react';

function BookingProcessingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const [message, setMessage] = useState('Checking the payment status securely…');
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            setTimedOut(true);
            return undefined;
        }

        let cancelled = false;
        let attempts = 0;
        let timer;

        const checkStatus = async () => {
            attempts += 1;
            try {
                const response = await fetch(`/api/user/bookings/${bookingId}`, { cache: 'no-store' });
                const payload = await response.json();
                const status = payload?.booking?.status;

                if (status === 'confirmed') {
                    router.replace(`/user/event/booking-success?bookingId=${bookingId}`);
                    return;
                }
                if (status === 'cancelled' || status === 'refund_initiated') {
                    const refund = payload?.booking?.cancellationDetails || {};
                    const params = new URLSearchParams({
                        return: '/user/events',
                        paymentCaptured: refund.refundAmount > 0 ? 'true' : 'false',
                        refundInitiated: status === 'refund_initiated' ? 'true' : 'false',
                    });
                    if (payload?.booking?.orderId) params.set('orderId', payload.booking.orderId);
                    if (payload?.booking?.paymentId) params.set('paymentId', payload.booking.paymentId);
                    if (refund.refundId) params.set('refundId', refund.refundId);
                    if (refund.refundAmount !== undefined) params.set('refundAmount', String(refund.refundAmount));
                    router.replace(`/user/event/booking-failed?${params.toString()}`);
                    return;
                }
                if (attempts >= 10) {
                    setTimedOut(true);
                    setMessage('Your payment is still being reconciled. You can check My Bookings again shortly.');
                    return;
                }
                if (!cancelled) timer = window.setTimeout(checkStatus, 3000);
            } catch (error) {
                if (attempts >= 10) {
                    setTimedOut(true);
                    setMessage('We could not reach the booking service. Your payment will still be reconciled automatically if it was captured.');
                    return;
                }
                if (!cancelled) timer = window.setTimeout(checkStatus, 3000);
            }
        };

        checkStatus();
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [bookingId, router]);

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_#123c30_0%,_#07110e_38%,_#07110e_100%)] px-4 py-16 text-white">
            <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15">
                    {timedOut ? <Clock3 className="h-8 w-8 text-amber-300" /> : <RefreshCw className="h-8 w-8 animate-spin text-emerald-300" />}
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Payment reconciliation</p>
                <h1 className="text-2xl font-extrabold tracking-tight">{timedOut ? 'Payment status pending' : 'Confirming your booking'}</h1>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/65">{message}</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-white/50">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" /> You will not be charged twice.
                </div>
                {timedOut && (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button onClick={() => window.location.reload()} className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-[#062018] transition hover:bg-emerald-400"><RefreshCw className="mr-2 inline h-4 w-4" /> Check again</button>
                        <button onClick={() => router.push('/user/bookings')} className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"><CheckCircle2 className="mr-2 inline h-4 w-4" /> My Bookings</button>
                    </div>
                )}
                <button onClick={() => router.push('/')} className="mt-5 text-xs font-semibold text-white/50 transition hover:text-white"><Home className="mr-1 inline h-3.5 w-3.5" /> Return home</button>
            </div>
        </main>
    );
}

export default function BookingProcessingPage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-[#07110e]" />}>
            <BookingProcessingContent />
        </Suspense>
    );
}
