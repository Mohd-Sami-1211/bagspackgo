'use client';
import EventMainContent from 'src/components/serviceprovider/dashboard/Events/EventMainContent';
import { useFetchCompany } from 'src/customHook/fetchDetails';
export default function EventsPage(){
    useFetchCompany();
    return <EventMainContent/> 
}


