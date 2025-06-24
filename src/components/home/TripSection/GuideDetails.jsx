'use client';
import { Star, Edit, MapPin, Users, Calendar, Share2, Heart, ChevronRight, ArrowRight, ArrowLeft, Hotel, Clock, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Itenary from './Itenary';

const GuideDetails = ({ guide, category, days, count = 1 }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dayByDay');
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingDay, setViewingDay] = useState(null);
  const [itenaries, setItenaries] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [errors, setErrors] = useState({});

  const numDays = Math.max(1, Number(days) || 1);
  const numPeople = Math.max(1, Number(count) || 1);
  const peopleText = category === 'couple' ? 'couple' : 'person';

  // Default package data
  const defaultPackage = {
    name: 'Basic Package',
    destination: guide.location,
    locations: ['Pahalgam', 'Gulmarg', 'Sonmarg'],
    departureTime: '09:00',
    departureAddress: 'Central Meeting Point',
    hotel: {
      name: 'Standard Hotel',
      location: 'Pahalgam',
      price: '$100/night'
    },
    activities: [
      { id: 1, name: 'City Tour', duration: '2 hours', location: 'Pahalgam' },
      { id: 2, name: 'Local Cuisine Tasting', duration: '1.5 hours', location: 'Pahalgam' }
    ]
  };

  // Initialize itenaries with default package
  useEffect(() => {
    if (itenaries.length === 0) {
      const initialItenaries = Array.from({ length: numDays }, (_, i) => ({
        dayNumber: i + 1,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        destination: defaultPackage.destination,
        location: defaultPackage.locations[i % defaultPackage.locations.length],
        departure: {
          time: defaultPackage.departureTime,
          address: defaultPackage.departureAddress
        },
        hotel: defaultPackage.hotel,
        activities: defaultPackage.activities
      }));
      setItenaries(initialItenaries);
    }
  }, [numDays]);

  // Price calculations
  const basePrice = guide.price * numDays * numPeople;
  const discount = basePrice * 0.1;
  const platformFee = 50;
  const taxes = basePrice * 0.05;
  const total = basePrice - discount + platformFee + taxes;
  const nights = numDays + 1;

  const handleSaveItenary = (dayIndex, newData) => {
    setItenaries(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], ...newData };
      return updated;
    });
    setIsEditing(false);
  };

 const handleViewDay = (dayNumber) => {
  setViewingDay(dayNumber);
  setCurrentDay(dayNumber); 
};

  const handleBackToList = () => {
    setViewingDay(null);
  };

  const handleNextTab = () => {
    if (activeTab === 'dayByDay') setActiveTab('arrivalDeparture');
    else if (activeTab === 'arrivalDeparture') setActiveTab('personalDetails');
  };
   const handleBack = () => {
    setIsEditing(false);
    setEditSection(null);
    setErrors({});
    setViewingDay(null);
  };

  const formatTimeWithAMPM = (time) => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
      {/* Part 1: Top Green Section */}
      <div className="w-full bg-white pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-r from-green-400 to-green-500 shadow-xl rounded-full px-6 py-5 flex items-center justify-between w-full max-w-4xl mx-auto">
            {/* Rating Badge */}
            <div className="absolute top-2 right-4 mr-4 flex items-center bg-white rounded-full px-3 py-1 text-xs font-medium text-gray-800 shadow-md">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 mr-1" />
              {guide.rating}
              <span className="ml-1 text-gray-500">({guide.reviews})</span>
            </div>

            {/* Left Section: Logo + Guide Info */}
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-green-100">
                <div className="text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  {guide.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="ml-4 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{guide.name}</h2>
                <div className="flex items-center text-sm text-white mt-1">
                  <MapPin className="h-4 w-4 mr-1 text-white" />
                  <span className="truncate">{guide.location}</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Info Boxes + Buttons */}
            <div className="flex items-center gap-3 -ml-10 mr-28">
              <div className="flex gap-2 mr-4">
                <div className="bg-white/90 px-3 py-2 rounded-xl text-xs text-center shadow-md backdrop-blur-sm">
                  <p className="text-gray-500">Type:</p>
                  <p className="font-semibold capitalize text-gray-800">{category}</p>
                </div>
                <div className="bg-white/90 px-3 py-2 rounded-xl text-xs text-center shadow-md backdrop-blur-sm">
                  <p className="text-gray-500">Days:</p>
                  <p className="font-semibold text-gray-800">{numDays}</p>
                </div>
                <div className="bg-white/90 px-3 py-2 rounded-xl text-xs text-center shadow-md backdrop-blur-sm">
                  <p className="text-gray-500">People:</p>
                  <p className="font-semibold text-gray-800">{numPeople}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm">
                  <Heart className="h-4 w-4 text-rose-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Main Content Section */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pt-6 pb-10 bg-[#e9ffeeee] rounded-xl p-6">
        {/* Left Section (70%) */}
        <div className="w-full lg:w-8/12">
  {/* Navigation Tabs */}
  <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 mb-3">
    {[
      { key: 'dayByDay', label: 'Day by Day' },
      { key: 'arrivalDeparture', label: 'Arrival/Departure' },
      { key: 'personalDetails', label: 'Personal Details' }
    ].map(tab => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`w-full text-center text-sm font-medium py-3 transition-all ${
          activeTab === tab.key
            ? 'text-green-600 border-b-2 border-green-600 bg-white'
            : 'text-gray-500 hover:text-gray-700 bg-gray-50'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {/* Tab Content */}
  <div className="bg-white rounded-b-xl shadow-sm px-6 py-5">
    {activeTab === 'dayByDay' && (
      <>
        <div className="flex justify-between items-center mb-5">
  <h3 className="text-lg font-semibold text-green-600 ml-5">
    {viewingDay ? `Day ${viewingDay}` : 'Your Itinerary'}
  </h3>
  {viewingDay && !isEditing && (
    <button
      onClick={() => setIsEditing(true)}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm"
    >
      Edit
    </button>
  )}
</div>

        {viewingDay ? (
          <div>
            <button
              onClick={handleBack}
              className="flex items-center text-green-600 mb-4 hover:text-green-700 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>

            <Itenary
              day={itenaries[viewingDay - 1]}
              locations={defaultPackage.locations}
              hotels={
                guide.hotelsAvailable?.map((name, i) => ({
                  id: `hotel-${i + 1}`,
                  name,
                  location: defaultPackage.locations[viewingDay % defaultPackage.locations.length],
                  price: '$100-$200/night'
                })) || []
              }
              activities={
                guide.activitiesAvailable?.map((name, i) => ({
                  id: i + 1,
                  name,
                  location: defaultPackage.locations[viewingDay % defaultPackage.locations.length],
                  duration: i % 2 === 0 ? '2 hours' : '1 hour'
                })) || []
              }
              guide={guide}
              onSave={(newData) => handleSaveItenary(viewingDay - 1, newData)}
              onCancel={() => setIsEditing(false)}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </div>
        ) : (
          <div className="flex">
            {/* Flow Chart */}
            <div className="w-1/4 pr-5">
              <div className="relative h-full">
                <div className="absolute left-1/2 top-0 h-full w-1.5 bg-gray-100 rounded-full -translate-x-1/2">
                  <div
                    className="bg-green-400 w-1.5 rounded-full transition-all duration-500"
                    style={{ height: `${(currentDay / numDays) * 100}%` }}
                  ></div>
                </div>
                <div className="h-full flex flex-col justify-between">
                  {itenaries.map((day, index) => {
                    const dayNum = index + 1;
                    const isActive = dayNum <= currentDay;
                    const isCurrent = dayNum === currentDay;
                    return (
                      <div
                        key={dayNum}
                        className="relative flex items-center justify-center cursor-pointer"
                        style={{ height: '104px' }}
                        onClick={() => {
                          setCurrentDay(dayNum);
                          handleViewDay(dayNum);
                        }}
                      >
                        <div
                          className={`absolute left-1/2 transform -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                            isCurrent
                              ? 'bg-green-500 text-white ring-4 ring-green-200 scale-110 shadow-lg'
                              : isActive
                              ? 'bg-green-400 text-white shadow-md'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {dayNum}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Day Summary Cards */}
            <div className="w-3/4 space-y-4">
              {itenaries.map((day, index) => {
                const dayNum = index + 1;
                const isCurrentDay = dayNum === currentDay;
                
                return (
                  <div
                    key={index}
                    className={`p-5 rounded-lg border transition-all group ${
                      isCurrentDay
                        ? 'border-green-300 bg-green-50 ring-1 ring-green-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    } cursor-pointer`}
                    onClick={() => {
                      setCurrentDay(dayNum);
                      handleViewDay(dayNum);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <span className={`w-7 h-7 flex items-center justify-center ${
                            isCurrentDay ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                          } rounded-full mr-3 text-sm font-semibold`}>
                            {day.dayNumber}
                          </span>
                          <span className="text-green-700 font-semibold">{day.location}</span>
                        </h4>
                        <p className="text-sm text-gray-500 mt-1.5 ml-10 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-600">{day.date}</span>
                        </p>
                      </div>
                      <button
                        className="text-green-600 hover:text-green-700 flex items-center text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDay(dayNum);
                          setViewingDay(dayNum);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>

                    {/* Icons Row */}
                    <div className="mt-4 grid grid-cols-3 gap-5 ml-10">
                      {/* Departure */}
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</p>
                          <p className="text-sm text-gray-800 mt-1">
                            {day.departure?.time && (
                              <>
                                <span className="font-medium">{formatTimeWithAMPM(day.departure.time)}</span>
                                <span className="block text-gray-600 text-sm mt-0.5">
                                  from {day.departure.address}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Hotel */}
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Hotel className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</p>
                          <p className="text-sm text-gray-800 mt-1">
                            {day.hotel?.name ? (
                              <span className="font-medium">{day.hotel.name}</span>
                            ) : (
                              <span className="text-gray-400">Not selected</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Map className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</p>
                          <p className="text-sm text-gray-800 mt-1">
                            {day.activities?.length > 0 ? (
                              <span className="font-medium">{day.activities.length} selected</span>
                            ) : (
                              <span className="text-gray-400">No activities</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="mt-5 ml-10">
                      <button
                        className={`flex items-center text-sm group ${
                          isCurrentDay ? 'text-green-700 font-medium' : 'text-green-600'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDay(dayNum);
                          handleViewDay(dayNum);
                        }}
                      >
                        <span>View details</span>
                        <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!viewingDay && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleNextTab}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm shadow-sm transition-colors"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </>
    )}

    {activeTab === 'arrivalDeparture' && (
      <div>
        <h3 className="text-lg font-semibold mb-5 text-gray-800">Arrival and Departure Details</h3>
        {/* Add your arrival/departure content here */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNextTab}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm shadow-sm transition-colors"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    )}

    {activeTab === 'personalDetails' && (
      <div>
        <h3 className="text-lg font-semibold mb-5 text-gray-800">Personal Details</h3>
        {/* Add personal detail inputs here */}
      </div>
    )}
  </div>
</div>


        {/* Right Section (30%) - Booking Summary */}
        <div className="w-full lg:w-4/12">
  <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6 border border-gray-100">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-400 to-green-500 px-5 py-3">
      <h3 className="text-white font-semibold text-base">Booking Summary</h3>
    </div>

    {/* Content */}
    <div className="p-5 space-y-5">
      {/* Date and People */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="text-sm font-medium">June 15, 2023</p>
            </div>
          </div>
          <button className="text-green-600 text-xs font-medium hover:text-green-700 transition-colors">
            Edit
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Travelers</p>
              <p className="text-sm font-medium">
                {numPeople} {peopleText}{numPeople > 1 ? 's' : ''} • {numDays} day{numDays > 1 ? 's' : ''} • {nights} nights
              </p>
            </div>
          </div>
          <button className="text-green-600 text-xs font-medium hover:text-green-700 transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-700 text-sm mb-2">Price Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Trip Price</span>
            <span className="font-medium">${basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>- ${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee</span>
            <span className="font-medium">${platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes</span>
            <span className="font-medium">${taxes.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3 mt-3">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Coupon Code */}
      <div>
        <label htmlFor="coupon" className="block text-sm text-gray-700 mb-1">Add coupon code</label>
        <div className="flex">
          <input
            type="text"
            id="coupon"
            placeholder="Enter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500 text-sm"
          />
          <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-r-md hover:bg-green-700 transition">
            Apply
          </button>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start text-sm">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 mr-2 h-4 w-4 text-green-600 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="text-gray-600 leading-snug">
          I agree to the <a href="#" className="text-green-600 hover:underline">Terms & Conditions</a> and{' '}
          <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
        </label>
      </div>

      {/* Pay Button */}
      <button
        disabled={!acceptTerms}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm text-white transition-all ${
          acceptTerms
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Pay Now • ${total.toFixed(2)}
      </button>
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default GuideDetails;