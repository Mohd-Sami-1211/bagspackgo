'use client';
import { useParams } from 'next/navigation';
import EventDetailView from '@/components/serviceprovider/dashboard/Events/EventDetailView';

export default function AdminEventDetailPage() {
    const { id, eventId } = useParams();

    return (
        <div className="admin-dark-form">
            <EventDetailView eventId={eventId} adminMode={true} providerId={id} />
        </div>
    );
}
