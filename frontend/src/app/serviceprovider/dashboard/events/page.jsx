'use client';
import { useSelector } from 'react-redux';
import EventMainContent from 'src/components/serviceprovider/dashboard/Events/EventMainContent';
export default function EventsPage(){ 
    const companyEvents = useSelector((store)=>store.providerCompany.currentEvents);
    console.log("Event Main Context is Render" , companyEvents)
    return <EventMainContent companyEvents = {companyEvents} /> 
}
