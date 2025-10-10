'use client';
import { Star, MapPin, Users,Clock, Calendar, Share2, Heart, ChevronRight, ArrowRight, ArrowLeft, Mountain, Compass, Flag, Map, Backpack, Tent, Sun, Moon, Thermometer, CloudRain, Wind } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TrekItenary from 'frontend/src/components/home/TrekSection/Itenary';
import PickupDropoff from 'frontend/src/components/home/TrekSection/Pick-Drop';
import PersonalDetails from 'frontend/src/components/home/TrekSection/PersonalDetails';

const TrekGuideDetails = ({ guide }) => {
  const searchParams = useSearchParams();
  
  // Get parameters from URL with validation
  const trekId = searchParams.get('trekId') || '';
  const individuals = Math.max(1, parseInt(searchParams.get('individuals')) || 1);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('itenary');
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [viewingDay, setViewingDay] = useState(null);
  const [itenaries, setItenaries] = useState([]);
  const [pickupDropoffCompleted, setPickupDropoffCompleted] = useState(false);
  const [personalDetailsCompleted, setPersonalDetailsCompleted] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  // Find the specific trek package
  const trekPackage = Array.isArray(guide.trekPackages)
    ? guide.trekPackages.find(pkg => pkg?.trekId?.toString() === trekId?.toString())
    : null;

  const pricePerPerson = trekPackage?.price ?? 0;
  const duration = trekPackage?.duration ?? 'N/A';
  const totalPrice = pricePerPerson * individuals;

  // Default trek itinerary data
  const defaultTrek = {
    name: trekPackage?.name || 'Standard Trek',
    difficulty: trekPackage?.difficulty || 'Moderate',
    altitude: trekPackage?.altitude || '12,000 ft',
    baseCamp: trekPackage?.baseCamp || 'Base Camp Village',
    highlights: trekPackage?.highlights || ['Scenic views', 'Forest trail', 'Mountain summit'],
    itinerary: trekPackage?.itinerary || [
      {
        day: 1,
        title: 'Arrival at Base Camp',
        description: 'Arrive at the base camp, meet the team, and prepare for the trek',
        altitude: '8,000 ft',
        duration: '4 hours',
        meals: ['Lunch', 'Dinner'],
        accommodation: 'Guest House'
      },
      {
        day: 2,
        title: 'Base Camp to Mid Point',
        description: 'Trek through forests and cross small streams',
        altitude: '10,000 ft',
        duration: '6-7 hours',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Tents'
      },
      {
        day: 3,
        title: 'Summit Day',
        description: 'Early morning start for the summit push',
        altitude: '12,000 ft',
        duration: '8-9 hours',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Tents'
      }
    ]
  };

  // Initialize itineraries
  useEffect(() => {
    const startDate = selectedStartDate && !isNaN(selectedStartDate.getTime()) 
      ? new Date(selectedStartDate) 
      : new Date();

    const initialItenaries = defaultTrek.itinerary.map((day, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      
      return {
        ...day,
        date: dayDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        rawDate: dayDate,
      };
    });
    setItenaries(initialItenaries);
  }, [selectedStartDate]);

  const [pickupDropoffData, setPickupDropoffData] = useState({
    pickup: {
      location: '',
      address: '',
      date: '',
      time: ''
    },
    dropoff: {
      location: '',
      address: '',
      date: '',
      time: ''
    }
  });

  const [personalDetailsData, setPersonalDetailsData] = useState({
    contactDetails: {},
    personalDetails: [],
    emergencyContacts: []
  });

  const handleSavePersonalDetails = (data) => {
    setPersonalDetailsData(data);
    setPersonalDetailsCompleted(true);
  };

  const packageInclusions = [
    {
      icon: <Backpack className="h-5 w-5 text-green-600" />,
      title: "Equipment",
      description: "All necessary trekking equipment provided",
      items: ["Tents", "Sleeping bags", "Trekking poles"]
    },
    {
      icon: <Tent className="h-5 w-5 text-green-600" />,
      title: "Accommodation",
      description: "Camping during the trek",
      items: ["Quality tents", "Sleeping mats", "Dining tent"]
    },
    {
      icon: <Sun className="h-5 w-5 text-green-600" />,
      title: "Meals",
      description: "Nutritious meals during trek",
      items: ["3 meals per day", "Energy snacks", "Hot beverages"]
    },
    {
      icon: <Compass className="h-5 w-5 text-green-600" />,
      title: "Guidance",
      description: "Experienced trek leaders",
      items: ["Certified guides", "First aid trained", "Local knowledge"]
    },
    {
      icon: <Flag className="h-5 w-5 text-green-600" />,
      title: "Permits",
      description: "All necessary permits included",
      items: ["Forest permits", "Camping fees", "Entry tickets"]
    }
  ];

  const handleViewDay = (dayNumber) => {
    setViewingDay(dayNumber);
    setCurrentDay(dayNumber); 
  };

  const handleBackToList = () => {
    setViewingDay(null);
  };

  const handleNextTab = () => {
    if (activeTab === 'itenary' && !viewingDay) {
      setActiveTab('pickupDropoff');
    } else if (activeTab === 'pickupDropoff' && pickupDropoffCompleted) {
      setActiveTab('personalDetails');
    } 
  };

  const handleBack = () => {
    if (activeTab === 'pickupDropoff') {
      setActiveTab('itenary');
    } else if (activeTab === 'personalDetails') {
      setActiveTab('pickupDropoff');
    } else {
      setViewingDay(null);
    }
  };

  const handlePickupDropoffSubmit = (data) => {
    const newStartDate = new Date(data.startDate);
    setSelectedStartDate(newStartDate);
    setPickupDropoffData(data);
    setPickupDropoffCompleted(true);
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
      case 'pickupDropoff':
        return false;
      case 'personalDetails':
        return !pickupDropoffCompleted;
      default:
        return false;
    }
  };

  const weatherIcons = {
    sunny: <Sun className="h-5 w-5 text-amber-400" />,
    cloudy: <CloudRain className="h-5 w-5 text-gray-400" />,
    windy: <Wind className="h-5 w-5 text-blue-400" />,
    cold: <Thermometer className="h-5 w-5 text-blue-300" />,
    night: <Moon className="h-5 w-5 text-indigo-400" />
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
                <Mountain className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{defaultTrek.name}</h2>
                <div className="flex items-center text-sm text-white mt-1">
                  <MapPin className="h-4 w-4 mr-1 text-white" />
                  <span className="truncate">{defaultTrek.baseCamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 -ml-10 mr-28">
              <div className="flex gap-2 mr-4">
                <div className="bg-white/90 px-3 py-2 rounded-xl text-xs text-center shadow-md backdrop-blur-sm">
                  <p className="text-gray-500">Difficulty:</p>
                  <p className="font-semibold capitalize text-gray-800">{defaultTrek.difficulty}</p>
                </div>
                <div className="bg-white/90 px-3 py-2 rounded-xl text-xs text-center shadow-md backdrop-blur-sm">
                  <p className="text-gray-500">Days:</p>
                  <p className="font-semibold text-gray-800">{defaultTrek.itinerary.length}</p>
                </div>
                <div className="bg-white/90 px-3 py-2 rounded-xl text-xs text-center shadow-md backdrop-blur-sm">
                  <p className="text-gray-500">People:</p>
                  <p className="font-semibold text-gray-800">{individuals}</p>
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
              { key: 'itenary', label: 'Itinerary' },
              { key: 'pickupDropoff', label: 'Pickup/Dropoff' },
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
            {activeTab === 'itenary' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-green-500 ml-5">
                    {viewingDay ? `Day ${viewingDay}` : 'Trek Itinerary'}
                  </h3>
                </div>

                {viewingDay ? (
                  <div>
                    <button
                      onClick={handleBack}
                      className="flex items-center text-green-600 mb-4 hover:text-green-700 transition-colors text-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to itinerary
                    </button>

                    <TrekItenary 
                      day={itenaries[viewingDay - 1]} 
                      difficulty={defaultTrek.difficulty}
                      maxAltitude={defaultTrek.altitude}
                      onBack={handleBackToList}
                    />
                  </div>
                ) : (
                  <div className="flex">
                    <div className="w-1/4 pr-5">
                      <div className="relative h-full">
                        <div className="absolute left-1/2 top-0 h-full w-1.5 bg-gray-100 rounded-full -translate-x-1/2">
                          <div
                            className="bg-green-400 w-1.5 rounded-full transition-all duration-500"
                            style={{ height: `${(currentDay / itenaries.length) * 100}%` }}
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
                                    {day.day}
                                  </span>
                                  <span className="text-green-600 font-semibold">{day.title}</span>
                                </h4>
                                <p className="text-sm text-gray-500 mt-1.5 ml-10 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="font-medium text-gray-600">{day.date}</span>
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-5 ml-10">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <Mountain className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Altitude</p>
                                  <p className="text-sm text-gray-800 mt-1">
                                    <span className="font-medium">{day.altitude}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                  <Clock className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</p>
                                  <p className="text-sm text-gray-800 mt-1">
                                    <span className="font-medium">{day.duration}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                  <Tent className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stay</p>
                                  <p className="text-sm text-gray-800 mt-1">
                                    <span className="font-medium">{day.accommodation}</span>
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

            {activeTab === 'pickupDropoff' && (
              <div>
                <PickupDropoff 
                  defaultLocation={defaultTrek.baseCamp}
                  onNext={handlePickupDropoffSubmit}
                  onBack={handleBack}
                  startDate={selectedStartDate}
                  duration={defaultTrek.itinerary.length}
                />
              </div>
            )}

            {activeTab === 'personalDetails' && (
              <div>
                <PersonalDetails
                  count={individuals}
                  onSave={handleSavePersonalDetails}
                  onNext={handleNextTab}
                  isTrek={true}
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
                      // Prepare all trek data with proper structure
                      const trekData = {
                        itenaries: itenaries,
                        pickupDropoff: pickupDropoffData,
                        personalDetails: {
                          contactDetails: personalDetailsData.contactDetails || {},
                          personalDetails: personalDetailsData.personalDetails || [],
                          emergencyContacts: personalDetailsData.emergencyContacts || []
                        },
                        guide: guide,
                        trekConfig: {
                          trekId,
                          individuals,
                          date: selectedStartDate.toISOString()
                        },
                        trekDetails: defaultTrek
                      };

                      // Store in localStorage
                      localStorage.setItem('trekData', JSON.stringify(trekData));

                      // Navigate to review page
                      router.push(
                        `/user/trek/guidelist/trekdetails/${guide.id}/reviewjourney?trekId=${trekId}&individuals=${individuals}`
                      );
                    }}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm hover:shadow-md"
                  >
                    Review Trek
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-4/12">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-12">
            <div className="px-5 py-3">
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
                <h4 className="font-medium text-gray-800 mb-2">Trek Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {defaultTrek.highlights.map((highlight, i) => (
                    <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default TrekGuideDetails;