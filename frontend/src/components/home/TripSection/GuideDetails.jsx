'use client';
import { Star, Edit, MapPin, Users, Calendar, Share2, Heart, ChevronRight, ArrowRight, ArrowLeft, Hotel, Clock, Map, Utensils, Car, ShieldCheck, Mountain } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Itenary from 'frontend/src/components/home/TripSection/Itenary';
import ArrDep from 'frontend/src/components/home/TripSection/Arr-Dep';
import PersonalDetails from 'frontend/src/components/home/TripSection/PersonalDetails';

const GuideDetails = ({ guide }) => {
  const searchParams = useSearchParams();
  
  // Get parameters from URL with validation
  const category = ['individual', 'couple', 'group'].includes(searchParams.get('category')) 
    ? searchParams.get('category') 
    : 'individual';
  const days = Math.max(1, parseInt(searchParams.get('days')) || 1);
  const count = Math.max(1, parseInt(searchParams.get('count')) || 1);
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime()) 
    ? new Date(dateParam) 
    : new Date();

  // Calculate derived values
  const numDays = Math.max(1, Number(days) || 1);
  const numPeople = Math.max(1, Number(count) || 1);
  const peopleText = category === 'couple' ? 'couple' : 'person';
  const tripDuration = numDays;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dayByDay');
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingDay, setViewingDay] = useState(null);
  const [itenaries, setItenaries] = useState([]);
  const [editSection, setEditSection] = useState(null);
  const [errors, setErrors] = useState({});
  const [arrDepCompleted, setArrDepCompleted] = useState(false);
  const [personalDetailsCompleted, setPersonalDetailsCompleted] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(date);

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
  const [arrivalDepartureData, setArrivalDepartureData] = useState({
  arrival: {
    city: '',
    pickupAddress: '',
    date: '',
    time: ''
  },
  departure: {
    city: '',
    dropoffAddress: '',
    date: '',
    time: ''
  }
});
const [personalDetailsData, setPersonalDetailsData] = useState({
  contactDetails: {},
  personalDetails: [],
  children: []
});

  // Initialize itineraries with correct dates
  useEffect(() => {
    // Ensure we have a valid date
    const startDate = selectedStartDate && !isNaN(selectedStartDate.getTime()) 
      ? new Date(selectedStartDate) 
      : new Date();

    const initialItenaries = Array.from({ length: numDays }, (_, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      
      return {
        dayNumber: i + 1,
        date: dayDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        rawDate: dayDate, // Store the Date object for calculations
        destination: defaultPackage.destination,
        location: defaultPackage.locations[i % defaultPackage.locations.length],
        departure: {
          time: defaultPackage.departureTime,
          address: defaultPackage.departureAddress
        },
        hotel: defaultPackage.hotel,
        activities: defaultPackage.activities
      };
    });
    setItenaries(initialItenaries);
  }, [numDays, selectedStartDate]);

  const [bookingData, setBookingData] = useState({
    category: 'individual',
    count: 1,
    personalDetails: null
  });
  const [step, setStep] = useState(1);

   const handleSavePersonalDetails = (data) => {
  setPersonalDetailsData(data);
  setPersonalDetailsCompleted(true);
};
  const basePrice = guide.price * numDays * numPeople;
  const discount = basePrice * 0.1;
  const platformFee = 50;
  const taxes = basePrice * 0.05;
  const total = basePrice - discount + platformFee + taxes;
  const nights = numDays + 1;

    const packageInclusions = [
    {
      icon: <Utensils className="h-5 w-5 text-green-600" />,
      title: "Food",
      description: "All meals included (Breakfast, Lunch & Dinner)",
      items: ["Vegetarian & Non-veg options", "Local cuisine experience", "Bottled water"]
    },
    {
      icon: <Car className="h-5 w-5 text-green-600" />,
      title: "Transport",
      description: "Comfortable private transportation",
      items: ["AC Vehicle", "Pickup/Drop from airport", "All inter-city transfers"]
    },
    {
      icon: <Hotel className="h-5 w-5 text-green-600" />,
      title: "Accommodation",
      description: "Quality stays included",
      items: ["3-4 Star Hotels", "Daily housekeeping", "All taxes included"]
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
      title: "Guidance",
      description: "Complete experienced guidance",
      items: ["Local expert guide", "24/7 support", "Trip planning assistance"]
    },
    {
      icon: <Mountain className="h-5 w-5 text-green-600" />,
      title: "Explorations",
      description: "Curated experiences included",
      items: ["City tours", "Cultural experiences", "Adventure activities"]
    }
  ];

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
    if (activeTab === 'dayByDay' && !viewingDay) {
      setActiveTab('arrivalDeparture');
    } else if (activeTab === 'arrivalDeparture' && arrDepCompleted) {
      setActiveTab('personalDetails');
    } 
  };

  const handleBack = () => {
    if (activeTab === 'arrivalDeparture') {
      setActiveTab('dayByDay');
    } else if (activeTab === 'personalDetails') {
      setActiveTab('arrivalDeparture');
    } else {
      setIsEditing(false);
      setEditSection(null);
      setErrors({});
      setViewingDay(null);
    }
  };

const handleArrDepSubmit = (data) => {
  const newStartDate = new Date(data.startDate);
  setSelectedStartDate(newStartDate);
  setArrivalDepartureData(data);
  setArrDepCompleted(true);
  setActiveTab('personalDetails');
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

  const isTabDisabled = (tabKey) => {
    switch (tabKey) {
      case 'arrivalDeparture':
        return false;
      case 'personalDetails':
        return !arrDepCompleted;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
      <div className="w-full bg-white pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-green-300 shadow-xl rounded-full px-6 py-5 flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="absolute top-2 right-4 mr-4 flex items-center bg-white rounded-full px-3 py-1 text-xs font-medium text-gray-800 shadow-md">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 mr-1" />
              {guide.rating}
              <span className="ml-1 text-gray-500">({guide.reviews})</span>
            </div>

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

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pt-6 pb-10 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
        <div className="w-full lg:w-8/12">
          <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 mb-1.5">
            {[
              { key: 'dayByDay', label: 'Day by Day' },
              { key: 'arrivalDeparture', label: 'Arrival/Departure' },
              { key: 'personalDetails', label: 'Personal Details' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => !isTabDisabled(tab.key) && setActiveTab(tab.key)}
                className={`w-full text-center text-sm font-medium py-3 transition-all ${
                  activeTab === tab.key
                    ? 'text-green-600 border-b-2 border-green-600 bg-white'
                    : isTabDisabled(tab.key)
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                }`}
                disabled={isTabDisabled(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-b-xl shadow-sm px-6 py-5">
            {activeTab === 'dayByDay' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-green-500 ml-5">
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
                                    isCurrentDay ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'
                                  } rounded-full mr-3 text-sm font-semibold`}>
                                    {day.dayNumber}
                                  </span>
                                  <span className="text-green-600 font-semibold">{day.location}</span>
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

                            <div className="mt-4 grid grid-cols-3 gap-5 ml-10">
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
                      className="px-4 py-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center text-sm shadow-sm transition-colors"
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'arrivalDeparture' && (
              <div>
                <ArrDep 
                  defaultDestination={guide.location}
                  onNext={handleArrDepSubmit}
                  onBack={handleBack}
                  startDate={selectedStartDate}
                  duration={tripDuration}
                />
              </div>
            )}

            {activeTab === 'personalDetails' && (
              <div>
                <PersonalDetails
                  category={category}
                  count={count}
                  onSave={handleSavePersonalDetails}
                  onNext={handleNextTab}
                />
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                 <button
  type="button"
  onClick={() => {
    // Prepare all trip data with proper structure
    const tripData = {
      itenaries: itenaries,
      arrivalDeparture: arrivalDepartureData,
      personalDetails: {
        contactDetails: personalDetailsData.contactDetails || {},
        personalDetails: personalDetailsData.personalDetails || [],
        children: personalDetailsData.children || []
      },
      guide: guide,
      tripConfig: {
        category,
        days: numDays,
        count: numPeople,
        date: dateParam
      }
    };

    // Store in localStorage
    localStorage.setItem('tripData', JSON.stringify(tripData));

    // Navigate to review page
    router.push(
      `/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney?category=${category}&days=${numDays}&count=${numPeople}&date=${dateParam}`
    );
  }}
  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm hover:shadow-md"
>
  Review Journey
  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-4/12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-12">
          <div className=" px-5 py-3">
            <h2 className="text-green-500 font-semibold text-base">What's Included</h2>
          </div>
          
          <div className="p-5">
            <div className="space-y-5">
              {packageInclusions.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg mr-4">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <ul className="mt-2 space-y-1">
                      {item.items.map((detail, i) => (
                        <li key={i} className="flex items-start text-xs text-gray-500">
                          <svg className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Activities Included</h4>
              <div className="flex flex-wrap gap-2">
                {guide.activitiesAvailable?.slice(0, 6).map((activity, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                    {activity}
                  </span>
                ))}
                {guide.activitiesAvailable?.length > 6 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{guide.activitiesAvailable.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

          
        </div>
      </div>
    </div>
  );
};

export default GuideDetails;