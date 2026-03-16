'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Ban, CheckCircle2, Trash2, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async (searchQuery = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const toggleStatus = async (user) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'block' : 'unblock'} ${user.username}?`)) return;
        
        try {
            const res = await fetch(`/api/admin/users/${user._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u._id === user._id ? { ...u, isActive: data.user.isActive } : u));
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    const removeUser = async (user) => {
        if (!confirm(`CRITICAL: Are you sure you want to permanently delete user ${user.username}? This action cannot be undone.`)) return;
        
        try {
            const res = await fetch(`/api/admin/users/${user._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u._id !== user._id));
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
                        <Users className="w-6 h-6 text-blue-400" /> Travelers
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all registered user accounts.</p>
                </div>

                <form onSubmit={handleSearch} className="relative w-full sm:w-72 flex-shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, email, phone..." 
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
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
                                <th className="px-6 py-4">Traveler</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                                        Loading travelers...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No travelers found.
                                    </td>
                                </tr>
                            ) : users.map(user => (
                                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-white truncate max-w-[200px]">{user.username}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="truncate max-w-[200px]">{user.email}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Blocked
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => toggleStatus(user)} title={user.isActive ? 'Block User' : 'Unblock User'}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    user.isActive ? 'hover:bg-amber-500/10 text-gray-400 hover:text-amber-500' : 'hover:bg-emerald-500/10 text-red-400 hover:text-emerald-500'
                                                }`}>
                                                {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => removeUser(user)} title="Delete User Permanently"
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
