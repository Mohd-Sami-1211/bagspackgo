'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HostEventPage from '@/components/serviceprovider/dashboard/Events/HostEvent';
import { Loader2 } from 'lucide-react';

export default function AdminEditEventPage() {
    const { id, eventId } = useParams();
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/admin/events/${eventId}?providerId=${id}`);
                const data = await res.json();
                if (data.success && data.event) {
                    setEventData(data.event);
                }
            } catch (err) {
                console.error("Failed to fetch event data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!eventData) {
        return <div className="text-center py-20 text-red-500">Event not found or access denied.</div>;
    }

    return (
        <div className="admin-dark-form">
            <HostEventPage 
                isEdit={true} 
                initialData={eventData} 
                adminMode={true} 
                providerId={id} 
            />
        </div>
    );
}
