'use client';
import { useState } from 'react';
import { MapPin, Hotel, Clock, Rss, ArrowLeft } from 'lucide-react';

const Itenary = ({ 
  day, 
  locations, 
  hotels, 
  activities, 
  guide, 
  onSave, 
  onCancel,
  isEditing,
  setIsEditing
}) => {
  const [editSection, setEditSection] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    destination: day.destination || '',
    location: day.location || '',
    departure: day.departure || { time: '09:00', period: 'AM', address: day.arrivalAddress || '' },
    hotel: day.hotel || null,
    activities: day.activities || []
  });

  const allLocations = locations || [];
  const allHotels = hotels || [];
  const allActivities = activities || [];

  const handleEdit = (section) => {
    setEditSection(section);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'time') {
      setFormData(prev => ({
        ...prev,
        departure: {
          ...prev.departure,
          time: value
        }
      }));
    } else if (name === 'period') {
      setFormData(prev => ({
        ...prev,
        departure: {
          ...prev.departure,
          period: value
        }
      }));
    }
  };

  const handleHotelSelect = (hotelId) => {
    const selectedHotel = allHotels.find(hotel => hotel.id === hotelId);
    setFormData(prev => ({
      ...prev,
      hotel: selectedHotel,
      departure: {
        ...prev.departure,
        address: selectedHotel ? `${selectedHotel.name}, ${selectedHotel.location}` : prev.departure.address
      }
    }));
  };

  const handleActivityToggle = (activityId) => {
    const activity = allActivities.find(a => a.id === activityId);
    
    setFormData(prev => {
      const exists = prev.activities.some(a => a.id === activityId);
      return {
        ...prev,
        activities: exists
          ? prev.activities.filter(a => a.id !== activityId)
          : [...prev.activities, activity]
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (editSection === 'location' && !formData.location) {
      newErrors.location = 'Please select a location';
    }
    
    if (editSection === 'departure' && !formData.departure.time) {
      newErrors.departureTime = 'Please select departure time';
    }
    
    if (editSection === 'hotel' && !formData.hotel) {
      newErrors.hotel = 'Please select a hotel';
    }
    
    if (editSection === 'activities' && formData.activities.length === 0) {
      newErrors.activities = 'Please select at least one activity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const formattedData = {
      ...formData,
      departure: {
        ...formData.departure,
        time: `${formData.departure.time} ${formData.departure.period}`
      }
    };
    
    onSave(formattedData);
    setEditSection(null);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditSection(null);
    setErrors({});
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-4 border border-green-300">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Editing Day {day.dayNumber}</h3>
           
          </div>
          
          {/* Edit Destination */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Destination</h3>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              disabled
            />
          </div>

          {/* Edit Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Location</h3>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 bg-white"
            >
              <option value="">Select a location</option>
              {allLocations.map((loc, index) => (
                <option 
                  key={index} 
                  value={loc}
                  className=" hover:bg-green-50"
                >
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Edit Departure */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Departure Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    name="time"
                    value={formData.departure.time}
                    onChange={handleTimeChange}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <select
                    name="period"
                    value={formData.departure.period}
                    onChange={handleTimeChange}
                    className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="departure.address"
                  value={formData.departure.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    departure: { ...prev.departure, address: e.target.value }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Edit Hotel */}
         <div className="space-y-4">
  <h3 className="text-lg font-medium text-gray-800">Select Hotel</h3>
  <div className="relative">
    <select
      name="hotel"
      value={formData.hotel?.id || ''}
      onChange={(e) => handleHotelSelect(e.target.value)}
      className="w-full p-3 pr-8 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 bg-white appearance-none hover:border-green-400 transition-colors"
    >
      <option value="" className="text-gray-400">Select a hotel</option>
      {allHotels
        .filter(hotel => hotel.location === formData.location)
        .map(hotel => (
          <option 
            key={hotel.id} 
            value={hotel.id}
            className="hover:bg-green-50 hover:text-green-800"
          >
            {hotel.name} - {hotel.price}
          </option>
        ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
      </svg>
    </div>
  </div>
  {errors.hotel && <p className="text-red-500 text-sm mt-1">{errors.hotel}</p>}
</div>

          {/* Edit Activities */}
          <div className="space-y-4">
  <h3 className="text-lg font-medium text-gray-800">Select Activities</h3>
  <div className="relative">
    <div className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 bg-white h-auto max-h-60 overflow-y-auto">
      {allActivities
        .filter(activity => activity.location === formData.location)
        .map(activity => (
          <div key={activity.id} className="flex items-center p-2 hover:bg-green-50 rounded">
            <input
              type="checkbox"
              id={`activity-${activity.id}`}
              checked={formData.activities.some(a => a.id === activity.id)}
              onChange={() => handleActivityToggle(activity.id)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor={`activity-${activity.id}`} className="ml-3 block text-gray-700">
              {activity.name} ({activity.duration})
            </label>
          </div>
        ))}
    </div>
  </div>
</div>

          {/* Save/Cancel */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

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