import Link from 'next/link';
import { MapPin, Clock, Calendar, Star, ArrowLeft, Map, ExternalLink } from 'lucide-react';
import ShareSaveActions from './ShareSaveActions';
import { formatDate } from '@/lib/utils';

export default function Hero({ event }) {

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left: Poster with Server-Side Back Link */}
        <div className="w-full md:w-1/2 lg:w-2/3 flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden shadow-lg relative bg-neutral-900 group">
            <Link
              href="/user/events"
              className="absolute top-4 left-4 z-20 flex items-center justify-center h-9 px-3 gap-2 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full font-semibold border border-white/20 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <img
              src={event.image || '/images/EventCover.webp'}
              alt={event.name}
              className="relative z-10 w-full h-64 md:h-96 object-cover md:object-contain"
            />
          </div>
          {/* Note: The Book Now button will be injected here later in the main layout */}
        </div>

        {/* Right: Company Name, Event Info, Map */}
        <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <div>
            
            <ShareSaveActions eventId={event.id} eventTitle={event.name} />

            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                {event.guideLogo ? (
                  <img src={event.guideLogo} alt={event.guideName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-900 font-black text-sm">
                    {(event.guideName || 'G').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Organized by</p>
                <p className="text-sm font-bold text-gray-800">
                  {(event.guide || event.guideId) ? (
                      <Link href={`/user/provider/${event.guide?._id || event.guideId || event.guide}`} className="hover:text-emerald-700 hover:underline">
                          {event.guideName || 'Local Organizer'}
                      </Link>
                  ) : (event.guideName || 'Local Organizer')}
                </p>
              </div>
            </div>

            <div className="border-b border-gray-100 mb-4" />

            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words pr-2">{event.name}</h1>
              <div className="flex items-center bg-yellow-100 text-yellow-700 text-sm font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2 flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" /> {event.rating || 'New'}
              </div>
            </div>

            <div className="space-y-3.5 mb-6">
              <div className="flex items-center">
                <Calendar className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                <div><p className="text-xs text-gray-400 font-medium">Date</p><p className="font-semibold text-sm text-gray-800">{formatDate(event.date)}</p></div>
              </div>
              <div className="flex items-center">
                <Clock className="text-green-500 mr-3 flex-shrink-0" size={20} />
                <div><p className="text-xs text-gray-400 font-medium">Duration</p><p className="font-semibold text-sm text-gray-800">{event.duration}</p></div>
              </div>
              <div className="flex items-center">
                <MapPin className="text-purple-500 mr-3 flex-shrink-0" size={20} />
                <div><p className="text-xs text-gray-400 font-medium">Location</p><p className="font-semibold text-sm text-gray-800 capitalize">{event.destinationId}</p></div>
              </div>
            </div>
          </div>

          {event.destinationLink && (
            <a
              href={event.destinationLink.startsWith('http') ? event.destinationLink : `https://${event.destinationLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl transition-all border border-blue-200 shadow-sm group"
            >
              <Map size={20} className="group-hover:scale-110 transition-transform" />
              View Location on Map
              <ExternalLink size={14} className="opacity-60" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}