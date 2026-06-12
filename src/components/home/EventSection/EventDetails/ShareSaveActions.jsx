'use client'; 
import { useState, useEffect } from 'react'; 
import { Share2, Bookmark } from 'lucide-react'; 
import { Button } from '@/components/ui/button'; 
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ShareSaveActions({ eventId, eventTitle }) {   
  const { user, openAuthModal } = useAuth();   
  const [isSaved, setIsSaved] = useState(false);   

  useEffect(() => {     
    if (!user) return;     
    const fetchStatus = async () => {       
      try {         
        const res = await fetch('/api/user/saved');         
        const data = await res.json();         
        if (data.success && data.saved) {           
          setIsSaved(data.saved.some(item => item.itemId === eventId));         
        }       
      } catch (err) {         
        console.error('Failed to fetch saved status', err);       
      }     
    };     
    fetchStatus();   
  }, [user, eventId]);   

  const handleSaveEvent = async () => {     
    if (!user) {       
      openAuthModal({ closable: true, tab: 'user' });       
      return;     
    }     
    try {       
      if (isSaved) {         
        const res = await fetch(`/api/user/saved?itemId=${eventId}`, { method: 'DELETE' });         
        if (res.ok) {
          setIsSaved(false);
          toast.success('Removed from saved events');
        }
      } else {         
        const res = await fetch('/api/user/saved', {           
          method: 'POST',           
          headers: { 'Content-Type': 'application/json' },           
          body: JSON.stringify({ itemId: eventId, itemType: 'event' }),         
        });         
        if (res.ok) {
          setIsSaved(true);
          toast.success('Event saved successfully!');
        }
      }     
    } catch (err) {       
      console.error('Failed to update saved status', err);
      toast.error('Failed to update saved status');
    }   
  };   

  const handleShareEvent = async () => {     
    const shareData = {       
      title: eventTitle || 'Check out this event!',       
      text: `Check out this amazing event on bagspackgo!`,       
      url: window.location.href,     
    };     
    try {       
      if (navigator.share) {         
        await navigator.share(shareData);       
      } else {         
        await navigator.clipboard.writeText(window.location.href);         
        console.log('Link copied to clipboard!');         
        toast.success('Link copied to clipboard!');       
      }     
    } catch (err) {       
      console.error('Error sharing', err);
      toast.error('Failed to share the event');
    }   
  };   

  return (     
    <div className="flex items-center justify-end gap-2 mb-4">       
      <Button         
        variant="outline"         
        onClick={handleShareEvent}         
        className="flex items-center gap-2 rounded-xl text-gray-700 font-semibold shadow-sm"       
      >         
        <Share2 size={16} className="text-gray-500" />         
        <span>Share</span>       
      </Button>       
      <Button         
        variant={isSaved ? "secondary" : "outline"}         
        onClick={handleSaveEvent}         
        className={`flex items-center gap-2 rounded-xl font-semibold shadow-sm ${isSaved ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200' : 'text-gray-700'}`}       
      >         
        <Bookmark size={16} className={isSaved ? 'text-gray-900 fill-emerald-600' : 'text-gray-500'} />         
        <span>{isSaved ? 'Saved' : 'Save'}</span>       
      </Button>     
    </div>   
  );
}