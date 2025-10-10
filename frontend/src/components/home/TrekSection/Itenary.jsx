'use client';
import { Mountain, MapPin,Backpack,ShieldCheck, Clock, Sun, Moon, Thermometer, CloudRain, Wind, Tent, Compass, Flag, ArrowLeft, Users, Utensils } from 'lucide-react';

const TrekItenary = ({ day, difficulty, maxAltitude, onBack }) => {
  // Weather conditions with appropriate icons
  const weatherConditions = [
    { time: 'Morning', condition: 'sunny', temp: '12°C', icon: <Sun className="h-5 w-5 text-amber-400" /> },
    { time: 'Afternoon', condition: 'cloudy', temp: '18°C', icon: <CloudRain className="h-5 w-5 text-gray-400" /> },
    { time: 'Evening', condition: 'windy', temp: '10°C', icon: <Wind className="h-5 w-5 text-blue-400" /> },
    { time: 'Night', condition: 'cold', temp: '5°C', icon: <Thermometer className="h-5 w-5 text-blue-300" /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">


      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Day Overview */}
        <div className="md:w-1/3">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-inner border border-green-100">
            <h2 className="text-2xl font-bold text-green-700 mb-2 flex items-center">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                {day.day}
              </span>
              {day.title}
            </h2>

            <p className="text-gray-600 mb-4">{day.description}</p>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Mountain className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Altitude</p>
                  <p className="text-sm font-medium">{day.altitude}</p>
                  {maxAltitude && (
                    <p className="text-xs text-gray-500 mt-1">Max: {maxAltitude}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Trek Duration</p>
                  <p className="text-sm font-medium">{day.duration}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Tent className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Accommodation</p>
                  <p className="text-sm font-medium">{day.accommodation}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Utensils className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Meals Included</p>
                  <div className="text-sm font-medium">
                    {day.meals?.map((meal, i) => (
                      <span key={i} className="block">{meal}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Compass className="h-5 w-5 text-blue-500 mr-2" />
              Weather Forecast
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {weatherConditions.map((weather, i) => (
                <div key={i} className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <div className="mr-3">
                    {weather.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{weather.time}</p>
                    <p className="text-sm font-medium capitalize">{weather.condition}</p>
                    <p className="text-xs text-gray-500">{weather.temp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Itinerary */}
        <div className="md:w-2/3">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Flag className="h-5 w-5 text-green-500 mr-2" />
              Detailed Itinerary
            </h3>

            <div className="relative">
              {/* Vertical timeline */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {[
                {
                  time: '06:00 AM',
                  title: 'Morning Start',
                  description: 'Wake up call with hot beverages. Prepare for the day ahead.'
                },
                {
                  time: '07:30 AM',
                  title: 'Breakfast',
                  description: 'Hearty breakfast to fuel your trekking day.'
                },
                {
                  time: '08:30 AM',
                  title: 'Start Trekking',
                  description: 'Begin today\'s trek section with your guide leading the way.'
                },
                {
                  time: '12:30 PM',
                  title: 'Lunch Break',
                  description: 'Stop at scenic spot for packed lunch and rest.'
                },
                {
                  time: '04:00 PM',
                  title: 'Reach Campsite',
                  description: 'Arrive at today\'s camping location and settle in.'
                },
                {
                  time: '07:00 PM',
                  title: 'Dinner & Rest',
                  description: 'Hot dinner served at dining tent. Rest for the night.'
                }
              ].map((item, i) => (
                <div key={i} className="relative pl-10 pb-6 last:pb-0 group">
                  <div className="absolute left-5 top-0 w-3 h-3 rounded-full bg-green-500 transform -translate-x-1/2 z-10 group-hover:scale-125 transition-transform"></div>
                  <div className="text-xs font-medium text-gray-500">{item.time}</div>
                  <h4 className="font-medium text-green-700 mt-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Packing List */}
          <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Backpack className="h-5 w-5 text-amber-500 mr-2" />
              Today's Essentials
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Trekking poles',
                'Water (3L)',
                'Sunscreen SPF 50+',
                'Warm layers',
                'Rain jacket',
                'Headlamp',
                'Snacks',
                'First aid kit'
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notes */}
          <div className="mt-4 bg-red-50 rounded-xl p-5 shadow-sm border border-red-100">
            <h3 className="font-semibold text-red-700 mb-3 flex items-center">
              <ShieldCheck className="h-5 w-5 text-red-600 mr-2" />
              Safety Notes
            </h3>
            <ul className="space-y-2 text-sm text-red-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Stay with the group at all times</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Drink water regularly to avoid altitude sickness</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Inform guide immediately if feeling unwell</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Follow designated paths to avoid dangerous terrain</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrekItenary;