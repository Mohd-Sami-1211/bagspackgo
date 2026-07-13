'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewOffBeatPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        region: 'Kashmir',
        shortDescription: '',
        description: '',
        status: 'draft',
        photographs: ['']
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Filter out empty photos
            const payload = { ...formData, photographs: formData.photographs.filter(p => p.trim() !== '') };
            const res = await fetch('/api/admin/offbeats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                router.push('/admin/offbeats');
            } else {
                alert('Failed to create offbeat');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating offbeat');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePhotoChange = (index, value) => {
        const newPhotos = [...formData.photographs];
        newPhotos[index] = value;
        setFormData({ ...formData, photographs: newPhotos });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/offbeats" className="text-gray-400 hover:text-white transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-white">Add New OffBeat</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Destination</label>
                        <input required type="text" name="destination" value={formData.destination} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Region</label>
                        <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                            <option value="Kashmir">Kashmir</option>
                            <option value="Jammu">Jammu</option>
                            <option value="Chenab Valley">Chenab Valley</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Short Description</label>
                        <input required type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} maxLength={300} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Description</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
                    </div>
                    
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-sm font-medium text-gray-400">Photographs (URLs)</label>
                        {formData.photographs.map((url, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="url" value={url} onChange={(e) => handlePhotoChange(i, e.target.value)} placeholder="https://..." className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                {i === formData.photographs.length - 1 && (
                                    <button type="button" onClick={() => setFormData({ ...formData, photographs: [...formData.photographs, ''] })} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition">Add Another</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                        Save OffBeat
                    </button>
                </div>
            </form>
        </div>
    );
}
