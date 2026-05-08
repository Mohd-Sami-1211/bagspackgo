'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Search, Ban, CheckCircle2, Trash2, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProvidersPage() {
    const router = useRouter();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetchProviders = useCallback(async (searchQuery = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/providers?search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setProviders(data.providers);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load providers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProviders(search);
    };

    const toggleStatus = async (provider) => {
        if (!confirm(`Are you sure you want to ${provider.isActive ? 'put on hold' : 'unhold'} ${provider.username}?`)) return;
        
        try {
            const res = await fetch(`/api/admin/providers/${provider._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !provider.isActive })
            });
            const data = await res.json();
            if (data.success) {
                setProviders(providers.map(p => p._id === provider._id ? { ...p, isActive: data.provider.isActive } : p));
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    const removeProvider = async (provider) => {
        if (!confirm(`CRITICAL: Are you sure you want to permanently delete service provider ${provider.username}? This action cannot be undone.`)) return;
        
        try {
            const res = await fetch(`/api/admin/providers/${provider._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setProviders(providers.filter(p => p._id !== provider._id));
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
                        <UserCheck className="w-6 h-6 text-emerald-400" /> Service Providers
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all registered service provider accounts.</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full sm:w-72 flex-shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, company, email..." 
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Company Details</th>
                                <th className="px-6 py-4">App Status</th>
                                <th className="px-6 py-4">Account Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                                        Loading providers...
                                    </td>
                                </tr>
                            ) : providers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No providers found.
                                    </td>
                                </tr>
                            ) : providers.map(provider => (
                                <tr key={provider._id} className="hover:bg-gray-800/30 transition-colors cursor-pointer group" onClick={() => router.push(`/admin/providers/${provider._id}`)}>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-white truncate max-w-[150px] group-hover:text-emerald-400 transition-colors">{provider.username}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{provider.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {provider.details ? (
                                            <>
                                                <p className="font-medium text-emerald-400 truncate max-w-[200px]">{provider.details.companyname}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide truncate max-w-[200px]">{provider.details.destinationId}</p>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">Not set up yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            provider.applicationStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                            provider.applicationStatus === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                            provider.applicationStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                            'bg-gray-800 text-gray-500'
                                        }`}>
                                            {provider.applicationStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {provider.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> On Hold
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            {provider.applicationStatus === 'pending' && (
                                                <Link href="/admin/applications" title="Go to application"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            )}
                                            <button onClick={() => toggleStatus(provider)} title={provider.isActive ? 'Put On Hold' : 'Remove Hold'}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    provider.isActive ? 'hover:bg-amber-500/10 text-gray-400 hover:text-amber-500' : 'hover:bg-emerald-500/10 text-amber-500 hover:text-emerald-500'
                                                }`}>
                                                {provider.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => removeProvider(provider)} title="Delete Provider Permanently"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
