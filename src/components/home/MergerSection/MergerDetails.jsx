'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, User, ArrowLeft, UserPlus, Map, Info, Clock, DollarSign, Mountain, Smile,BadgeInfo, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

const MergerDetails = ({ merger, guides }) => {
  const router = useRouter();
    const handleJoin = () => {
    router.push(`/user/merger/mergerdetails/${merger.id}/personaldetails`);
  };
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  
  const guide = guides.find(g => g.id === merger.guideId);
  
  const members = [
    { id: '1', name: merger.createdBy, age: 28, gender: 'Male', state: 'Maharashtra', isAdmin: true },
    { id: '2', name: 'Rahul Sharma', age: 25, gender: 'Male', state: 'Delhi', isAdmin: false },
    { id: '3', name: 'Priya Patel', age: 27, gender: 'Female', state: 'Gujarat', isAdmin: false },
    { id: '4', name: 'Amit Singh', age: 30, gender: 'Male', state: 'Uttar Pradesh', isAdmin: false },
    { id: '5', name: 'Neha Gupta', age: 26, gender: 'Female', state: 'Rajasthan', isAdmin: false }
  ];

  const gradientBg =
    merger.category === 'Female Only'
      ? 'from-pink-500 to-pink-400'
      : merger.category === 'Male Only'
      ? 'from-blue-500 to-blue-400'
      : 'from-emerald-500 to-emerald-600';

  return (
    <div ref={ref} className="max-w-7xl mx-auto px-6 py-8 mb-10 bg-gradient-to-br from-green-50 to-blue-50 -mt-16 rounded-2xl shadow-lg">

      {/* Header with scale effect on scroll */}
      <motion.div
        style={{ scale: scaleProgress }}
        className="mb-8 overflow-hidden rounded-xl -mt-2"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`bg-green-300 text-white p-6 shadow-lg relative`}
        >
          <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">{merger.location} Trip</h1>
              <p className="text-white/90">Organized by {merger.createdBy}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center border border-white/10">
              <p className="text-xs uppercase tracking-wider">Merge ID</p>
              <p className="font-bold text-lg">{merger.id}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Members Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                <Users className="text-emerald-600" size={20} />
              </div>
              <span>Members ({merger.members})</span>
              <span className="ml-auto text-sm font-normal bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                {10 - merger.members} spots left
              </span>
            </h2>
            
            <div className="space-y-3">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="bg-emerald-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <User size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.name} {member.isAdmin && (
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded ml-2">Admin</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {member.age} yrs, {member.gender}, {member.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Heart size={14} className="mr-1 text-rose-500 fill-rose-500/20" />
                    <span>2 days ago</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Trip Description */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Info className="text-blue-600" size={20} />
              </div>
              <span>Trip Description</span>
            </h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 mb-4 leading-relaxed"
            >
              Join us for an unforgettable journey to {merger.location}. This carefully curated trip is designed for adventure seekers who want to explore the beauty of nature while making new friends. Our group is open to {merger.category === 'Female Only' ? 'female' : merger.category === 'Male Only' ? 'male' : 'all'} travelers aged 18-40.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-gray-700 leading-relaxed"
            >
              We'll be traveling together, sharing experiences, and creating memories that will last a lifetime. The trip includes accommodation, local transportation, and guided tours as per the itinerary below.
            </motion.p>
          </motion.section>

          {/* Itinerary */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <Map className="text-amber-600" size={20} />
              </div>
              <span>Trip Itinerary</span>
            </h2>
            
            {guide?.itinerary ? (
              <div className="space-y-6">
                {guide.itinerary.map((day, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50/50 rounded-r-lg"
                  >
                    <div className="flex items-center mb-1">
                      <div className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <h3 className="font-semibold text-lg">Day {index + 1}</h3>
                    </div>
                    <p className="text-gray-700 pl-9">{day}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-gray-500 italic"
              >
                Itinerary details will be shared soon by the guide.
              </motion.p>
            )}
          </motion.section>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6 sticky top-6 h-fit">
          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BadgeInfo className="text-purple-600" size={20} />
              </div>
              <span>Quick Info</span>
            </h3>
            
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center"
              >
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                  <Calendar className="text-emerald-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="font-medium">{merger.date}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-center"
              >
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Clock className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{guide?.duration || '5'} days</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-center"
              >
                <div className="p-2 bg-rose-100 rounded-lg mr-3">
                  <MapPin className="text-rose-500" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium capitalize">{merger.location}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex items-center"
              >
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <User className="text-amber-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guide</p>
                  <p className="font-medium">{guide?.name || 'Guide Not Found'}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <span>Pricing</span>
            </h3>
            
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex justify-between"
              >
                <span className="text-gray-600">Price per person:</span>
                <span className="font-medium">₹{merger.price.toLocaleString('en-IN')}</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex justify-between"
              >
                <span className="text-gray-600">Total members:</span>
                <span className="font-medium">{merger.members}</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="border-t border-gray-200 my-2"
              ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="flex justify-between text-lg font-semibold"
              >
                <span>Total:</span>
                <span className="text-emerald-600">₹{(merger.price * merger.members).toLocaleString('en-IN')}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Join Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 text-center cursor-pointer border-2 border-emerald-400/20 hover:shadow-emerald-200/40 transition-all"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <UserPlus className="mx-auto mb-3" size={24} />
            </motion.div>
            <h3 className="font-bold text-xl mb-2">Join This Merger</h3>
            <p className="text-sm mb-4 opacity-90">Only {10 - merger.members} spots left!</p>
<motion.button 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleJoin}
      className="bg-white text-emerald-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all w-full shadow-md"
    >
      Join - ₹{merger.price.toLocaleString('en-IN')}
    </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MergerDetails;