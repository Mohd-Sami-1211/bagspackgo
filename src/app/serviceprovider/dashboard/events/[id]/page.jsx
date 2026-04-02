'use client';
import EventDetailView from '@/components/serviceprovider/dashboard/Events/EventDetailView';
import { use } from 'react';

export default function EventDetailPage({ params }) {
    const { id } = use(params);
    return <EventDetailView eventId={id} />;
}
