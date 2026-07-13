'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Map, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOffBeatsPage() {
    const [offbeats, setOffbeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOffbeats();
    }, []);

    const fetchOffbeats = async () => {
        try {
            const res = await fetch('/api/admin/offbeats');
            const data = await res.json();
            if (data.success) {
                setOffbeats(data.data);
            }
        } catch (error) {
            console.error('Error fetching offbeats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this OffBeat?')) return;
        try {
            const res = await fetch(`/api/admin/offbeats/${id}`, { method: 'DELETE' });
            if (res.ok) fetchOffbeats();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const filteredOffbeats = offbeats.filter(o => 
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Map className="text-emerald-400" /> Manage OffBeats
                    </h1>
                    <p className="text-gray-400 text-sm">Create and manage offbeat destinations</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/offbeats/inquiries">
                        <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition border border-gray-700">
                            View Inquiries
                        </button>
                    </Link>
                    <Link href="/admin/offbeats/new">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
                            <Plus size={18} /> Add OffBeat
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search offbeats..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-800/50 text-gray-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Destination</th>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Visits</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading offbeats...
                                    </td>
                                </tr>
                            ) : filteredOffbeats.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No offbeats found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOffbeats.map((offbeat) => (
                                    <motion.tr 
                                        key={offbeat._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-white">{offbeat.destination}</td>
                                        <td className="px-6 py-4">{offbeat.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                offbeat.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {offbeat.status.charAt(0).toUpperCase() + offbeat.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{offbeat.visitCount || 0}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <Link href={`/admin/offbeats/${offbeat._id}/edit`} className="text-blue-400 hover:text-blue-300 inline-block">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(offbeat._id)} className="text-red-400 hover:text-red-300 inline-block">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
