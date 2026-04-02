'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Search, Loader2, AlertTriangle, IndianRupee, HandCoins, CheckCircle2, ChevronRight, X } from 'lucide-react';

function PayoutModal({ payment, onClose, onConfirm }) {
    const [txnId, setTxnId] = useState('');
    const [account, setAccount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Calculate provider share minus platform fee
    const payoutAmount = payment.amount - (payment.platformFee || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
                
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Mark Payout Complete
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="mb-6 space-y-4 text-sm bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Booking</span>
                        <span className="text-white font-medium">₹{payment.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Platform Fee</span>
                        <span className="text-amber-400 font-medium">- ₹{(payment.platformFee || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-700 flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-300 tracking-wide">Final Payout</span>
                        <span className="text-emerald-400">₹{payoutAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6 text-sm">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">Bank Tnx ID (Required)</label>
                        <input
                            type="text"
                            required
                            value={txnId}
                            onChange={e => setTxnId(e.target.value)}
                            placeholder="e.g. UTR/IMPS Ref Number"
                            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">Deposited Account (Optional)</label>
                        <input
                            type="text"
                            value={account}
                            onChange={e => setAccount(e.target.value)}
                            placeholder="e.g. HDFC ****1234"
                            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <button onClick={async () => {
                    if (!txnId.trim()) return alert('Transaction ID is required to mark as completed.');
                    setSubmitting(true);
                    await onConfirm(payment._id, txnId, account, payment.model);
                }} disabled={submitting} className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Provider Payout'}
                </button>
            </motion.div>
        </div>
    );
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, completed
    const [activePayout, setActivePayout] = useState(null);

    const fetchPayments = useCallback(async (currentFilter, q = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/payments?payout=${currentFilter}&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.success) setPayments(data.payments);
            else setError(data.message);
        } catch {
            setError('Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments(filter, search);
    }, [filter, search, fetchPayments]);

    const handleConfirmPayout = async (id, txnId, account, model) => {
        try {
            const res = await fetch(`/api/admin/payments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerTransactionId: txnId, providerDepositedAccount: account, model })
            });
            const data = await res.json();
            if (data.success) {
                if (filter === 'pending') {
                    setPayments(payments.filter(p => !(p._id === id && p.model === model)));
                } else {
                    setPayments(payments.map(p => (p._id === id && p.model === model) ? { 
                        ...p, 
                        providerPaymentStatus: 'completed', 
                        providerTransactionId: txnId, 
                        providerPaymentDate: new Date().toISOString() 
                    } : p));
                }
                setActivePayout(null);
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-emerald-400" /> Payments & Payouts
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage platform revenue and provider settlements.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                    <form onSubmit={e => { e.preventDefault(); fetchPayments(filter, search); }} className="relative flex-1 sm:w-64 max-w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="ID, Provider..." 
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                        />
                    </form>
                </div>
            </div>

            <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-sm w-full md:w-max">
                {['all', 'pending', 'completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all capitalize whitespace-nowrap min-w-24 ${
                            filter === f ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                        }`}>
                        {f === 'pending' ? 'Pending Payouts' : f === 'completed' ? 'Completed Payouts' : 'All Received'}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm text-gray-300">
                        <thead className="bg-gray-800/50 text-xs uppercase text-gray-500 font-sans font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Ref / Txn</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4 whitespace-nowrap">Provider / Type</th>
                                <th className="px-6 py-4 whitespace-nowrap">Payout Status</th>
                                <th className="px-6 py-4 font-sans text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50 text-[13px]">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-sans"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" /> Loading...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-sans">No payment records found.</td></tr>
                            ) : payments.map(p => (
                                <motion.tr key={`${p.model}-${p._id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-gray-200">{p.bookingRef}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-sans font-medium">{new Date(p.date).toLocaleString('en-GB')}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-emerald-400 font-bold">₹{p.amount?.toLocaleString('en-IN')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-300">{p.provider}</p>
                                        <p className="text-[10px] text-emerald-500 mt-1 uppercase font-bold font-sans tracking-wide bg-emerald-500/10 inline-block px-2 rounded-sm">{p.model.replace('Booking', '')}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {p.providerPaymentStatus === 'completed' ? (
                                            <div>
                                                <span className="inline-flex items-center gap-1 text-emerald-500 font-sans font-bold text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Sent</span>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase">TXN: {p.providerTransactionId}</p>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 font-sans px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <HandCoins className="w-3.5 h-3.5" /> Pending Payout
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-sans">
                                        {p.providerPaymentStatus === 'pending' && (
                                            <button onClick={() => setActivePayout(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all">
                                                Mark Paid <ChevronRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {activePayout && <PayoutModal payment={activePayout} onClose={() => setActivePayout(null)} onConfirm={handleConfirmPayout} />}
            </AnimatePresence>
        </div>
    );
}
