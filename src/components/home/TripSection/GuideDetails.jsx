'use client';
import { Star, MapPin, Users, Calendar, Share2, Heart, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GuideDetails = ({ guide, category, days, count = 1 }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dayByDay');
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const numDays = Math.max(1, Number(days) || 1);
  const numPeople = Math.max(1, Number(count) || 1);
  const peopleText = category === 'couple' ? 'couple' : 'person';

  // Price calculations
  const basePrice = guide.price * numDays * numPeople;
  const discount = basePrice * 0.1;
  const platformFee = 50;
  const taxes = basePrice * 0.05;
  const total = basePrice - discount + platformFee + taxes;
  const nights= numDays+1;

  return (
    <div className="max-w-7xl -mt-14 ">
      {/* Part 1: Top Green Section - constrained to parent width */}
      <div className="w-full bg-white pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-green-300 shadow-lg rounded-full px-6 py-5 flex items-center justify-between w-full max-w-4xl mx-auto">
            {/* Rating Badge - Top Right */}
            <div className="absolute top-2 right-4 flex items-center bg-white rounded-full px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm mr-4">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 mr-1" />
              {guide.rating}
              <span className="ml-1 text-gray-500 text-[11px]">({guide.reviews})</span>
            </div>

            {/* Left Section: Logo + Guide Info */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-sm font-medium text-gray-800 shrink-0">
                Logo
              </div>

              {/* Guide Info */}
              <div className="ml-4 min-w-0">
                <h2 className="text-base font-semibold text-gray-800 truncate bg-white rounded-xl mb-2 p-2">{guide.name}</h2>
                <div className="flex items-center justify-center text-sm text-black mt-0.5 bg-white rounded-xl w-full h-full">
                  <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="truncate">{guide.location}</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Info Boxes + Buttons */}
            <div className="flex items-center gap-3 -ml-10 mr-28">
              {/* Info Boxes */}
              <div className="flex gap-2 mr-4">
                <div className="bg-white px-3 py-2 rounded-xl text-xs text-center shadow-sm">
                  <p className="text-gray-400">Type:</p>
                  <p className="font-semibold capitalize">{category}</p>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl text-xs text-center shadow-sm">
                  <p className="text-gray-400">Days:</p>
                  <p className="font-semibold">{numDays}</p>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl text-xs text-center shadow-sm">
                  <p className="text-gray-400">People:</p>
                  <p className="font-semibold">{numPeople}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-200 transition-colors">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-200 transition-colors">
                  <Heart className="h-4 w-4 text-rose-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Main Content Section - constrained to parent width */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pt-6 pb-10 bg-[#e9ffeeee] rounded-xl p-6">
        {/* Left Section (70%) */}
        <div className="w-full lg:w-8/12">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
            <button
              onClick={() => setActiveTab('dayByDay')}
              className={`px-6 py-4 font-medium text-sm flex-1 text-center ${
                activeTab === 'dayByDay' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Day by Day
            </button>
            <button
              onClick={() => setActiveTab('arrivalDeparture')}
              className={`px-6 py-4 font-medium text-sm flex-1 text-center ${
                activeTab === 'arrivalDeparture' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Arrival/Departure
            </button>
            <button
              onClick={() => setActiveTab('personalDetails')}
              className={`px-6 py-4 font-medium text-sm flex-1 text-center ${
                activeTab === 'personalDetails' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Details
            </button>
          </div>

          {/* Flow Chart */}
          <div className="mt-2 p-6 bg-white rounded-b-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Your Trip Progress</h3>
            <div className="relative">
              {/* Flow line */}
              <div className="absolute left-5 top-0 h-full w-1.5 bg-gray-100 rounded-full">
                <div 
                  className="bg-green-400 w-1.5 rounded-full transition-all duration-500" 
                  style={{ height: `${(currentDay / numDays) * 100}%` }}
                ></div>
              </div>
              
              {/* Day nodes */}
              <div className="space-y-8 pl-12">
                {Array.from({ length: numDays }).map((_, index) => {
                  const dayNum = index + 1;
                  const isActive = dayNum <= currentDay;
                  const isCurrent = dayNum === currentDay;
                  
                  return (
                    <div key={dayNum} className="relative flex items-start group">
                      <div className={`absolute -left-11 top-0 flex items-center justify-center w-9 h-9 rounded-full ${
                        isCurrent 
                          ? 'bg-green-500 ring-4 ring-green-200 text-white' 
                          : isActive 
                            ? 'bg-green-400 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      } font-medium transition-all duration-300`}>
                        {dayNum}
                      </div>
                      <div 
                        className={`p-5 rounded-xl w-full border ${
                          isCurrent 
                            ? 'border-green-300 bg-green-50' 
                            : isActive 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                        } transition-all duration-300 cursor-pointer hover:shadow-sm`}
                        onClick={() => setCurrentDay(dayNum)}
                      >
                        <h4 className="font-medium text-gray-800">Day {dayNum}: {isCurrent ? 'Current' : isActive ? 'Completed' : 'Upcoming'}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {dayNum === 1 
                            ? 'Arrival and orientation meeting with your guide' 
                            : `Explore ${guide.location}'s highlights with local experiences`}
                        </p>
                        {isActive && (
                          <button className="mt-3 text-green-600 text-sm font-medium flex items-center">
                            View details <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (30%) - Booking Summary */}
        <div className="w-full lg:w-4/12">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
            {/* Header */}
            <div className="bg-green-200 px-6 py-4 border-b border-green-200">
              <h3 className="font-semibold text-gray-800">Booking Summary</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Date and People */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">June 15, 2023</p>
                  </div>
                  <button className="text-green-600 text-sm font-medium hover:text-green-700">
                    Edit
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Travelers</p>
                    <p className="font-medium">
                      {numPeople} {peopleText}{numPeople > 1 ? 's' : ''} • {numDays} day{numDays > 1 ? 's' : ''} • {nights} nights
                    </p>
                  </div>
                  <button className="text-green-600 text-sm font-medium hover:text-green-700">
                    Edit
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trip Price</span>
                    <span className="font-medium">${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform fee</span>
                    <span className="font-medium">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">${taxes.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3 mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                  Add coupon code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="coupon"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-r-lg hover:bg-green-700">
                    Apply
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-green-600 hover:underline">Terms & Conditions</a> and{' '}
                  <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Pay Button */}
              <button
                disabled={!acceptTerms}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  acceptTerms 
                    ? 'bg-green-600 hover:bg-green-700 shadow-md' 
                    : 'bg-gray-400 cursor-not-allowed'
                } transition-colors`}
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