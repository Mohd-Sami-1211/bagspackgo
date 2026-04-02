'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, XCircle, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';

export default function ScanPassContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const passCode = searchParams.get('passCode');

    const [verifying, setVerifying] = useState(true);
    const [result, setResult] = useState(null); // { success: boolean, message: string, participant?: any }

    useEffect(() => {
        if (!bookingId || !passCode) {
            setResult({ success: false, message: 'Invalid QR Code. Missing bookingId or passCode.' });
            setVerifying(false);
            return;
        }

        const verifyPass = async () => {
            try {
                const res = await fetch('/api/provider/scan-event-pass', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId, passCode })
                });

                const data = await res.json();
                
                // If unauthorized or not provider
                if (res.status === 401 || res.status === 403) {
                    setResult({ success: false, message: 'You must be logged in as a provider to verify passes.' });
                } else if (!data.success) {
                    setResult({ success: false, message: data.message });
                } else {
                    setResult({ success: true, message: data.message, participant: data.participant });
                }
            } catch (err) {
                console.error(err);
                setResult({ success: false, message: 'Network error occurred while verifying the pass.' });
            } finally {
                setVerifying(false);
            }
        };

        verifyPass();
    }, [bookingId, passCode]);

    return (
        <div className="min-h-screen bg-[#F0FDF4] p-4 flex items-center justify-center font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 flex flex-col p-6 sm:p-8 text-center">
                
                <div className="mb-6 inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Ticket className="w-8 h-8 mx-auto" />
                </div>
                
                <h1 className="text-2xl font-black text-gray-900 mb-2">QR Pass Scanner</h1>
                
                {verifying ? (
                    <div className="mt-8 mb-4 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold text-sm">Verifying Ticket Pass...</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-mono">{passCode}</p>
                    </div>
                ) : (
                    <div className="mt-6">
                        {result?.success ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h2 className="text-xl font-black text-emerald-700 mb-1">Pass Verified</h2>
                                <p className="text-sm font-bold text-gray-600 mb-4">Entry Approved for</p>
                                
                                <div className="bg-white rounded-xl py-3 px-4 shadow-sm border border-emerald-100 inline-block text-left w-full mb-2">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Guest Name</p>
                                    <p className="font-black text-gray-900 text-lg leading-tight mb-2">{result.participant?.name || 'Unknown'}</p>
                                    
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 mt-2 border-t border-gray-100 pt-2">ID Proof Used</p>
                                    <p className="font-bold text-gray-800 text-sm">{result.participant?.idNumber || 'N/A'}</p>
                                </div>
                                <p className="text-[10px] font-mono text-emerald-600 font-bold tracking-widest mt-2">{passCode}</p>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <h2 className="text-xl font-black text-red-700 mb-2">Pass Denied</h2>
                                <p className="text-sm font-bold text-red-900/80 mb-4">{result?.message}</p>
                                <p className="text-[10px] font-mono text-red-500 font-bold tracking-widest">{passCode}</p>
                            </div>
                        )}

                        <div className="mt-8">
                            <Link href="/serviceprovider/dashboard" className="px-6 py-3 bg-gray-900 border text-white font-bold rounded-xl hover:bg-gray-800 inline-block transition text-sm">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
