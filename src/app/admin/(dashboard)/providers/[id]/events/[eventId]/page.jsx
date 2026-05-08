'use client';
import { use } from 'react';
import EventDetailView from '@/components/serviceprovider/dashboard/Events/EventDetailView';

export default function AdminEventDetailPage({ params }) {
    const { id, eventId } = use(params);

    return (
        <div className="admin-dark-form">
            <EventDetailView eventId={eventId} adminMode={true} providerId={id} />
        </div>
    );
}
