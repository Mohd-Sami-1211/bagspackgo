'use client';
import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { compressImage } from '@/lib/imageCompression';

function DynamicListInput({ label, items, onChange, placeholder }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-400">{label}</label>
                <button
                    type="button"
                    onClick={() => onChange([...items, ''])}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm transition"
                >
                    <Plus size={16} /> Add More
                </button>
            </div>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                            const newItems = [...items];
                            newItems[index] = e.target.value;
                            onChange(newItems);
                        }}
                        placeholder={placeholder}
                        className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    {items.length > 1 && (
                        <button
                            type="button"
                            onClick={() => onChange(items.filter((_, i) => i !== index))}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}
            {items.length === 0 && (
                <button
                    type="button"
                    onClick={() => onChange([''])}
                    className="text-emerald-400 hover:text-emerald-300 text-sm transition"
                >
                    + Add {label}
                </button>
            )}
        </div>
    );
}

function ItineraryInput({ items, onChange }) {
    return (
        <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <label className="block text-sm font-medium text-gray-400">Itinerary (Day by Day)</label>
                <button
                    type="button"
                    onClick={() => onChange([...items, { title: '', points: [''] }])}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm transition font-medium"
                >
                    <Plus size={16} /> Add Day
                </button>
            </div>
            
            {items.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 space-y-4 relative group">
                    {items.length > 1 && (
                        <button
                            type="button"
                            onClick={() => onChange(items.filter((_, i) => i !== dayIndex))}
                            className="absolute top-4 right-4 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Day {dayIndex + 1} Title</label>
                        <input
                            type="text"
                            value={day.title}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[dayIndex].title = e.target.value;
                                onChange(newItems);
                            }}
                            placeholder="e.g. Arrival & Acclimatization"
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-500">Day Details / Points</label>
                        {day.points.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-center gap-2">
                                <span className="text-emerald-500 text-sm">•</span>
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[dayIndex].points[pointIndex] = e.target.value;
                                        onChange(newItems);
                                    }}
                                    placeholder="e.g. Check-in to the hotel"
                                    className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                {day.points.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newItems = [...items];
                                            newItems[dayIndex].points = day.points.filter((_, i) => i !== pointIndex);
                                            onChange(newItems);
                                        }}
                                        className="p-1.5 text-red-400 hover:text-red-300 rounded-lg transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newItems = [...items];
                                newItems[dayIndex].points.push('');
                                onChange(newItems);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 text-xs transition mt-2 ml-4"
                        >
                            + Add Point
                        </button>
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <button
                    type="button"
                    onClick={() => onChange([{ title: '', points: [''] }])}
                    className="text-emerald-400 hover:text-emerald-300 text-sm transition"
                >
                    + Add Day 1
                </button>
            )}
        </div>
    );
}

export default function EditOffBeatPage({ params }) {
    // Unwrap params in Next.js 15
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        region: 'Kashmir',
        shortDescription: '',
        description: '',
        status: 'draft',
        highlights: [''],
        whatsIncluded: [''],
        whatsExcluded: [''],
        whatToBring: [''],
        itinerary: [{ title: '', points: [''] }],
        restrictions: ['']
    });

    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const photoInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const coverPhotoInputRef = useRef(null);

    useEffect(() => {
        const fetchOffbeat = async () => {
            try {
                const res = await fetch(`/api/admin/offbeats/${id}`);
                const data = await res.json();
                if (data.success) {
                    const ob = data.data;
                    setFormData({
                        title: ob.title || '',
                        destination: ob.destination || '',
                        region: ob.region || 'Kashmir',
                        shortDescription: ob.shortDescription || '',
                        description: ob.description || '',
                        status: ob.status || 'draft',
                        highlights: ob.highlights?.length ? ob.highlights : [''],
                        whatsIncluded: ob.whatsIncluded?.length ? ob.whatsIncluded : [''],
                        whatsExcluded: ob.whatsExcluded?.length ? ob.whatsExcluded : [''],
                        whatToBring: ob.whatToBring?.length ? ob.whatToBring : [''],
                        itinerary: ob.itinerary?.length 
                            ? ob.itinerary.map(day => typeof day === 'string' ? { title: day, points: [''] } : day)
                            : [{ title: '', points: [''] }],
                        restrictions: ob.restrictions?.length ? ob.restrictions : ['']
                    });
                    setCoverPhoto(ob.coverPhoto || null);
                    setPhotos(ob.photographs || []);
                    setVideos(ob.videos || []);
                } else {
                    alert('Failed to load offbeat data');
                    router.push('/admin/offbeats');
                }
            } catch (err) {
                console.error(err);
                alert('Error loading offbeat');
            } finally {
                setFetching(false);
            }
        };
        fetchOffbeat();
    }, [id, router]);

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const processedPhotos = await Promise.all(
            files.map(file => compressImage(file, { maxWidth: 1200, quality: 0.8 }))
        );
        setPhotos(prev => [...prev, ...processedPhotos]);
    };

    const handleCoverPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const processedPhoto = await compressImage(file, { maxWidth: 1200, quality: 0.8 });
        setCoverPhoto(processedPhoto);
    };

    const handleVideoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setLoading(true);
        try {
            const uploadedVideos = await Promise.all(
                files.map(async (file) => {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: fd
                    });
                    const data = await res.json();
                    if (data.success) {
                        return data.url;
                    }
                    throw new Error(data.message || 'Video upload failed');
                })
            );
            setVideos(prev => [...prev, ...uploadedVideos]);
        } catch (error) {
            console.error(error);
            alert('Error uploading videos. They might be too large.');
        } finally {
            setLoading(false);
        }
    };

    const removePhoto = (index) => setPhotos(photos.filter((_, i) => i !== index));
    const removeVideo = (index) => setVideos(videos.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanArray = (arr) => arr.filter(item => item.trim() !== '');
            
            const payload = { 
                ...formData, 
                highlights: cleanArray(formData.highlights),
                whatsIncluded: cleanArray(formData.whatsIncluded),
                whatsExcluded: cleanArray(formData.whatsExcluded),
                whatToBring: cleanArray(formData.whatToBring),
                itinerary: formData.itinerary
                    .filter(day => day.title.trim() !== '' || day.points.some(p => p.trim() !== ''))
                    .map(day => ({
                        title: day.title.trim(),
                        points: day.points.filter(p => p.trim() !== '')
                    })),
                restrictions: cleanArray(formData.restrictions),
                coverPhoto: coverPhoto,
                photographs: photos,
                videos: videos
            };

            const res = await fetch(`/api/admin/offbeats/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                router.push('/admin/offbeats');
            } else {
                if (res.status === 413) {
                    alert('Error: Video or image size is too large. Please upload smaller files (Max 20MB total).');
                    return;
                }
                const data = await res.json().catch(() => ({ message: 'Server error' }));
                alert(data.message || 'Failed to update offbeat');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating offbeat. If you are uploading videos, they might be too large.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/offbeats" className="text-gray-400 hover:text-white transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-white">Edit OffBeat Destination</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
                {/* Basic Info Section */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Destination *</label>
                            <input required type="text" name="destination" value={formData.destination} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Region *</label>
                            <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                                <option value="Kashmir">Kashmir</option>
                                <option value="Jammu">Jammu</option>
                                <option value="Chenab Valley">Chenab Valley</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Short Description *</label>
                            <input required type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} maxLength={300} placeholder="Brief summary of the offbeat destination..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Description *</label>
                            <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Full comprehensive description..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Media Uploads</h2>
                    <div className="space-y-6">
                        {/* Cover Photo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Cover Photo *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                {coverPhoto ? (
                                    <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden group">
                                        <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setCoverPhoto(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => coverPhotoInputRef.current?.click()} className="aspect-video bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-400 transition">
                                        <ImageIcon size={24} />
                                        <span className="text-sm font-medium">Add Cover Photo</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" accept="image/*" className="hidden" ref={coverPhotoInputRef} onChange={handleCoverPhotoUpload} />
                        </div>

                        {/* Photographs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Additional Photographs</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                {photos.map((photo, idx) => (
                                    <div key={idx} className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden group">
                                        <img src={photo} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => photoInputRef.current?.click()} className="aspect-video bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-400 transition">
                                    <ImageIcon size={24} />
                                    <span className="text-sm font-medium">Add Photos</span>
                                </button>
                            </div>
                            <input type="file" multiple accept="image/*" className="hidden" ref={photoInputRef} onChange={handlePhotoUpload} />
                        </div>

                        {/* Videos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Videos <span className="text-xs text-gray-500">(Max 20MB recommended)</span></label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                {videos.map((video, idx) => (
                                    <div key={idx} className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden group">
                                        <video src={video} className="w-full h-full object-cover" controls />
                                        <button type="button" onClick={() => removeVideo(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => videoInputRef.current?.click()} className="aspect-video bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-400 transition">
                                    <VideoIcon size={24} />
                                    <span className="text-sm font-medium">Add Videos</span>
                                </button>
                            </div>
                            <input type="file" multiple accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Experience Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DynamicListInput label="Highlights" items={formData.highlights} onChange={(val) => setFormData({ ...formData, highlights: val })} placeholder="e.g. Scenic mountain views" />
                        <ItineraryInput items={formData.itinerary} onChange={(val) => setFormData({ ...formData, itinerary: val })} />
                        <DynamicListInput label="What's Included" items={formData.whatsIncluded} onChange={(val) => setFormData({ ...formData, whatsIncluded: val })} placeholder="e.g. Local guide, Meals" />
                        <DynamicListInput label="What's Excluded" items={formData.whatsExcluded} onChange={(val) => setFormData({ ...formData, whatsExcluded: val })} placeholder="e.g. Personal expenses, Flights" />
                        <DynamicListInput label="What to Bring" items={formData.whatToBring} onChange={(val) => setFormData({ ...formData, whatToBring: val })} placeholder="e.g. Warm jacket, Trekking shoes" />
                        <DynamicListInput label="Restrictions" items={formData.restrictions} onChange={(val) => setFormData({ ...formData, restrictions: val })} placeholder="e.g. No smoking, minimum age 12" />
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex justify-end sticky bottom-0 bg-gray-900 py-4 z-10">
                    <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-900/20">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
