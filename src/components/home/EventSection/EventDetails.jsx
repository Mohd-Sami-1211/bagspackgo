'use client';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Calendar,
  Star,
  User,
  Ticket,
  ChevronRight,
  Info,
  AlertCircle,
  Map,
  List,
  DollarSign,
  Users,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Smile,
  ArrowLeft,
  Mail,Phone,Upload
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EventDetails = ({ event, guides }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [bookingSlots, setBookingSlots] = useState(1);
  const [bookingStep, setBookingStep] = useState(1);
const [formData, setFormData] = useState({
  contactDetails: {
    email: '',
    phone: ''
  },
  participants: Array(bookingSlots).fill().map(() => ({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    country: '',
    address: '',
    idType: '',
    idNumber: '',
    idPhoto: null
  }))
});
const handleContactChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    contactDetails: {
      ...prev.contactDetails,
      [field]: value
    }
  }));
};
const handleParticipantChange = (index, field, value) => {
  setFormData(prev => {
    const newParticipants = [...prev.participants];
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value
    };
    return { ...prev, participants: newParticipants };
  });
};

const handleFileUpload = (index, field, file) => {
  setFormData(prev => {
    const newParticipants = [...prev.participants];
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: file
    };
    return { ...prev, participants: newParticipants };
  });
};

// Update when bookingSlots changes
useEffect(() => {
  setFormData(prev => {
    const currentLength = prev.participants.length;
    if (bookingSlots > currentLength) {
      // Add new empty participants
      const newParticipants = [...prev.participants];
      for (let i = currentLength; i < bookingSlots; i++) {
        newParticipants.push({
          name: '',
          email: '',
          phone: '',
          age: '',
          gender: '',
          bloodGroup: '',
          country: '',
          address: '',
          idType: '',
          idNumber: '',
          idPhoto: null
        });
      }
      return { ...prev, participants: newParticipants };
    } else if (bookingSlots < currentLength) {
      // Remove extra participants
      return { ...prev, participants: prev.participants.slice(0, bookingSlots) };
    }
    return prev;
  });
}, [bookingSlots]);
  const bookingSectionRef = useRef(null);
  const matchedGuide = guides?.find(g => g.id === event.eventId);
  
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Fix for page reload showing no content
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#book') {
      setActiveTab('book');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (bookingStep === 1) {
      setBookingStep(2);
      setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // Process booking
      alert(`Booking confirmed for ${bookingSlots} slots!`);
      router.push('/');
    }
  };

  const handleBookNowClick = () => {
    setActiveTab('book');
    setTimeout(() => {
      bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const itinerary = [
    { time: '09:00 AM', activity: 'Meet at designated location', description: 'Our guide will meet you at the main entrance' },
    { time: '09:30 AM', activity: 'Introduction and safety briefing', description: 'Learn about the event and safety procedures' },
    { time: '10:00 AM', activity: 'Main activity session', description: 'Engage in the primary event activities' },
    { time: '12:30 PM', activity: 'Lunch break', description: 'Enjoy local cuisine at a selected restaurant' },
    { time: '02:00 PM', activity: 'Secondary activities', description: 'Participate in additional experiences' },
    { time: '04:30 PM', activity: 'Closing ceremony', description: 'Wrap up and farewells' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-8 -mt-16 shadow-lg rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 mb-16">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 -mt-4"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Event Image */}
          <div className="w-full md:w-1/2 lg:w-2/3 rounded-xl overflow-hidden shadow-lg relative bg-white">
            <img
              src={event.image || '/images/EventCover.webp'}
              alt={event.name}
              className="w-full h-64 md:h-96 object-cover"
              onError={(e) => {
                e.target.src = '/images/events/default.jpg';
              }}
            />
            
            {/* Booking Button */}
            <div className="absolute mt-1.5 left-4 right-4">
              <button
                onClick={handleBookNowClick}
                className="w-full bg-green-500 hover:bg-green-700 text-white py-1.5 px-6 rounded-lg font-semibold transition-all  flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/30"
              >
                <Ticket className="w-5 h-5" />
                <span className="text-lg">Book Now</span>
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{event.name}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <User size={16} className="text-blue-500 mr-1" />
                  <span className="text-sm">{matchedGuide?.name || "Local Guide"}</span>
                </p>
              </div>
              <div className="flex items-center bg-yellow-100 text-yellow-700 text-sm font-semibold px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                {event.rating}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Calendar className="text-blue-500 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="text-green-500 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{event.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="text-purple-500 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium capitalize">{event.destinationId}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Ticket className="text-amber-500 mr-3 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="font-medium">
                    {event.slotsLeft} slots remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Additional quick actions */}
            <div className="mt-auto space-y-3">
              <button className="w-full flex items-center justify-center gap-2 border border-blue-500 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg font-medium transition-colors">
                <Map className="w-4 h-4" />
                View Location Map
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className='bg-white/90 px-6 py-2 shadow-lg rounded-2xl'>
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['details', 'itinerary', 'info', 'book'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab === 'details' && 'Event Details'}
                {tab === 'itinerary' && 'Itinerary'}
                {tab === 'info' && 'Important Info'}
                {tab === 'book' && 'Book Now'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          {/* Details Tab */}
           {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About This Event</h2>
                <p className="text-gray-700 mb-6">{event.description || "This exciting event offers a unique opportunity to experience the local culture and activities. Our expert guides will ensure you have a memorable time while learning about the area's history and traditions."}</p>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Highlights</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {[
                    "Expert local guide",
                    "Small group experience",
                    "All necessary equipment provided",
                    "Local snacks included",
                    "Photo opportunities",
                    "Eco-friendly practices"
                  ].map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="text-green-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-3">What's Included</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-500 w-4 h-4 mr-2" />
                      <span>Professional guide services</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-500 w-4 h-4 mr-2" />
                      <span>All necessary equipment</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-500 w-4 h-4 mr-2" />
                      <span>Bottled water and snacks</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-blue-500 w-4 h-4 mr-2" />
                      <span>Local taxes and fees</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Map className="text-green-500 w-5 h-5 mr-2" />
                    Meeting Point
                  </h3>
                  <p className="text-gray-700 mb-4">{event.meetingPoint || "Main entrance of the city park, near the fountain. Look for our guide wearing the company t-shirt."}</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                    View on map <ChevronRight className="w-4 h-4 ml-1" />
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="text-purple-500 w-5 h-5 mr-2" />
                      Group Size
                    </h3>
                    <p className="text-gray-700">Maximum of {event.maxGroupSize || 12} participants to ensure a personalized experience.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-green-500 mb-2">Detailed Itinerary</h2>
              <p className="text-gray-600 mb-6">Here's what you can expect during this event:</p>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-green-200"></div>
                
                {itinerary.map((item, index) => (
                  <div key={index} className="relative pl-16 pb-6 group">
                    {/* Timeline dot */}
                    <div className="absolute left-5 top-10 w-5 h-5 rounded-full bg-green-500 border-4 border-green-100 transform -translate-x-1/2 z-10"></div>
                    
                    <div className="bg-green-50 p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{item.activity}</h3>
                        <span className="bg-white text-black text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-4">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Info Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="text-yellow-500 w-6 h-6 mr-2" />
                  Important Information
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="font-semibold text-yellow-800 mb-2">Cancellation Policy</h3>
                    <p className="text-yellow-700 text-sm">
                      Full refund available if cancelled at least 48 hours before the event. No refunds for cancellations within 48 hours of the event.
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="font-semibold text-red-800 mb-2">Restrictions</h3>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Not recommended for travelers with serious medical conditions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Minimum age requirement of 12 years</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Not wheelchair accessible</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-2">What to Bring</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Comfortable walking shoes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Weather-appropriate clothing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Sunscreen and hat</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Camera or smartphone</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Info className="text-blue-500 w-6 h-6 mr-2" />
                  Frequently Asked Questions
                </h2>
                
                <div className="space-y-4">
                  {[
                    {
                      question: "Is transportation included?",
                      answer: "No, transportation to the meeting point is not included. Please plan to arrive 15 minutes before the scheduled start time."
                    },
                    {
                      question: "What happens if it rains?",
                      answer: "The event will proceed in light rain. In case of severe weather, we will contact you to reschedule or provide a full refund."
                    },
                    {
                      question: "Can I bring my children?",
                      answer: "Children aged 12 and above are welcome when accompanied by an adult. Please note the event may not be suitable for younger children."
                    },
                    {
                      question: "Are there vegetarian meal options?",
                      answer: "Yes, vegetarian options are available. Please inform us of any dietary restrictions when booking."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors font-medium">
                        {faq.question}
                      </button>
                      <div className="p-4 text-gray-700">
                        {faq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Tab */}
          {/* Booking Tab */}
{activeTab === 'book' && (
  <div ref={bookingSectionRef} className="max-w-7xl mx-auto -mt-8">
    <div className="bg-white shadow-lg overflow-hidden border border-gray-100">
      {/* Booking Steps Indicator */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className={`flex-1 py-4 text-center font-medium ${bookingStep === 1 ? 'text-green-600 border-b-2 border-green-600 bg-white' : 'text-gray-500'}`}>
          <div className="flex items-center justify-center gap-2">
            {bookingStep > 1 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">1</span>
            )}
            Select Options
          </div>
        </div>
        <div className={`flex-1 py-4 text-center font-medium ${bookingStep === 2 ? 'text-green-600 border-b-2 border-green-600 bg-white' : 'text-gray-500'}`}>
          <div className="flex items-center justify-center gap-2">
            {bookingStep > 2 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <span className={`w-5 h-5 rounded-full ${bookingStep >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} flex items-center justify-center`}>2</span>
            )}
            Your Details
          </div>
        </div>
      </div>

      {bookingStep === 1 ? (
        <div className="p-6 md:p-8 bg-gradient-to-br from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Booking Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Summary */}
            <div className="bg-white/90 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Ticket className="text-green-500 w-5 h-5" />
                Event Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-medium">{event.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meeting Point</p>
                  <p className="font-medium">{event.meetingPoint || "Main city park entrance"}</p>
                </div>
              </div>
            </div>

            {/* Booking Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="text-purple-500 w-5 h-5" />
                Participants
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Price per person</p>
                    <p className="text-xl font-bold text-green-600">₹{event.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setBookingSlots(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="mx-4 text-lg font-medium">{bookingSlots}</span>
                    <button 
                      onClick={() => setBookingSlots(prev => Math.min(event.slotsLeft, prev + 1))}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{(event.price * bookingSlots).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">₹{(event.price * bookingSlots * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">
                      ₹{Math.round(event.price * bookingSlots * 1.18).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setBookingStep(2)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-8 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
            >
              Continue to Booking
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 md:p-8 bg-gradient-to-br from-green-50 to-blue-50 ">
          
          <div className="flex flex-col lg:flex-row gap-8 -mt-2">
            {/* Left Column - Contact Form */}
            <div className="lg:w-2/3">
              <div className="space-y-8">
                {/* Main Heading */}
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="h-6 w-6 text-green-600 mr-2" />
                  Participant Information
                </h3>
                
                {/* Contact Information Section */}
                <div className="bg-white/50 rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                    <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
                      1
                    </span>
                    Primary Contact Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label htmlFor="primary-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="primary-email"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div>
                      <label htmlFor="primary-phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="primary-phone"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                          placeholder="9876543210"
                          maxLength="10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participant Details Section */}
                <div className="bg-white/50 rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                    <span className="w-7 h-7 flex items-center justify-center bg-white text-green-800 rounded-full mr-3">
                      2
                    </span>
                    Participant Details ({bookingSlots} {bookingSlots === 1 ? 'Person' : 'People'})
                  </h4>

                  {Array.from({ length: bookingSlots }).map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-5 mb-6 bg-white">
                      <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <User className="h-5 w-5 text-green-600 mr-2" />
                        Participant {index + 1}
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                            required
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                            placeholder="Enter age"
                            min="1"
                            max="100"
                            required
                          />
                        </div>

                        {/* Blood Group */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Blood Group <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                            required
                          >
                            <option value="">Select blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                            required
                          >
                            <option value="">Select country</option>
                            <option value="India">India</option>
                            <option value="USA">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                            placeholder="Full address"
                            required
                          />
                        </div>

                        {/* ID Proof Section */}
                        <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Identification Proof <span className="text-red-500">*</span>
                          </label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* ID Type */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                                required
                              >
                                <option value="">Select ID type</option>
                                <option value="passport">Passport</option>
                                <option value="aadhaar">Aadhaar Card</option>
                                <option value="driving-license">Driving License</option>
                                <option value="pan-card">PAN Card</option>
                              </select>
                            </div>
                            
                            {/* ID Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                                placeholder="ID number"
                                required
                              />
                            </div>
                            
                            {/* ID Upload */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload ID <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <label className="flex flex-col items-center justify-center w-full h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                  <div className="flex items-center justify-center px-4 py-2">
                                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">Choose file</span>
                                  </div>
                                  <input type="file" className="hidden" required />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Security Section */}
                <div className="bg-green-200/40 rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <ShieldCheck className="h-5 w-5 text-blue-500 mr-2" />
                    Payment Security
                  </h4>
                  <p className="text-sm text-black">
                    Your payment is processed securely using 256-bit SSL encryption. We never store your credit card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3 mt-16">
              <div className="sticky top-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <List className="text-amber-500 w-5 h-5" />
                    Order Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event</span>
                      <span className="font-medium text-right">{event.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants</span>
                      <span className="font-medium">{bookingSlots}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{(event.price * bookingSlots).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Taxes (18%)</span>
                        <span className="font-medium">₹{(event.price * bookingSlots * 0.18).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-green-600">
                          ₹{Math.round(event.price * bookingSlots * 1.18).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleBooking}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Confirm & Pay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
        </motion.div>
        
      </div>
    </div>
);
};

export default EventDetails;