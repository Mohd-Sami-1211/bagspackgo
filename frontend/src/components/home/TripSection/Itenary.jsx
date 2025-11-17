'use client';
import { MapPin, Hotel, Clock, Rss } from 'lucide-react';

const Itenary = ({ day }) => {
  const formData = {
    destination: day.destination || '',
    location: day.location || '',
    departure: day.departure || { time: '09:00', period: 'AM', address: day.arrivalAddress || '' },
    hotel: day.hotel || null,
    activities: day.activities || []
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mt-4 space-y-4 border border-gray-100">

      {/* Destination Section */}
      <div className="flex items-start space-x-4">
        <MapPin className="h-5 w-5 text-blue-500 mt-1" />
        <div>
          <h4 className="text-sm font-medium text-gray-700">Destination</h4>
          <p className="text-sm text-gray-600 mt-0.5">
            {formData.destination || 'Not selected'}
          </p>
        </div>
      </div>

      {/* Location Section */}
      <div className="flex items-start space-x-4">
        <MapPin className="h-5 w-5 text-green-500 mt-1" />
        <div>
          <h4 className="text-sm font-medium text-gray-700">Location</h4>
          <p className="text-sm text-gray-600 mt-0.5">
            {formData.location || 'Not selected'}
          </p>
        </div>
      </div>

      {/* Departure Section */}
      <div className="flex items-start space-x-4">
        <Clock className="h-5 w-5 text-blue-500 mt-1" />
        <div>
          <h4 className="text-sm font-medium text-gray-700">Departure Details</h4>
          <p className="text-sm text-gray-600 mt-0.5">
            {formData.departure?.time} {formData.departure?.period} from{' '}
            {formData.departure?.address || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Hotel Section */}
      <div className="flex items-start space-x-4">
        <Hotel className="h-5 w-5 text-amber-500 mt-1" />
        <div>
          <h4 className="text-sm font-medium text-gray-700">Hotel Stay</h4>
          <p className="text-sm text-gray-600 mt-0.5">
            {formData.hotel ? `${formData.hotel.name} (${formData.hotel.price})` : 'Not selected'}
          </p>
        </div>
      </div>

      {/* Activities Section */}
      <div className="flex items-start space-x-4">
        <Rss className="h-5 w-5 text-purple-500 mt-1" />
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Activities</h4>
          {formData.activities?.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
              {formData.activities.map(activity => (
                <li key={activity.id}>
                  {activity.name} ({activity.duration})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No activities selected</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Itenary;
