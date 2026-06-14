// components/home/EventSection/EventDetails.jsx 
'use client'; 
import { useState , useEffect } from 'react'; 
import dynamic from 'next/dynamic'; 
import { useRouter } from 'next/navigation'; 
import { Ticket, AlertCircle } from 'lucide-react'; 
import { useAuth } from '@/context/AuthContext'; 
import { Button } from '@/components/ui/button'; 
import Hero from './Hero'; 
import Content from './Content';
import toast from 'react-hot-toast';
import Loader from '@/components/common/components/Loader';

const BookingCheckoutFlow = dynamic(() => import('./BookingFlow'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg"/>
    </div>
  ),
  ssr: false
});

export default function Main({ event }) {  
  const router = useRouter();   
  const { user, openAuthModal } = useAuth();   
  const [currentView, setCurrentView] = useState('details');   
  const [availability, setAvailability] = useState(null);

  const handleBookNowClick = () => {     
    setCurrentView('booking');     
    window.scrollTo({ top: 0, behavior: 'smooth' });   
  };   

  useEffect(() => {
    const fetchAvailability = async () => {
        try {
        const res = await fetch(`/api/events/${event.id}/availability`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setAvailability(data);
        } catch (err) {
            console.error('Failed to fetch availability:', err);
            setAvailability({ slotsLeft: event.slotsLeft, isSoldOut: event.slotsLeft <= 0 });
        }
    };

    fetchAvailability();
  }, [event.id]);


  const handleWish = async () => {     
    if (!user) {       
      openAuthModal({ closable: true, tab: 'user' });       
      return;     
    }     
    try {       
      const eventId = event._id || event.id;       
      await fetch(`/api/user/events/${eventId}/wish`, { method: 'POST' });       
      toast.success("Added to wishlist!");     
    } catch (err) {       
      console.error('Failed to wish for event', err);
      toast.error("Failed to add to wishlist");
    }   
  };   

  if (currentView === 'booking') {     
    const bookingData = {         
      id: event.id,         
      name: event.name,         
      price: event.price,         
      date: event.date,         
      location: event.location,         
      slotsLeft: availability?.slotsLeft ?? event.slotsLeft,
      pickupPoints: event.pickupPoints,
      image : event.image,

    };     
    return (       
      <BookingCheckoutFlow          
        event={bookingData}          
        user={user}          
        openAuthModal={openAuthModal}          
        router={router}         
        onBackToDetails={() => {           
          setCurrentView('details');           
          window.scrollTo({ top: 0, behavior: 'smooth' });         
        }}       
      />     
    );
  }

  return (     
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8 -mt-20 mb-16">              
      <Hero event={event} />       
      <div className="flex flex-col lg:flex-row gap-8">                  
        <div className="w-full lg:w-[65%]">            
          <Content event={event} />         
        </div>                  
        <div className="w-full lg:w-[35%] lg:sticky lg:top-28 h-fit">            
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-6">               
            <h3 className="font-bold text-gray-900 text-lg mb-4">Reserve Your Spot</h3>               
            <p className="text-gray-500 mb-6 text-sm">Join this amazing experience before it sells out.</p>                              
            
            {availability === null ? (
                <div className="w-full h-14 bg-emerald-100 rounded-xl animate-pulse" />
            ) : (availability?.slotsLeft ?? event.slotsLeft) > 0 ? (                 
              <Button                   
                onClick={handleBookNowClick}                   
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-lg transition-all shadow-md active:scale-95"                 
              >                   
                <Ticket className="w-5 h-5" />                   
                <span>Book Now {"\u00B7"} {event.price ? <>{"\u20B9"}{event.price.toLocaleString()}</> : 'Free'}</span>                 
              </Button>               
            ) : (                 
              <div className="flex flex-col gap-3">                   
                <div className="w-full bg-neutral-100 text-neutral-500 shadow-sm py-4 rounded-xl font-bold flex items-center justify-center gap-3 text-lg border border-neutral-200">                     
                  <AlertCircle className="w-6 h-6" />                     
                  <span>Sold Out</span>                   
                </div>                   
                <Button                      
                  onClick={handleWish}                     
                  variant="outline"                     
                  className="w-full h-14 rounded-xl font-bold text-lg border-emerald-600 text-emerald-700 hover:bg-emerald-50"                   
                >                     
                  Wish for more slots                   
                </Button>                 
              </div>               
            )}            
          </div>         
        </div>       
      </div>     
    </div>   
  ); 
}