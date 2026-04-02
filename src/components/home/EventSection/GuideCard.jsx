'use client';

import { Star, MapPin, Calendar, Users, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback } from 'react';

const GuideCard = ({ guide }) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (!guide?.id) {
      console.error('Guide ID is missing');
      return;
    }
    router.push(`/guides/${guide.id}`);
  }, [router, guide?.id]);

  return (
    <div 
      className="w-2/3 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 flex h-48"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${guide.name}'s profile`}
    >
      {/* Left Side - 35% - Profile Photo */}
      <div className="w-[25%] bg-white flex items-center justify-center p-4">
        <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-green-400 relative">
          <Image
            src={guide.profilePhoto || '/images/default-guide.jpg'}
            alt={guide.name || 'Guide profile'}
            fill
            className="object-cover"
            sizes="112px"
            priority
          />
        </div>
      </div>

      {/* Right Side - 65% - Details with Greenish Background */}
      <div className="w-[75%] bg-green-300 p-4 flex flex-col">
        {/* Top Section - Name, Location, Rating */}
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {guide.name || 'Professional Guide'}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="flex-shrink-0 mr-1" size={14} />
              <span className="truncate">
                {guide.location || 'Various locations'}
              </span>
            </div>
          </div>

          {guide.rating && (
            <div className="flex items-center bg-white/90 px-2 py-1 rounded-md ml-2 flex-shrink-0">
              <Star className="text-yellow-400 mr-1" size={14} fill="currentColor" />
              <span className="font-medium text-gray-700 whitespace-nowrap">
                {guide.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Middle Section - Stats */}
        <div className="flex mt-2 text-sm text-black/90 mb-3">
          <div className="flex items-center mr-4">
            <Calendar className="mr-1 flex-shrink-0" size={14} />
            <span>{guide.trips || 0}+ trips</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-1 flex-shrink-0" size={14} />
            <span>{guide.reviews || 0} reviews</span>
          </div>
        </div>

        {/* Bottom Section - Specialties */}
        {guide.specialties?.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {guide.specialties.slice(0, 3).map((specialty, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-1 bg-white/90 text-green-800 text-xs font-medium rounded-full"
              >
                <Tag className="mr-1.5" size={12} />
                {specialty}
              </span>
            ))}
            {guide.specialties.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                +{guide.specialties.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideCard;