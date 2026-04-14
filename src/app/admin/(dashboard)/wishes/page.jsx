'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, CheckCircle2, Trash2, Loader2, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

export default function AdminWishesPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/wishes`);
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load wishes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const filteredItems = items.filter(item => {
        const query = search.toLowerCase();
        return (
            item.event?.title?.toLowerCase().includes(query) ||
            item.user?.username?.toLowerCase().includes(query) ||
            item.user?.email?.toLowerCase().includes(query)
        );
    });

    const toggleStatus = async (item) => {
        const newStatus = item.status === 'resolved' ? 'pending' : 'resolved';
        if (!confirm(`Are you sure you want to mark this wish as ${newStatus}?`)) return;
        
        try {
            const res = await fetch(`/api/admin/wishes/${item._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setItems(items.map(i => i._id === item._id ? { ...i, status: data.item.status } : i));
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    const removeItem = async (item) => {
        if (!confirm(`Are you sure you want to delete this wish request? This action cannot be undone.`)) return;
        
        try {
            const res = await fetch(`/api/admin/wishes/${item._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setItems(items.filter(i => i._id !== item._id));
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
                        <Heart className="w-6 h-6 text-pink-500" /> Event Slot Wishes
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage user requests for more slots in sold out events.</p>
                </div>

                <div className="relative w-full sm:w-72 flex-shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search event or user..." 
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                </div>
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
                                <th className="px-6 py-4">Event Details</th>
                                <th className="px-6 py-4">User Info</th>
                                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                                        Loading wishes...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No wishes found.
                                    </td>
                                </tr>
                            ) : filteredItems.map(item => (
                                <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-white truncate max-w-[250px]">{item.event?.title || 'Unknown Event'}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            {item.event?.destination || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.user ? (
                                            <>
                                                <p className="font-medium text-white truncate max-w-[150px]">{item.user.username}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{item.user.email}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.user.phone}</p>
                                            </>
                                        ) : (
                                            <span className="text-gray-500 italic">User not found</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}>
                                            {item.status === 'resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => toggleStatus(item)} title={item.status === 'pending' ? 'Mark Resolved' : 'Mark Pending'}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    item.status === 'resolved' ? 'hover:bg-amber-500/10 text-gray-400 hover:text-amber-500' : 'hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500'
                                                }`}>
                                                {item.status === 'resolved' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => removeItem(item)} title="Delete Request"
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
