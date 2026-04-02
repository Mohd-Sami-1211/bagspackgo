'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Ban, CheckCircle2, Trash2, Loader2, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AdminPackagesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetchItems = useCallback(async (searchQuery = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/packages?search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load packages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems(search);
    };

    const toggleStatus = async (item) => {
        const newStatus = item.status === 'inactive' ? 'published' : 'inactive';
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        
        try {
            const res = await fetch(`/api/admin/packages/${item._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, model: item.model })
            });
            const data = await res.json();
            if (data.success) {
                setItems(items.map(i => i._id === item._id && i.model === item.model ? { ...i, status: data.item.status } : i));
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    const removeItem = async (item) => {
        if (!confirm(`CRITICAL: Are you sure you want to delete this ${item.type}? This action cannot be undone.`)) return;
        
        try {
            const res = await fetch(`/api/admin/packages/${item._id}?model=${item.model}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setItems(items.filter(i => !(i._id === item._id && i.model === item.model)));
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
                        <Package className="w-6 h-6 text-pink-400" /> Packages & Events
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all provider offerings across the platform.</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full sm:w-72 flex-shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search title..." 
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none transition-all"
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
                                <th className="px-6 py-4">Title / Destination</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-pink-500" />
                                        Loading items...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No items found.
                                    </td>
                                </tr>
                            ) : items.map(item => (
                                <motion.tr key={`${item.model}-${item._id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-white truncate max-w-[250px]">{item.title}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                            <MapPin className="w-3 h-3" /> <span className="truncate max-w-[200px]">{item.destination || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.guide ? (
                                            <>
                                                <p className="font-medium text-white truncate max-w-[150px]">{item.guide.username}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{item.guide.email}</p>
                                            </>
                                        ) : (
                                            <span className="text-gray-500 italic">Unknown Guide</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            // Make category colored
                                            item.type === 'trip' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            item.type === 'trek' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                                        }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            item.status === 'draft' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20' // inactive
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                item.status === 'published' ? 'bg-emerald-500' :
                                                item.status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                                            }`} /> 
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {item.status !== 'draft' && (
                                                <button onClick={() => toggleStatus(item)} title={item.status === 'inactive' ? 'Republish' : 'Block (Make Inactive)'}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                        item.status === 'published' ? 'hover:bg-amber-500/10 text-gray-400 hover:text-amber-500' : 'hover:bg-emerald-500/10 text-red-500 hover:text-emerald-500'
                                                    }`}>
                                                    {item.status === 'published' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                            )}
                                            <button onClick={() => removeItem(item)} title="Permanently Delete"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
