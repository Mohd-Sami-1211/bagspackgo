import { useState } from 'react';
import { Plus, Edit2, Trash2, Link as LinkIcon, Loader2, Save, X, AlertCircle, Upload, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '@/lib/imageCompression';

export default function EventSponsorsTab({ eventId, initialSponsors = [] }) {
    const [sponsors, setSponsors] = useState(initialSponsors);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingSponsor, setEditingSponsor] = useState(null); // null = list mode, {} = add mode, { ... } = edit mode

    const fetchSponsors = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/provider/events/${eventId}/sponsors`);
            const data = await res.json();
            if (data.success) {
                setSponsors(data.sponsors || []);
            }
        } catch (err) {
            console.error('Failed to fetch sponsors', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSponsor = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const isEdit = !!editingSponsor._id;
            const url = `/api/provider/events/${eventId}/sponsors${isEdit ? `/${editingSponsor._id}` : ''}`;
            const res = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSponsor),
            });
            const data = await res.json();
            if (data.success) {
                await fetchSponsors();
                setEditingSponsor(null);
            } else {
                setError(data.message || 'Failed to save sponsor');
            }
        } catch (err) {
            setError('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSponsor = async (sponsorId) => {
        if (!confirm('Are you sure you want to remove this sponsor?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/provider/events/${eventId}/sponsors/${sponsorId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                await fetchSponsors();
            } else {
                alert(data.message || 'Failed to delete sponsor');
            }
        } catch (err) {
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const addLink = () => {
        setEditingSponsor(prev => ({ ...prev, links: [...(prev.links || []), { label: '', url: '' }] }));
    };

    const updateLink = (index, field, value) => {
        setEditingSponsor(prev => {
            const newLinks = [...prev.links];
            newLinks[index] = { ...newLinks[index], [field]: value };
            return { ...prev, links: newLinks };
        });
    };

    const removeLink = (index) => {
        setEditingSponsor(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
    };

    if (editingSponsor) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-neutral-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-neutral-900">{editingSponsor._id ? 'Edit Sponsor' : 'Add New Sponsor'}</h3>
                    <button onClick={() => setEditingSponsor(null)} className="p-2 hover:bg-neutral-100 rounded-xl">
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSaveSponsor} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">Name *</label>
                            <input required type="text" value={editingSponsor.name || ''} onChange={e => setEditingSponsor(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500" placeholder="Sponsor Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">Image</label>
                            {editingSponsor.image ? (
                                <div className="flex items-center gap-4">
                                    <img src={editingSponsor.image} alt="Image" className="w-16 h-16 rounded-xl object-cover border border-neutral-200 bg-neutral-50" />
                                    <button
                                        type="button"
                                        onClick={() => setEditingSponsor(prev => ({ ...prev, image: '' }))}
                                        className="text-sm text-red-600 font-semibold hover:underline"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        id="sponsor-logo-upload"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                try {
                                                    const base64 = await compressImage(file, { maxWidth: 800, quality: 0.8 });
                                                    setEditingSponsor(prev => ({ ...prev, image: base64 }));
                                                } catch (err) {
                                                    console.error('Failed to compress image:', err);
                                                    alert('Failed to process image');
                                                }
                                            }
                                        }}
                                        className="hidden" 
                                    />
                                    <label
                                        htmlFor="sponsor-logo-upload"
                                        className="flex items-center justify-center gap-2 w-full h-[50px] px-4 rounded-xl border border-neutral-200 border-dashed hover:bg-neutral-50 cursor-pointer transition-colors text-sm font-semibold text-neutral-600"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Image
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-semibold text-neutral-700">Description</label>
                            <textarea value={editingSponsor.description || ''} onChange={e => setEditingSponsor(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 min-h-[100px]" placeholder="About the sponsor..." />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-semibold text-neutral-700">Website</label>
                            <input type="text" value={editingSponsor.website || ''} onChange={e => setEditingSponsor(prev => ({ ...prev, website: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500" placeholder="https://example.com" />
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-6">
                        <h4 className="text-sm font-bold text-neutral-800 mb-4">Social Media</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['instagram', 'facebook', 'twitter', 'linkedin'].map(platform => (
                                <div key={platform} className="space-y-1">
                                    <label className="text-xs font-semibold text-neutral-500 uppercase">{platform}</label>
                                    <input type="text" value={editingSponsor.socialMedia?.[platform] || ''} onChange={e => setEditingSponsor(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, [platform]: e.target.value } }))} className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="URL" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-neutral-800">Custom Links</h4>
                            <button type="button" onClick={addLink} className="text-sm font-semibold text-emerald-600 flex items-center gap-1 hover:text-emerald-700">
                                <Plus className="w-4 h-4" /> Add Link
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(editingSponsor.links || []).map((link, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input type="text" placeholder="Label" value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
                                    <input type="text" placeholder="URL" value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
                                    <button type="button" onClick={() => removeLink(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-neutral-100">
                        <button type="button" onClick={() => setEditingSponsor(null)} className="px-6 py-2.5 font-semibold text-neutral-600 hover:bg-neutral-50 rounded-xl mr-3">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Sponsor
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-neutral-200">
                <div>
                    <h2 className="text-xl font-bold text-neutral-900">Event Sponsors</h2>
                    <p className="text-neutral-500 text-sm mt-1">Manage sponsors and partners for this event.</p>
                </div>
                <button
                    onClick={() => setEditingSponsor({ name: '', image: '', description: '', website: '', socialMedia: {}, links: [] })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Sponsor
                </button>
            </div>

            {loading && !sponsors.length && (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
            )}

            {!loading && sponsors.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 border-dashed">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">No Sponsors Yet</h3>
                    <p className="text-neutral-500 mt-2 max-w-sm mx-auto text-sm">Add partners or sponsors to display them on your event details page.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sponsors.map(sponsor => (
                    <div key={sponsor._id} className="bg-white p-6 rounded-2xl border border-neutral-200 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {sponsor.image ? (
                                    <img src={sponsor.image} alt={sponsor.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-100" />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-2xl">
                                        {sponsor.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-neutral-900 text-lg">{sponsor.name}</h3>
                                    {sponsor.website && (
                                        <a href={sponsor.website} target="_blank" rel="noreferrer" className="text-emerald-600 text-sm hover:underline flex items-center gap-1 mt-1">
                                            <LinkIcon className="w-3 h-3" /> Website
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingSponsor(sponsor)} className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteSponsor(sponsor._id)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {sponsor.description && (
                            <p className="mt-4 text-neutral-600 text-sm line-clamp-2">{sponsor.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
