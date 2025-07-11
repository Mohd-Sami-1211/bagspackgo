'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Edit, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Hotel, 
  Map, 
  User, 
  Mail, 
  Phone,
  CreditCard,
  Star
} from 'lucide-react';

const ReviewJourney = ({ guide, tripData, searchParams }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('itinerary');

  // Safely extract URL parameters with defaults
  const category = searchParams?.get('category') || 'individual';
  const days = parseInt(searchParams?.get('days')) || 1;
  const count = parseInt(searchParams?.get('count')) || 1;
  const dateParam = searchParams?.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();

  // Safely destructure tripData with fallbacks
  const { 
    itenaries = [], 
    arrivalDeparture = {
      arrival: {},
      departure: {}
    }, 
    personalDetails = {
      contactDetails: {},
      personalDetails: [],
      children: []
    }
  } = tripData || {};

  // Calculate payment details safely
  const calculatePayment = () => {
    if (!guide?.price) return {
      basePrice: 0,
      discount: 0,
      platformFee: 0,
      taxes: 0,
      total: 0
    };
    
    const basePrice = guide.price * days * count;
    const discount = basePrice * 0.1;
    const platformFee = 50;
    const taxes = basePrice * 0.05;
    const total = basePrice - discount + platformFee + taxes;
    
    return {
      basePrice,
      discount,
      platformFee,
      taxes,
      total
    };
  };

  const paymentDetails = calculatePayment();

  const handleEditSection = (section) => {
    router.push(`/trip/guidelist/tripdetails/${guide?.id}?category=${category}&days=${days}&count=${count}&date=${date.toISOString()}#${section}`);
  };

  const handleMakePayment = () => {
    // Payment processing logic
    alert('Redirecting to payment gateway...');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'itinerary':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* Itinerary section content */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Trip Itinerary</h3>
              <button 
                onClick={() => handleEditSection('itinerary')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </button>
            </div>

            {/* Guide and Trip Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-700">Guide Details</h4>
                {guide ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">
                        {guide.name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{guide.name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" /> {guide.location}
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-400 mr-1" />
                        <span className="text-sm">{guide.rating} ({guide.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No guide information available</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-700">Trip Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Travelers</p>
                      <p className="font-medium">
                        {count} {category === 'couple' ? 'couple' : 'person'}{count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">
                        {days} day{days > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hotel className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Nights</p>
                      <p className="font-medium">
                        {days} night{days > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day-wise Plan */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-700">Day-wise Plan</h4>
              {itenaries.length > 0 ? (
                itenaries.map((day, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium text-gray-800">
                        Day {day.dayNumber}: {day.location}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {day.rawDate ? new Date(day.rawDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'Date not specified'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" /> Departure
                        </h6>
                        <p className="text-sm text-gray-700">
                          {day.departure?.time || 'Not specified'} from {day.departure?.address || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <h6 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                          <Hotel className="h-4 w-4 mr-2 text-amber-500" /> Accommodation
                        </h6>
                        <p className="text-sm text-gray-700">
                          {day.hotel?.name || 'Not selected'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                        <Map className="h-4 w-4 mr-2 text-purple-500" /> Activities
                      </h6>
                      <ul className="space-y-1">
                        {day.activities?.length > 0 ? (
                          day.activities.map((activity, i) => (
                            <li key={i} className="flex items-center text-sm text-gray-700">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {activity.name} ({activity.duration})
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No activities selected</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No itinerary information available</p>
              )}
            </div>
          </div>
        );
      
      case 'arrivalDeparture':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Arrival & Departure</h3>
              <button 
                onClick={() => handleEditSection('arrivalDeparture')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                    1
                  </span>
                  Arrival Details
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{arrivalDeparture.arrival?.city || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pickup Address</p>
                    <p className="font-medium">{arrivalDeparture.arrival?.pickupAddress || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {arrivalDeparture.arrival?.date ? 
                        new Date(arrivalDeparture.arrival.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 
                        'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{arrivalDeparture.arrival?.time || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                    2
                  </span>
                  Departure Details
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{arrivalDeparture.departure?.city || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Drop-off Address</p>
                    <p className="font-medium">{arrivalDeparture.departure?.dropoffAddress || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {arrivalDeparture.departure?.date ? 
                        new Date(arrivalDeparture.departure.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 
                        'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{arrivalDeparture.departure?.time || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personalDetails':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Personal Details</h3>
              <button 
                onClick={() => handleEditSection('personalDetails')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </button>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mr-3">
                    1
                  </span>
                  Contact Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{personalDetails.contactDetails?.email || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{personalDetails.contactDetails?.mobile || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mr-3">
                    2
                  </span>
                  Traveler Details
                </h4>
                
                <div className="space-y-4">
                  {personalDetails.personalDetails?.length > 0 ? (
                    personalDetails.personalDetails.map((traveler, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h5 className="font-medium text-gray-800 mb-2">
                          Traveler {index + 1}: {traveler.name || 'Name not specified'}
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium capitalize">{traveler.gender || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium">{traveler.age || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nationality</p>
                            <p className="font-medium">{traveler.nationality || 'Not specified'}</p>
                          </div>
                          {traveler.idType && (
                            <div>
                              <p className="text-sm text-gray-500">ID Proof</p>
                              <p className="font-medium">{traveler.idType}: {traveler.idNumber || 'Not specified'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No traveler information available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Payment Details</h3>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Price Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">${paymentDetails.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${paymentDetails.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium">${paymentDetails.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">${paymentDetails.taxes.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${paymentDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Payment Method</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border border-green-300 bg-green-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.042 3.042C6.86 5.988 9.295 5 12 5c3.86 0 7 3.141 7 7h2c0-4.962-4.037-9-9-9zm9.368 4.501l-3.042 3.042C17.14 5.988 14.705 5 12 5c-3.86 0-7 3.141-7 7H3c0-4.962 4.037-9 9-9 3.79 0 7.169 1.757 9.368 4.501zM12 8c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z"/>
                    </svg>
                    <span className="font-medium">PayPal</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-17v8h7v-2h-5V5z"/>
                    </svg>
                    <span className="font-medium">Google Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Your Journey</h1>
        <p className="text-gray-600 mt-2">Please review all the details before making payment</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          
          {/* Steps */}
          {['itinerary', 'arrivalDeparture', 'personalDetails', 'payment'].map((step, index) => {
            const isActive = activeSection === step;
            const isCompleted = ['itinerary', 'arrivalDeparture', 'personalDetails'].indexOf(activeSection) > index;
            const stepNames = {
              itinerary: 'Itinerary',
              arrivalDeparture: 'Pickup/Dropoff',
              personalDetails: 'Personal Details',
              payment: 'Payment'
            };

            return (
              <div key={step} className="flex flex-col items-center">
                <button
                  onClick={() => setActiveSection(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive || isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <span className={`mt-2 text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {stepNames[step]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      {renderSectionContent()}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {activeSection !== 'itinerary' ? (
          <button
            onClick={() => {
              const sections = ['itinerary', 'arrivalDeparture', 'personalDetails', 'payment'];
              const currentIndex = sections.indexOf(activeSection);
              setActiveSection(sections[currentIndex - 1]);
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain flex space-between
        )}

        {activeSection !== 'payment' ? (
          <button
            onClick={() => {
              const sections = ['itinerary', 'arrivalDeparture', 'personalDetails', 'payment'];
              const currentIndex = sections.indexOf(activeSection);
              setActiveSection(sections[currentIndex + 1]);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            Next
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleMakePayment}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            Make Payment
            <CreditCard className="h-5 w-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewJourney;